from __future__ import annotations
from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional


class IngredientBase(BaseModel):
    name: str
    category: Optional[str] = None


class IngredientResponse(IngredientBase):
    id: int

    model_config = {"from_attributes": True}


class IngredientInRecipe(BaseModel):
    ingredient_id: Optional[int] = None  # None = look up / create by name
    name: str
    quantity: Optional[str] = None
    unit: Optional[str] = None
    notes: Optional[str] = None
    sort_order: int = 0


class IngredientInRecipeResponse(IngredientInRecipe):
    id: int
    ingredient_id: int

    model_config = {"from_attributes": True}


class RecipeCreate(BaseModel):
    title: str
    description: Optional[str] = None
    instructions: str = ""
    category: Optional[str] = None
    cuisine: Optional[str] = None
    servings: int = 4
    prep_time_mins: Optional[int] = None
    cook_time_mins: Optional[int] = None
    image_filename: Optional[str] = None
    source_url: Optional[str] = None
    tags: Optional[str] = None
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    ingredients: list[IngredientInRecipe] = []

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("title cannot be empty")
        return v.strip()


class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    category: Optional[str] = None
    cuisine: Optional[str] = None
    servings: Optional[int] = None
    prep_time_mins: Optional[int] = None
    cook_time_mins: Optional[int] = None
    image_filename: Optional[str] = None
    source_url: Optional[str] = None
    tags: Optional[str] = None
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    ingredients: Optional[list[IngredientInRecipe]] = None


class RecipeListItem(BaseModel):
    id: int
    title: str
    category: Optional[str] = None
    cuisine: Optional[str] = None
    image_filename: Optional[str] = None
    servings: int
    prep_time_mins: Optional[int] = None
    cook_time_mins: Optional[int] = None
    is_custom: bool
    tags: Optional[str] = None

    model_config = {"from_attributes": True}


class RecipeResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    instructions: str
    category: Optional[str] = None
    cuisine: Optional[str] = None
    servings: int
    prep_time_mins: Optional[int] = None
    cook_time_mins: Optional[int] = None
    image_filename: Optional[str] = None
    source_url: Optional[str] = None
    is_custom: bool
    external_id: Optional[str] = None
    tags: Optional[str] = None
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    ingredients: list[IngredientInRecipeResponse] = []

    model_config = {"from_attributes": True}


class PaginatedRecipes(BaseModel):
    items: list[RecipeListItem]
    total: int
    page: int
    per_page: int
    pages: int


class IngredientCategoryUpdate(BaseModel):
    category: str
