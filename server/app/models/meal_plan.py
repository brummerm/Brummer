from sqlalchemy import (
    Column, Integer, Text, Date, DateTime, ForeignKey,
    Index, func,
)
from sqlalchemy.orm import relationship
from ..database import Base


class WeekPlan(Base):
    __tablename__ = "week_plans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    week_start = Column(Date, nullable=False, unique=True)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    slots = relationship(
        "MealSlot",
        back_populates="week_plan",
        cascade="all, delete-orphan",
        order_by="MealSlot.day_of_week, MealSlot.sort_order, MealSlot.id",
    )

    __table_args__ = (
        Index("idx_week_plans_week_start", "week_start"),
    )


MEAL_TYPES = ["breakfast", "lunch", "dinner"]
SLOT_TYPES = ["recipe", "leftovers", "going_out", "empty"]


class MealSlot(Base):
    __tablename__ = "meal_slots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    week_plan_id = Column(
        Integer, ForeignKey("week_plans.id", ondelete="CASCADE"), nullable=False
    )
    day_of_week = Column(Integer, nullable=False)   # 0=Monday … 6=Sunday
    meal_type = Column(Text, nullable=False)         # breakfast / lunch / dinner
    slot_type = Column(Text, nullable=False, default="empty")
    recipe_id = Column(
        Integer, ForeignKey("recipes.id", ondelete="SET NULL"), nullable=True
    )
    servings_override = Column(Integer)
    notes = Column(Text)
    source_slot_id = Column(Integer, ForeignKey("meal_slots.id"), nullable=True)
    sort_order = Column(Integer, nullable=False, default=0)

    week_plan = relationship("WeekPlan", back_populates="slots")
    recipe = relationship("Recipe", back_populates="meal_slots")
    source_slot = relationship("MealSlot", foreign_keys=[source_slot_id], remote_side="MealSlot.id")

    __table_args__ = (
        Index("idx_meal_slots_week_plan_id", "week_plan_id"),
        Index("idx_meal_slots_recipe_id", "recipe_id"),
    )
