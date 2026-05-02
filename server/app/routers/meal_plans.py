from __future__ import annotations
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..crud import meal_plan as mp_crud
from ..schemas.meal_plan import (
    WeekPlanCreate, WeekPlanResponse, WeekPlanListItem, MealSlotUpdate, MealSlotResponse,
)

router = APIRouter(tags=["meal-plans"])


@router.get("", response_model=list[WeekPlanListItem])
def list_week_plans(db: Session = Depends(get_db)):
    return mp_crud.list_week_plans(db)


@router.post("", response_model=WeekPlanResponse, status_code=201)
def create_week_plan(data: WeekPlanCreate, db: Session = Depends(get_db)):
    plan = mp_crud.get_or_create_week(db, data.week_start)
    return mp_crud.get_week_plan(db, plan.id)


@router.get("/by-week/{week_start}", response_model=WeekPlanResponse)
def get_or_create_by_week(week_start: date, db: Session = Depends(get_db)):
    plan = mp_crud.get_or_create_week(db, week_start)
    return mp_crud.get_week_plan(db, plan.id)


@router.get("/{plan_id}", response_model=WeekPlanResponse)
def get_week_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = mp_crud.get_week_plan(db, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Week plan not found")
    return plan


@router.delete("/{plan_id}", status_code=204)
def delete_week_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = mp_crud.get_week_plan(db, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Week plan not found")
    mp_crud.delete_week_plan(db, plan)


@router.put("/{plan_id}/slots/{slot_id}", response_model=MealSlotResponse)
def update_slot(
    plan_id: int,
    slot_id: int,
    data: MealSlotUpdate,
    db: Session = Depends(get_db),
):
    slot = mp_crud.get_slot(db, slot_id)
    if not slot or slot.week_plan_id != plan_id:
        raise HTTPException(status_code=404, detail="Slot not found")
    if data.slot_type == "recipe" and not data.recipe_id:
        raise HTTPException(status_code=400, detail="recipe_id required when slot_type is 'recipe'")
    updated = mp_crud.update_slot(db, slot, data)
    # Reload with recipe joined
    return mp_crud.get_slot(db, updated.id)


@router.post("/{plan_id}/slots/{slot_id}/randomize", response_model=MealSlotResponse)
def randomize_slot(
    plan_id: int,
    slot_id: int,
    category: str | None = Query(None),
    db: Session = Depends(get_db),
):
    slot = mp_crud.get_slot(db, slot_id)
    if not slot or slot.week_plan_id != plan_id:
        raise HTTPException(status_code=404, detail="Slot not found")
    updated = mp_crud.randomize_slot(db, slot, category=category)
    return mp_crud.get_slot(db, updated.id)


@router.delete("/{plan_id}/slots/{slot_id}", response_model=MealSlotResponse)
def clear_slot(
    plan_id: int,
    slot_id: int,
    db: Session = Depends(get_db),
):
    slot = mp_crud.get_slot(db, slot_id)
    if not slot or slot.week_plan_id != plan_id:
        raise HTTPException(status_code=404, detail="Slot not found")
    return mp_crud.clear_slot(db, slot)
