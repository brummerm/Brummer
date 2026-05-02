from sqlalchemy import (
    Column, Integer, Text, Boolean, DateTime, ForeignKey,
    UniqueConstraint, Index, func,
)
from sqlalchemy.orm import relationship
from ..database import Base


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False, unique=True)
    category = Column(Text)  # Produce, Dairy, Meat, Pantry, Other
    created_at = Column(DateTime, default=func.now())

    recipe_ingredients = relationship("RecipeIngredient", back_populates="ingredient")

    __table_args__ = (
        Index("idx_ingredients_name", "name"),
    )


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(Text, nullable=False)
    description = Column(Text)
    instructions = Column(Text, nullable=False, default="")
    category = Column(Text)
    cuisine = Column(Text)
    servings = Column(Integer, default=4)
    prep_time_mins = Column(Integer)
    cook_time_mins = Column(Integer)
    image_filename = Column(Text)
    source_url = Column(Text)
    is_custom = Column(Boolean, nullable=False, default=True)
    external_id = Column(Text, unique=True)
    tags = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    ingredients = relationship(
        "RecipeIngredient",
        back_populates="recipe",
        cascade="all, delete-orphan",
        order_by="RecipeIngredient.sort_order",
    )
    meal_slots = relationship("MealSlot", back_populates="recipe")

    __table_args__ = (
        Index("idx_recipes_category", "category"),
        Index("idx_recipes_cuisine", "cuisine"),
        Index("idx_recipes_is_custom", "is_custom"),
        Index("idx_recipes_title", "title"),
    )


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True, autoincrement=True)
    recipe_id = Column(
        Integer, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False
    )
    ingredient_id = Column(
        Integer, ForeignKey("ingredients.id"), nullable=False
    )
    quantity = Column(Text)
    unit = Column(Text)
    notes = Column(Text)
    sort_order = Column(Integer, default=0)

    recipe = relationship("Recipe", back_populates="ingredients")
    ingredient = relationship("Ingredient", back_populates="recipe_ingredients")

    @property
    def name(self) -> str:
        """Convenience accessor so Pydantic can serialize ingredient name directly."""
        return self.ingredient.name if self.ingredient else ""

    __table_args__ = (
        UniqueConstraint("recipe_id", "ingredient_id"),
        Index("idx_ri_recipe_id", "recipe_id"),
        Index("idx_ri_ingredient_id", "ingredient_id"),
    )
