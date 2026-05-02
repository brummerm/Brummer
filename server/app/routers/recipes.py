from __future__ import annotations
import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..crud import recipe as recipe_crud
from ..schemas.recipe import (
    RecipeCreate, RecipeUpdate, RecipeResponse,
    RecipeListItem, PaginatedRecipes,
)
from ..services.image_handler import delete_image

router = APIRouter(tags=["recipes"])


@router.get("/random", response_model=RecipeListItem)
def random_recipe(
    category: str | None = Query(None),
    db: Session = Depends(get_db),
):
    recipe = recipe_crud.get_random(db, category=category)
    if not recipe:
        raise HTTPException(status_code=404, detail="No recipes found")
    return recipe


@router.get("/categories", response_model=list[str])
def list_categories(db: Session = Depends(get_db)):
    return recipe_crud.get_categories(db)


@router.get("/cuisines", response_model=list[str])
def list_cuisines(db: Session = Depends(get_db)):
    return recipe_crud.get_cuisines(db)


@router.get("", response_model=PaginatedRecipes)
def list_recipes(
    q: str | None = Query(None),
    ingredient: str | None = Query(None),
    category: str | None = Query(None),
    cuisine: str | None = Query(None),
    is_custom: bool | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(24, ge=1, le=100),
    db: Session = Depends(get_db),
):
    items, total = recipe_crud.list_recipes(
        db, q=q, ingredient=ingredient, category=category, cuisine=cuisine,
        is_custom=is_custom, page=page, per_page=per_page,
    )
    return PaginatedRecipes(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page) if total else 0,
    )


@router.post("", response_model=RecipeResponse, status_code=201)
def create_recipe(data: RecipeCreate, db: Session = Depends(get_db)):
    return recipe_crud.create(db, data)


@router.get("/{recipe_id}", response_model=RecipeResponse)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = recipe_crud.get_by_id(db, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@router.put("/{recipe_id}", response_model=RecipeResponse)
def update_recipe(
    recipe_id: int,
    data: RecipeCreate,
    db: Session = Depends(get_db),
):
    recipe = recipe_crud.get_by_id(db, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    update_data = RecipeUpdate(**data.model_dump())
    return recipe_crud.update(db, recipe, update_data)


@router.patch("/{recipe_id}", response_model=RecipeResponse)
def patch_recipe(
    recipe_id: int,
    data: RecipeUpdate,
    db: Session = Depends(get_db),
):
    recipe = recipe_crud.get_by_id(db, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe_crud.update(db, recipe, data)


@router.delete("/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = recipe_crud.get_by_id(db, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    # Delete custom image from disk
    if recipe.image_filename:
        delete_image(recipe.image_filename)
    recipe_crud.delete(db, recipe)
