from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..crud import ingredient as ingredient_crud
from ..schemas.recipe import IngredientResponse

router = APIRouter(tags=["ingredients"])


@router.get("", response_model=list[IngredientResponse])
def list_ingredients(
    q: str | None = Query(None),
    db: Session = Depends(get_db),
):
    if q:
        return ingredient_crud.search(db, q)
    return ingredient_crud.list_all(db)
