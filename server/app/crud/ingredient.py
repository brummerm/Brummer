from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.recipe import Ingredient


def get_or_create(db: Session, name: str, category: str | None = None) -> Ingredient:
    """Case-insensitive lookup; create if not found."""
    ingredient = (
        db.query(Ingredient)
        .filter(func.lower(Ingredient.name) == name.strip().lower())
        .first()
    )
    if not ingredient:
        ingredient = Ingredient(name=name.strip().title(), category=category)
        db.add(ingredient)
        db.flush()
    return ingredient


def search(db: Session, q: str, limit: int = 20) -> list[Ingredient]:
    return (
        db.query(Ingredient)
        .filter(func.lower(Ingredient.name).like(f"{q.lower()}%"))
        .order_by(Ingredient.name)
        .limit(limit)
        .all()
    )


def list_all(db: Session) -> list[Ingredient]:
    return db.query(Ingredient).order_by(Ingredient.name).all()
