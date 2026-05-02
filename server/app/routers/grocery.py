from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.grocery_aggregator import build_grocery_list
from ..schemas.grocery import GroceryListResponse

router = APIRouter(tags=["grocery"])


@router.get("/{week_plan_id}", response_model=GroceryListResponse)
def get_grocery_list(week_plan_id: int, db: Session = Depends(get_db)):
    try:
        return build_grocery_list(db, week_plan_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
