from __future__ import annotations
import math
import random
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, distinct
from ..models.recipe import Recipe, Ingredient, RecipeIngredient
from ..schemas.recipe import RecipeCreate, RecipeUpdate, IngredientInRecipe
from . import ingredient as ingredient_crud


def _sync_ingredients(db: Session, recipe: Recipe, items: list[IngredientInRecipe]):
    """Replace all ingredients on a recipe with the given list."""
    # Delete existing
    db.query(RecipeIngredient).filter(
        RecipeIngredient.recipe_id == recipe.id
    ).delete()
    db.flush()

    for item in items:
        if not item.name.strip():
            continue
        ing = ingredient_crud.get_or_create(db, item.name)
        ri = RecipeIngredient(
            recipe_id=recipe.id,
            ingredient_id=ing.id,
            quantity=item.quantity,
            unit=item.unit,
            notes=item.notes,
            sort_order=item.sort_order,
        )
        db.add(ri)
    db.flush()


def create(db: Session, data: RecipeCreate) -> Recipe:
    recipe = Recipe(
        title=data.title,
        description=data.description,
        instructions=data.instructions,
        category=data.category,
        cuisine=data.cuisine,
        servings=data.servings,
        prep_time_mins=data.prep_time_mins,
        cook_time_mins=data.cook_time_mins,
        image_filename=data.image_filename,
        source_url=data.source_url,
        tags=data.tags,
        is_custom=True,
    )
    db.add(recipe)
    db.flush()
    _sync_ingredients(db, recipe, data.ingredients)
    db.commit()
    db.refresh(recipe)
    return recipe


def get_by_id(db: Session, recipe_id: int) -> Recipe | None:
    return (
        db.query(Recipe)
        .options(
            joinedload(Recipe.ingredients).joinedload(RecipeIngredient.ingredient)
        )
        .filter(Recipe.id == recipe_id)
        .first()
    )


def list_recipes(
    db: Session,
    q: str | None = None,
    ingredient: str | None = None,
    category: str | None = None,
    cuisine: str | None = None,
    is_custom: bool | None = None,
    page: int = 1,
    per_page: int = 24,
) -> tuple[list[Recipe], int]:
    query = db.query(Recipe)
    if q:
        query = query.filter(Recipe.title.ilike(f"%{q}%"))
    if ingredient:
        query = (
            query
            .join(RecipeIngredient, Recipe.id == RecipeIngredient.recipe_id)
            .join(Ingredient, RecipeIngredient.ingredient_id == Ingredient.id)
            .filter(Ingredient.name.ilike(f"%{ingredient}%"))
            .distinct()
        )
    if category:
        query = query.filter(Recipe.category == category)
    if cuisine:
        query = query.filter(Recipe.cuisine == cuisine)
    if is_custom is not None:
        query = query.filter(Recipe.is_custom == is_custom)

    total = query.count()
    items = (
        query.order_by(Recipe.title)
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return items, total


def get_random(db: Session, category: str | None = None) -> Recipe | None:
    query = db.query(Recipe)
    if category:
        query = query.filter(Recipe.category == category)
    count = query.count()
    if count == 0:
        return None
    offset = random.randint(0, count - 1)
    return query.offset(offset).first()


def update(db: Session, recipe: Recipe, data: RecipeUpdate) -> Recipe:
    for field, value in data.model_dump(exclude_unset=True, exclude={"ingredients"}).items():
        setattr(recipe, field, value)
    if data.ingredients is not None:
        _sync_ingredients(db, recipe, data.ingredients)
    db.commit()
    db.refresh(recipe)
    return recipe


def delete(db: Session, recipe: Recipe):
    db.delete(recipe)
    db.commit()


def get_categories(db: Session) -> list[str]:
    rows = (
        db.query(distinct(Recipe.category))
        .filter(Recipe.category.isnot(None))
        .order_by(Recipe.category)
        .all()
    )
    return [r[0] for r in rows]


def get_cuisines(db: Session) -> list[str]:
    rows = (
        db.query(distinct(Recipe.cuisine))
        .filter(Recipe.cuisine.isnot(None))
        .order_by(Recipe.cuisine)
        .all()
    )
    return [r[0] for r in rows]


def create_seeded(
    db: Session,
    *,
    title: str,
    description: str | None,
    instructions: str,
    category: str | None,
    cuisine: str | None,
    servings: int,
    image_filename: str | None,
    source_url: str | None,
    tags: str | None,
    external_id: str,
    raw_ingredients: list[dict],
) -> Recipe | None:
    """Create a recipe from TheMealDB data. Returns None if already exists."""
    existing = db.query(Recipe).filter(Recipe.external_id == external_id).first()
    if existing:
        return None

    recipe = Recipe(
        title=title,
        description=description,
        instructions=instructions,
        category=category,
        cuisine=cuisine,
        servings=4,
        image_filename=image_filename,
        source_url=source_url,
        tags=tags,
        is_custom=False,
        external_id=external_id,
    )
    db.add(recipe)
    db.flush()

    seen_ingredient_ids: set[int] = set()
    for i, item in enumerate(raw_ingredients):
        if not item.get("name", "").strip():
            continue
        ing = ingredient_crud.get_or_create(db, item["name"])
        # TheMealDB sometimes lists the same ingredient twice — skip duplicates
        if ing.id in seen_ingredient_ids:
            continue
        seen_ingredient_ids.add(ing.id)
        ri = RecipeIngredient(
            recipe_id=recipe.id,
            ingredient_id=ing.id,
            quantity=item.get("quantity") or "",
            unit=item.get("unit") or "",
            notes=None,
            sort_order=i,
        )
        db.add(ri)

    db.commit()
    db.refresh(recipe)
    return recipe
