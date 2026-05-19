from __future__ import annotations
import random
from datetime import date
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from ..models.meal_plan import WeekPlan, MealSlot
from ..models.recipe import Recipe
from ..schemas.meal_plan import MealSlotUpdate, WeekPlanCreate


def get_or_create_week(db: Session, week_start: date) -> WeekPlan:
    plan = db.query(WeekPlan).filter(WeekPlan.week_start == week_start).first()
    if plan:
        return plan
    plan = WeekPlan(week_start=week_start)
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


def add_slot(db: Session, week_plan_id: int, day_of_week: int, label: str = "Meal") -> MealSlot:
    from sqlalchemy import func as sqlfunc
    # Get next sort_order for this day
    max_order = db.query(sqlfunc.max(MealSlot.sort_order)).filter(
        MealSlot.week_plan_id == week_plan_id,
        MealSlot.day_of_week == day_of_week,
    ).scalar()
    next_order = (max_order + 1) if max_order is not None else 0

    # Ensure unique meal_type label within this day (constraint still exists in old DBs)
    final_label = label
    counter = 2
    while db.query(MealSlot).filter(
        MealSlot.week_plan_id == week_plan_id,
        MealSlot.day_of_week == day_of_week,
        MealSlot.meal_type == final_label,
    ).first():
        final_label = f"{label} {counter}"
        counter += 1

    slot = MealSlot(
        week_plan_id=week_plan_id,
        day_of_week=day_of_week,
        meal_type=final_label,
        slot_type="empty",
        sort_order=next_order,
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return db.query(MealSlot).options(joinedload(MealSlot.recipe)).filter(MealSlot.id == slot.id).first()


def delete_slot(db: Session, slot: MealSlot) -> None:
    db.delete(slot)
    db.commit()


def get_week_plan(db: Session, plan_id: int) -> WeekPlan | None:
    return (
        db.query(WeekPlan)
        .options(
            joinedload(WeekPlan.slots).joinedload(MealSlot.recipe)
        )
        .filter(WeekPlan.id == plan_id)
        .first()
    )


def get_week_by_start(db: Session, week_start: date) -> WeekPlan | None:
    return (
        db.query(WeekPlan)
        .options(
            joinedload(WeekPlan.slots).joinedload(MealSlot.recipe)
        )
        .filter(WeekPlan.week_start == week_start)
        .first()
    )


def list_week_plans(db: Session) -> list[WeekPlan]:
    return (
        db.query(WeekPlan)
        .order_by(WeekPlan.week_start.desc())
        .all()
    )


def delete_week_plan(db: Session, plan: WeekPlan):
    db.delete(plan)
    db.commit()


def get_slot(db: Session, slot_id: int) -> MealSlot | None:
    return (
        db.query(MealSlot)
        .options(joinedload(MealSlot.recipe))
        .filter(MealSlot.id == slot_id)
        .first()
    )


def update_slot(db: Session, slot: MealSlot, data: MealSlotUpdate) -> MealSlot:
    slot.slot_type = data.slot_type
    slot.recipe_id = data.recipe_id if data.slot_type == "recipe" else None
    slot.source_slot_id = data.source_slot_id if data.slot_type == "leftovers" else None
    slot.servings_override = data.servings_override
    slot.notes = data.notes
    db.commit()
    db.refresh(slot)
    return slot


def clear_slot(db: Session, slot: MealSlot) -> MealSlot:
    slot.slot_type = "empty"
    slot.recipe_id = None
    slot.source_slot_id = None
    slot.servings_override = None
    slot.notes = None
    db.commit()
    db.refresh(slot)
    return slot


def randomize_slot(
    db: Session, slot: MealSlot, category: str | None = None
) -> MealSlot:
    query = db.query(Recipe)
    if category:
        query = query.filter(Recipe.category == category)
    count = query.count()
    if count == 0:
        return slot
    recipe = query.offset(random.randint(0, count - 1)).first()
    slot.slot_type = "recipe"
    slot.recipe_id = recipe.id
    db.commit()
    db.refresh(slot)
    return slot
