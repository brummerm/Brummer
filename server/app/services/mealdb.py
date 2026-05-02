from __future__ import annotations
import httpx
from ..config import settings


BASE = settings.MEALDB_BASE_URL


def _parse_measure(measure: str) -> tuple[str, str]:
    """Split a TheMealDB measure string into (quantity, unit)."""
    measure = (measure or "").strip()
    if not measure:
        return ("", "")

    known_units = [
        "cups", "cup", "tbsp", "tablespoons", "tablespoon",
        "tsp", "teaspoons", "teaspoon",
        "oz", "ounces", "ounce",
        "g", "grams", "gram",
        "kg", "kilograms",
        "ml", "milliliters",
        "l", "liters",
        "lb", "lbs", "pounds", "pound",
        "cloves", "clove",
        "slices", "slice",
        "whole", "pieces", "piece",
        "cans", "can",
    ]

    parts = measure.split(None, 1)
    if len(parts) == 1:
        tok = parts[0].lower().rstrip("s")
        if tok in known_units or parts[0].lower() in known_units:
            return ("", parts[0])
        return (parts[0], "")

    return (parts[0], parts[1])


def _extract_ingredients(meal: dict) -> list[dict]:
    items = []
    for i in range(1, 21):
        name = (meal.get(f"strIngredient{i}") or "").strip()
        measure = (meal.get(f"strMeasure{i}") or "").strip()
        if not name:
            break
        qty, unit = _parse_measure(measure)
        items.append({"name": name, "quantity": qty, "unit": unit})
    return items


async def fetch_categories() -> list[dict]:
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(f"{BASE}/categories.php")
        resp.raise_for_status()
        return resp.json().get("categories", [])


async def fetch_meals_by_category(category: str) -> list[dict]:
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(f"{BASE}/filter.php", params={"c": category})
        resp.raise_for_status()
        return resp.json().get("meals", []) or []


async def fetch_meal_by_id(meal_id: str) -> dict | None:
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(f"{BASE}/lookup.php", params={"i": meal_id})
        resp.raise_for_status()
        meals = resp.json().get("meals")
        return meals[0] if meals else None


async def transform_meal(meal: dict) -> dict:
    """Convert a raw TheMealDB meal dict to our internal format."""
    external_id = meal["idMeal"]
    thumb_url = meal.get("strMealThumb") or ""
    image_filename = f"seeded/{external_id}.jpg" if thumb_url else None

    return {
        "external_id": external_id,
        "title": meal.get("strMeal", ""),
        "description": None,
        "instructions": meal.get("strInstructions", ""),
        "category": meal.get("strCategory"),
        "cuisine": meal.get("strArea"),
        "tags": meal.get("strTags"),
        "source_url": meal.get("strSource"),
        "image_filename": image_filename,
        "thumb_url": thumb_url,
        "raw_ingredients": _extract_ingredients(meal),
    }
