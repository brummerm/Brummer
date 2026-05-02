from __future__ import annotations
from pydantic import BaseModel
from datetime import date


class GroceryLineItem(BaseModel):
    ingredient_id: int
    ingredient_name: str
    ingredient_category: str
    combined_quantity: str
    unit: str
    source_recipes: list[str]


class GroceryListResponse(BaseModel):
    week_plan_id: int
    week_start: date
    items: list[GroceryLineItem]
    grouped_by_category: dict[str, list[GroceryLineItem]]
