from __future__ import annotations
import hashlib
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.recipe import Recipe
from ..services import mealdb as mealdb_service
from ..services.image_handler import download_and_save
from ..crud import recipe as recipe_crud
from ..config import settings

router = APIRouter(tags=["seed"])


class UrlImportRequest(BaseModel):
    url: str


@router.post("/from-url")
async def import_from_url(body: UrlImportRequest, db: Session = Depends(get_db)):
    """Import a single recipe from any URL using recipe-scrapers."""
    from ..services.url_scraper import scrape_recipe
    from ..schemas.recipe import RecipeCreate, IngredientInRecipe

    url = body.url.strip()

    # Prevent duplicate imports of the same URL
    existing = db.query(Recipe).filter(Recipe.source_url == url).first()
    if existing:
        return {
            "status": "skipped",
            "message": "A recipe from this URL has already been imported.",
            "recipe_id": existing.id,
            "title": existing.title,
        }

    try:
        scraped = scrape_recipe(url)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    # Download the recipe image into the seeded/ folder
    image_filename = None
    if scraped["image_url"]:
        url_hash = hashlib.md5(url.encode()).hexdigest()[:12]
        filename = f"url_{url_hash}.jpg"
        success = await download_and_save(scraped["image_url"], filename)
        if success:
            image_filename = f"seeded/{filename}"

    ingredients = [
        IngredientInRecipe(
            name=ing["name"],
            quantity=ing["quantity"],
            unit=ing["unit"],
            notes=ing["notes"],
            sort_order=ing["sort_order"],
        )
        for ing in scraped["ingredients"]
        if ing["name"].strip()
    ]

    data = RecipeCreate(
        title=scraped["title"],
        description=scraped["description"],
        instructions=scraped["instructions"],
        category=scraped["category"],
        cuisine=scraped["cuisine"],
        servings=scraped["servings"],
        cook_time_mins=scraped["total_time"],
        image_filename=image_filename,
        source_url=scraped["source_url"],
        ingredients=ingredients,
    )

    recipe = recipe_crud.create(db, data)
    return {"status": "imported", "recipe_id": recipe.id, "title": recipe.title}


@router.get("/status")
def seed_status(db: Session = Depends(get_db)):
    seeded = db.query(Recipe).filter(Recipe.is_custom == False).count()
    custom = db.query(Recipe).filter(Recipe.is_custom == True).count()
    return {"seeded": seeded, "custom": custom, "seed_complete": seeded > 0}


@router.post("/run")
async def run_seed(db: Session = Depends(get_db)):
    return await _do_seed(db, category_filter=None)


@router.post("/run/{category}")
async def run_seed_category(category: str, db: Session = Depends(get_db)):
    return await _do_seed(db, category_filter=category)


async def _do_seed(db: Session, category_filter: str | None) -> dict:
    categories = await mealdb_service.fetch_categories()
    if category_filter:
        categories = [c for c in categories if c["strCategory"] == category_filter]

    total_imported = 0
    total_skipped = 0
    errors = []

    for cat in categories:
        cat_name = cat["strCategory"]
        try:
            meals = await mealdb_service.fetch_meals_by_category(cat_name)
        except Exception as e:
            errors.append(f"Failed to fetch category {cat_name}: {e}")
            continue

        # Cap per category
        meals = meals[: settings.SEED_MAX_PER_CATEGORY]

        for meal_stub in meals:
            meal_id = meal_stub["idMeal"]
            # Skip if already seeded
            existing = db.query(Recipe).filter(Recipe.external_id == meal_id).first()
            if existing:
                total_skipped += 1
                continue

            try:
                full_meal = await mealdb_service.fetch_meal_by_id(meal_id)
                if not full_meal:
                    continue
                transformed = await mealdb_service.transform_meal(full_meal)

                # Download image
                if transformed["thumb_url"] and transformed["image_filename"]:
                    filename = transformed["image_filename"].replace("seeded/", "")
                    await download_and_save(transformed["thumb_url"], filename)

                result = recipe_crud.create_seeded(
                    db,
                    title=transformed["title"],
                    description=transformed["description"],
                    instructions=transformed["instructions"],
                    category=transformed["category"],
                    cuisine=transformed["cuisine"],
                    servings=4,
                    image_filename=transformed["image_filename"],
                    source_url=transformed["source_url"],
                    tags=transformed["tags"],
                    external_id=transformed["external_id"],
                    raw_ingredients=transformed["raw_ingredients"],
                )
                if result:
                    total_imported += 1
                else:
                    total_skipped += 1

            except Exception as e:
                db.rollback()  # reset session so next recipe can proceed
                errors.append(f"Failed to import meal {meal_id}: {e}")

    return {
        "imported": total_imported,
        "skipped": total_skipped,
        "errors": errors[:20],  # cap error list
    }
