from __future__ import annotations
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, Literal
from .recipe import RecipeListItem


class MealSlotUpdate(BaseModel):
    slot_type: Literal["recipe", "leftovers", "going_out", "empty"]
    recipe_id: Optional[int] = None
    servings_override: Optional[int] = None
    notes: Optional[str] = None
    source_slot_id: Optional[int] = None


class MealSlotResponse(BaseModel):
    id: int
    day_of_week: int
    meal_type: str
    slot_type: str
    recipe_id: Optional[int] = None
    recipe: Optional[RecipeListItem] = None
    servings_override: Optional[int] = None
    notes: Optional[str] = None
    source_slot_id: Optional[int] = None

    model_config = {"from_attributes": True}


class WeekPlanCreate(BaseModel):
    week_start: date
    notes: Optional[str] = None


class WeekPlanListItem(BaseModel):
    id: int
    week_start: date
    created_at: datetime

    model_config = {"from_attributes": True}


class WeekPlanResponse(BaseModel):
    id: int
    week_start: date
    notes: Optional[str] = None
    slots: list[MealSlotResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
