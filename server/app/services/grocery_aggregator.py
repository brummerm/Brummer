from __future__ import annotations
import re
import math
from fractions import Fraction
from collections import defaultdict
from sqlalchemy.orm import Session, joinedload
from ..models.meal_plan import MealSlot, WeekPlan
from ..models.recipe import RecipeIngredient, Ingredient
from ..schemas.grocery import GroceryLineItem, GroceryListResponse

# Unit normalization map — maps variants → canonical form
UNIT_NORM: dict[str, str] = {
    "cups": "cup", "cup": "cup", "c.": "cup", "c": "cup",
    "tablespoons": "tbsp", "tablespoon": "tbsp", "tbsp": "tbsp", "tbs": "tbsp",
    "teaspoons": "tsp", "teaspoon": "tsp", "tsp": "tsp",
    "ounces": "oz", "ounce": "oz", "oz": "oz",
    "grams": "g", "gram": "g", "g": "g",
    "kilograms": "kg", "kilogram": "kg", "kg": "kg",
    "milliliters": "ml", "milliliter": "ml", "ml": "ml",
    "liters": "l", "liter": "l", "l": "l",
    "pounds": "lb", "pound": "lb", "lbs": "lb", "lb": "lb",
    "cloves": "clove", "clove": "clove",
    "slices": "slice", "slice": "slice",
    "pieces": "piece", "piece": "piece",
    "whole": "whole",
    "cans": "can", "can": "can",
    "": "",
}

CATEGORY_ORDER = ["Produce", "Meat & Seafood", "Dairy & Eggs", "Bakery", "Frozen", "Pantry", "Beverages", "Other"]

# Map legacy/variant category names to canonical names in CATEGORY_ORDER
CATEGORY_ALIASES: dict[str, str] = {
    "Meat": "Meat & Seafood",
    "Seafood": "Meat & Seafood",
    "Dairy": "Dairy & Eggs",
    "Eggs": "Dairy & Eggs",
}

# Common pantry staples excluded from the grocery list
STAPLES: frozenset[str] = frozenset({
    # Oils & fats
    "olive oil", "extra virgin olive oil", "vegetable oil", "canola oil",
    "cooking oil", "oil", "butter", "unsalted butter", "salted butter", "margarine",
    "nonstick spray", "cooking spray",
    # Salt & pepper
    "salt", "kosher salt", "sea salt", "table salt", "coarse salt",
    "pepper", "black pepper", "white pepper", "ground black pepper",
    "ground pepper", "freshly ground pepper",
    # Flour & starches
    "flour", "all-purpose flour", "bread flour", "cake flour",
    "whole wheat flour", "cornstarch", "corn starch", "arrowroot",
    # Leavening & baking
    "baking powder", "baking soda", "yeast", "active dry yeast",
    "instant yeast", "dry yeast",
    # Sugar & sweeteners
    "sugar", "white sugar", "granulated sugar", "brown sugar",
    "powdered sugar", "confectioners sugar", "honey", "maple syrup",
    "vanilla", "vanilla extract",
    # Water
    "water", "cold water", "warm water",
    # Common dried spices
    "cumin", "ground cumin", "paprika", "smoked paprika",
    "oregano", "dried oregano", "thyme", "dried thyme",
    "rosemary", "dried rosemary", "basil", "dried basil",
    "bay leaf", "bay leaves", "cinnamon", "ground cinnamon",
    "nutmeg", "ground nutmeg", "garlic powder", "onion powder",
    "chili powder", "cayenne", "cayenne pepper", "turmeric",
    "ground turmeric", "coriander", "ground coriander",
    "cumin seeds", "red pepper flakes", "dried red pepper flakes",
    "italian seasoning", "mixed herbs",
    # Vinegars & condiments
    "vinegar", "white vinegar", "apple cider vinegar",
    "balsamic vinegar", "red wine vinegar", "rice vinegar",
    "soy sauce", "worcestershire sauce", "fish sauce",
})


# Prep/descriptor words stripped from ingredient names before grouping
PREP_WORDS: frozenset[str] = frozenset({
    # Cuts & knife work
    "diced", "chopped", "minced", "sliced", "shredded", "grated",
    "crushed", "peeled", "trimmed", "halved", "quartered", "julienned",
    "cubed", "torn", "roughly", "finely", "thinly", "coarsely",
    # Cooking state
    "cooked", "uncooked", "boiled", "steamed", "roasted", "fried",
    "softened", "melted", "beaten", "divided", "rinsed", "drained",
    "toasted", "charred", "sauteed", "blanched", "grilled",
    # Preservation / form
    "fresh", "dried", "frozen", "thawed", "canned", "bottled", "packed",
    "raw", "optional", "separated",
    # Size / shape
    "large", "medium", "small", "mini", "baby", "thin", "thick", "flat",
    # Meat / protein modifiers
    "boneless", "skinless", "lean", "ground",
    # Count/measure words that appear in ingredient names rather than the unit field
    "clove", "cloves",     # "garlic cloves"  → "garlic"
    "sprig", "sprigs",     # "thyme sprigs"   → "thyme"
    "stalk", "stalks",     # "celery stalks"  → "celery"
    "leaf", "leaves",      # "bay leaves"     → "bay"
    "head", "heads",       # "garlic head"    → "garlic"
    "slice", "slices",     # redundant with unit norm but appears in names too
    # Additional prep words commonly embedded in ingredient names
    "deseeded", "seeded",  # "chilli, deseeded"
    "pitted",              # "olives, pitted"
    "deveined",            # "shrimp, deveined"
    "zested",              # "lemon, zested"
    "butterflied",         # "chicken, butterflied"
    "julienne",            # base form alongside "julienned"
    "mince",               # base form alongside "minced"
    "dice",                # base form alongside "diced"
    "chop",                # base form alongside "chopped"
    "and",                 # "peeled and diced" — drop the conjunction too
})

# Word-level aliases applied to the final (singularized) noun
_WORD_ALIASES: dict[str, str] = {
    # Chilli spelling variants (including "chilly" which _singularize produces
    # from "chillies" via the ies→y rule)
    "chilli": "chili", "chilly": "chili", "chile": "chili",
    # British/American produce names
    "aubergine": "eggplant",
    "courgette": "zucchini",
    "capsicum": "pepper",
    "coriander": "cilantro",
}

# Full-phrase aliases applied after all word-level processing
_PHRASE_ALIASES: dict[str, str] = {
    "scallion": "green onion",
    "spring onion": "green onion",
}


def _singularize(word: str) -> str:
    """Naive but food-safe singularization of a single word.

    Handles the most common English plural patterns found in ingredient names:
        tomatoes  → tomato   (oes → o)
        berries   → berry    (ies → y)
        onions    → onion    (trailing s)
        potatoes  → potato   (oes → o)
    Leaves irregular/ambiguous endings untouched (asparagus, hummus, leaves …).
    """
    if len(word) <= 3:
        return word
    if word.endswith("oes"):                              # tomatoes, potatoes
        return word[:-2]
    if word.endswith("ies") and len(word) > 4:            # berries, chillies→chilly
        return word[:-3] + "y"
    if (
        word.endswith("s")
        and not word.endswith("ss")    # grass, Swiss
        and not word.endswith("us")    # asparagus, hummus
        and not word.endswith("is")    # anise
        and not word.endswith("ves")   # leaves, halves (leave for PREP_WORDS)
    ):
        return word[:-1]               # onions, mushrooms, peppers
    return word


def _normalize_ingredient_name(name: str) -> str:
    """Return a lowercase, prep-stripped, singularized key for grouping.

    Instead of stripping only from the ends, ALL prep/descriptor words are
    filtered out wherever they appear in the name, so every variant of an
    ingredient collapses to the same base noun(s):

        "Onion"                         → "onion"
        "Onions"                        → "onion"
        "Onion Diced"                   → "onion"
        "Onion Finely Chopped"          → "onion"
        "Diced Onion"                   → "onion"
        "Finely Sliced Onions"          → "onion"
        "Garlic Clove"                  → "garlic"
        "Garlic Cloves, crushed"        → "garlic"
        "Potatoes"                      → "potato"
        "Red Chilli / Red Chillies"     → "red chili"
        "Chicken Breast, Boneless"      → "chicken breast"
        "Tomatoes (Canned)"             → "tomato"
    """
    # Drop everything after the first comma, remove parenthetical notes
    name = name.split(",")[0]
    name = re.sub(r"\s*\(.*?\)", "", name)

    # Filter every prep/descriptor word out of the name regardless of position
    words = name.lower().split()
    core = [w for w in words if w not in PREP_WORDS]

    # If filtering wiped everything (e.g. a name that was only prep words),
    # fall back to the original word list so we at least have something.
    if not core:
        core = words

    # Singularize and apply word-level alias to the final noun (last word)
    last = _singularize(core[-1])
    core[-1] = _WORD_ALIASES.get(last, last)

    result = " ".join(core)
    # Apply full-phrase aliases (scallion → green onion, etc.)
    return _PHRASE_ALIASES.get(result, result)


def _clean_name(name: str) -> str:
    """Strip comma-suffixes and parens for display, preserving original casing."""
    name = name.split(",")[0]
    name = re.sub(r"\s*\(.*?\)", "", name)
    return name.strip()


def _normalize_unit(unit: str) -> str:
    u = (unit or "").strip().lower()
    return UNIT_NORM.get(u, u)


def _parse_quantity(qty: str) -> float | None:
    """Try to parse a quantity string to a float."""
    s = (qty or "").strip()
    if not s:
        return None

    # Range: "2-3" → midpoint
    if "-" in s and not s.startswith("-"):
        parts = s.split("-", 1)
        try:
            return (float(Fraction(parts[0])) + float(Fraction(parts[1]))) / 2
        except (ValueError, ZeroDivisionError):
            return None

    # Mixed number: "1 1/2"
    parts = s.split()
    if len(parts) == 2:
        try:
            return float(Fraction(parts[0])) + float(Fraction(parts[1]))
        except (ValueError, ZeroDivisionError):
            return None

    # Simple fraction or integer
    try:
        return float(Fraction(s))
    except (ValueError, ZeroDivisionError):
        return None


def _format_quantity(value: float) -> str:
    """Format a float back to a readable quantity string."""
    frac = Fraction(value).limit_denominator(8)
    whole = int(frac)
    remainder = frac - whole

    FRAC_UNICODE = {
        Fraction(1, 4): "¼",
        Fraction(1, 3): "⅓",
        Fraction(1, 2): "½",
        Fraction(2, 3): "⅔",
        Fraction(3, 4): "¾",
        Fraction(1, 8): "⅛",
        Fraction(3, 8): "⅜",
        Fraction(5, 8): "⅝",
        Fraction(7, 8): "⅞",
    }

    frac_str = FRAC_UNICODE.get(remainder)
    if remainder and not frac_str:
        frac_str = str(remainder)

    if whole and frac_str:
        return f"{whole} {frac_str}"
    elif frac_str:
        return frac_str
    elif whole:
        return str(whole)
    return str(round(value, 2))


def build_grocery_list(db: Session, week_plan_id: int) -> GroceryListResponse:
    plan = db.query(WeekPlan).filter(WeekPlan.id == week_plan_id).first()
    if not plan:
        raise ValueError(f"Week plan {week_plan_id} not found")

    # Collect all recipe slots for this week (skip leftovers — already counted from source)
    recipe_slots = (
        db.query(MealSlot)
        .filter(
            MealSlot.week_plan_id == week_plan_id,
            MealSlot.slot_type == "recipe",
            MealSlot.recipe_id.isnot(None),
        )
        .all()
    )

    # Key: normalized ingredient name only — no unit.
    # Dropping the unit from the key means "onion" measured in cups, whole,
    # or with no unit at all all collapse into the same bucket.
    buckets: dict[str, dict] = defaultdict(lambda: {
        "ingredient_id": 0,
        "ingredient_name": "",
        "ingredient_category": "Other",
        "numeric_total": 0.0,
        "source_recipes": [],
        "has_numeric": False,
    })

    for slot in recipe_slots:
        recipe = slot.recipe
        if not recipe:
            continue

        # Serving scale (used to proportionally adjust quantities)
        base_servings = recipe.servings or 4
        override = slot.servings_override
        scale = (override / base_servings) if override and base_servings else 1.0

        # Load ingredients for this recipe
        ris = (
            db.query(RecipeIngredient)
            .options(joinedload(RecipeIngredient.ingredient))
            .filter(RecipeIngredient.recipe_id == recipe.id)
            .all()
        )

        for ri in ris:
            ing = ri.ingredient
            if not ing:
                continue

            # Skip pantry staples
            if ing.name.strip().lower() in STAPLES:
                continue

            # Group purely by normalized ingredient name — unit is ignored
            key = _normalize_ingredient_name(ing.name)
            bucket = buckets[key]

            # First time seeing this ingredient: record id/category
            if bucket["ingredient_id"] == 0:
                bucket["ingredient_id"] = ing.id
                raw_cat = ing.category or "Other"
                bucket["ingredient_category"] = CATEGORY_ALIASES.get(raw_cat, raw_cat)

            # Keep the shortest clean display name seen so far
            candidate = _clean_name(ing.name)
            if not bucket["ingredient_name"] or len(candidate) < len(bucket["ingredient_name"]):
                bucket["ingredient_name"] = candidate
                if ing.category:
                    raw_cat = ing.category
                    bucket["ingredient_category"] = CATEGORY_ALIASES.get(raw_cat, raw_cat)

            if recipe.title not in bucket["source_recipes"]:
                bucket["source_recipes"].append(recipe.title)

            # Accumulate numeric quantity, ignoring whatever unit it was in.
            # Non-numeric quantities (e.g. "a pinch") are simply skipped —
            # we only want a plain whole-number count on the grocery list.
            qty_val = _parse_quantity(ri.quantity or "")
            if qty_val is not None:
                bucket["numeric_total"] += qty_val * scale
                bucket["has_numeric"] = True

    # Build line items — quantity is a whole number, no unit shown
    items: list[GroceryLineItem] = []
    for bucket in buckets.values():
        if bucket["has_numeric"]:
            whole = math.ceil(bucket["numeric_total"])
            combined = str(whole) if whole > 0 else ""
        else:
            combined = ""

        items.append(GroceryLineItem(
            ingredient_id=bucket["ingredient_id"],
            ingredient_name=bucket["ingredient_name"],
            ingredient_category=bucket["ingredient_category"],
            combined_quantity=combined,
            unit="",
            source_recipes=bucket["source_recipes"],
        ))

    # Sort: category order then name
    cat_rank = {c: i for i, c in enumerate(CATEGORY_ORDER)}
    items.sort(key=lambda x: (
        cat_rank.get(x.ingredient_category, len(CATEGORY_ORDER)),
        x.ingredient_name.lower(),
    ))

    # Group by category
    grouped: dict[str, list[GroceryLineItem]] = defaultdict(list)
    for item in items:
        grouped[item.ingredient_category].append(item)

    return GroceryListResponse(
        week_plan_id=week_plan_id,
        week_start=plan.week_start,
        items=items,
        grouped_by_category=dict(grouped),
    )
