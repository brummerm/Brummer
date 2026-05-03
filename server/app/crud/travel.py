from __future__ import annotations
from sqlalchemy.orm import Session

from ..models.travel import Trip, ItineraryItem, PackingItem
from ..schemas.travel import (
    TripCreate, TripUpdate,
    ItineraryItemCreate, ItineraryItemUpdate,
    PackingItemCreate, PackingItemUpdate,
)


# ── Trips ─────────────────────────────────────────────────────────────────────

def get_trips(db: Session) -> list[Trip]:
    return db.query(Trip).order_by(Trip.created_at.desc()).all()


def get_trip(db: Session, trip_id: int) -> Trip | None:
    return db.query(Trip).filter(Trip.id == trip_id).first()


def create_trip(db: Session, data: TripCreate) -> Trip:
    trip = Trip(**data.model_dump())
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


def update_trip(db: Session, trip: Trip, data: TripUpdate) -> Trip:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(trip, field, value)
    db.commit()
    db.refresh(trip)
    return trip


def delete_trip(db: Session, trip: Trip) -> None:
    db.delete(trip)
    db.commit()


def duplicate_trip(db: Session, trip_id: int) -> Trip | None:
    original = get_trip(db, trip_id)
    if not original:
        return None
    new_trip = Trip(
        title=f"{original.title} (Copy)",
        destination=original.destination,
        country=original.country,
        start_date=original.start_date,
        end_date=original.end_date,
        status="planning",
        budget=original.budget,
        currency=original.currency,
        notes=original.notes,
    )
    db.add(new_trip)
    db.flush()
    for item in original.itinerary:
        db.add(ItineraryItem(
            trip_id=new_trip.id,
            day_offset=item.day_offset,
            time_label=item.time_label,
            title=item.title,
            description=item.description,
            location=item.location,
            estimated_cost=item.estimated_cost,
        ))
    for item in original.packing_items:
        db.add(PackingItem(
            trip_id=new_trip.id,
            name=item.name,
            category=item.category,
            packed=False,
        ))
    db.commit()
    db.refresh(new_trip)
    return new_trip


# ── Itinerary ─────────────────────────────────────────────────────────────────

def create_itinerary_item(db: Session, data: ItineraryItemCreate) -> ItineraryItem:
    item = ItineraryItem(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_itinerary_item(db: Session, item: ItineraryItem, data: ItineraryItemUpdate) -> ItineraryItem:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


def delete_itinerary_item(db: Session, item: ItineraryItem) -> None:
    db.delete(item)
    db.commit()


# ── Packing ───────────────────────────────────────────────────────────────────

def create_packing_item(db: Session, data: PackingItemCreate) -> PackingItem:
    item = PackingItem(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_packing_item(db: Session, item: PackingItem, data: PackingItemUpdate) -> PackingItem:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


def delete_packing_item(db: Session, item: PackingItem) -> None:
    db.delete(item)
    db.commit()
