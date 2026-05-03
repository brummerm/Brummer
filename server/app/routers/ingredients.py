from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..crud import ingredient as ingredient_crud
from ..schemas.recipe import IngredientResponse, IngredientCategoryUpdate

router = APIRouter(tags=["ingredients"])


@router.get("", response_model=list[IngredientResponse])
def list_ingredients(
    q: str | None = Query(None),
    db: Session = Depends(get_db),
):
    if q:
        return ingredient_crud.search(db, q)
    return ingredient_crud.list_all(db)


@router.patch("/{ingredient_id}", response_model=IngredientResponse)
def update_ingredient_category(
    ingredient_id: int,
    data: IngredientCategoryUpdate,
    db: Session = Depends(get_db),
):
    ing = ingredient_crud.update_ingredient(db, ingredient_id, data.category)
    if not ing:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return ing
