from __future__ import annotations
import re

# Quantity pattern: handles integers, decimals, fractions, mixed numbers,
# and Unicode fraction characters that recipe sites sometimes use.
_QTY_RE = re.compile(
    r'^('
    r'\d+\s+\d+/\d+'       # mixed number  "1 1/2"
    r'|\d+/\d+'             # fraction      "1/2"
    r'|\d+(?:\.\d+)?'       # int/decimal   "2"  "1.5"
    r'|[½¼¾⅓⅔⅛⅜⅝⅞]'        # unicode frac  "½"
    r'|\d+\s*[½¼¾⅓⅔⅛⅜⅝⅞]'  # mixed unicode "1½"
    r')\s*'
)

_UNIT_WORDS: frozenset[str] = frozenset({
    "cup", "cups", "c",
    "tbsp", "tablespoon", "tablespoons", "tbs",
    "tsp", "teaspoon", "teaspoons",
    "oz", "ounce", "ounces",
    "lb", "lbs", "pound", "pounds",
    "g", "gram", "grams",
    "kg", "kilogram", "kilograms",
    "ml", "milliliter", "milliliters",
    "l", "liter", "liters",
    "clove", "cloves",
    "piece", "pieces",
    "can", "cans",
    "whole", "slice", "slices",
    "bunch", "bunches",
    "sprig", "sprigs",
    "stalk", "stalks",
    "pinch", "dash", "handful",
    "package", "pkg", "bag",
    "quart", "quarts", "qt",
    "pint", "pints", "pt",
})


def _parse_ingredient(text: str, sort_order: int = 0) -> dict:
    """Split a free-text ingredient line into quantity / unit / name parts."""
    text = text.strip()
    quantity = ""
    unit = ""
    rest = text

    m = _QTY_RE.match(text)
    if m:
        quantity = m.group(1).strip()
        rest = text[m.end():].strip()

    # Check if the next token is a known unit
    parts = rest.split(None, 1)
    if parts and parts[0].lower().rstrip(".") in _UNIT_WORDS:
        unit = parts[0]
        rest = parts[1].strip() if len(parts) > 1 else ""

    return {
        "name": rest or text,
        "quantity": quantity,
        "unit": unit,
        "notes": None,
        "sort_order": sort_order,
    }


def _safe(fn):
    """Call a scraper method and return None on any exception."""
    try:
        result = fn()
        return result if result else None
    except Exception:
        return None


def scrape_recipe(url: str) -> dict:
    """Scrape a recipe from any URL using recipe-scrapers.

    Returns a dict with keys: title, description, instructions, category,
    cuisine, servings, total_time, image_url, ingredients, source_url.

    Raises ValueError with a user-friendly message on failure.
    """
    try:
        from recipe_scrapers import scrape_me
        scraper = scrape_me(url.strip())
    except Exception as exc:
        raise ValueError(f"Could not extract a recipe from that URL: {exc}") from exc

    title = _safe(scraper.title) or "Untitled Recipe"
    instructions = _safe(scraper.instructions) or ""
    image_url = _safe(scraper.image) or ""

    # Servings — scraper returns a string like "4 servings"
    servings = 4
    try:
        raw_yield = scraper.yields()
        if raw_yield:
            nums = re.findall(r"\d+", str(raw_yield))
            if nums:
                servings = int(nums[0])
    except Exception:
        pass

    # Total time in minutes
    total_time = None
    try:
        t = scraper.total_time()
        if t:
            total_time = int(t)
    except Exception:
        pass

    category = _safe(scraper.category)
    cuisine = _safe(scraper.cuisine)

    # Parse ingredient strings
    ingredients: list[dict] = []
    try:
        for i, line in enumerate(scraper.ingredients()):
            if line.strip():
                ingredients.append(_parse_ingredient(line, sort_order=i))
    except Exception:
        pass

    return {
        "title": title,
        "description": None,
        "instructions": instructions,
        "category": category,
        "cuisine": cuisine,
        "servings": servings,
        "total_time": total_time,
        "image_url": image_url,
        "ingredients": ingredients,
        "source_url": url.strip(),
    }
