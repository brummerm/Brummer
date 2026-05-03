from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..crud import travel as crud
from ..schemas.travel import (
    TripCreate, TripUpdate, TripOut, TripWithDetails,
    ItineraryItemCreate, ItineraryItemUpdate, ItineraryItemOut,
    PackingItemCreate, PackingItemUpdate, PackingItemOut,
)

router = APIRouter(tags=["travel"])


# ── Trips ─────────────────────────────────────────────────────────────────────

@router.get("/trips", response_model=list[TripOut])
def list_trips(db: Session = Depends(get_db)):
    return crud.get_trips(db)


@router.post("/trips", response_model=TripOut, status_code=201)
def create_trip(data: TripCreate, db: Session = Depends(get_db)):
    return crud.create_trip(db, data)


@router.get("/trips/{trip_id}", response_model=TripWithDetails)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = crud.get_trip(db, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.put("/trips/{trip_id}", response_model=TripOut)
def update_trip(trip_id: int, data: TripUpdate, db: Session = Depends(get_db)):
    trip = crud.get_trip(db, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return crud.update_trip(db, trip, data)


@router.delete("/trips/{trip_id}", status_code=204)
def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = crud.get_trip(db, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    crud.delete_trip(db, trip)
    return Response(status_code=204)


# ── Itinerary ─────────────────────────────────────────────────────────────────

@router.post("/itinerary", response_model=ItineraryItemOut, status_code=201)
def add_itinerary_item(data: ItineraryItemCreate, db: Session = Depends(get_db)):
    return crud.create_itinerary_item(db, data)


@router.put("/itinerary/{item_id}", response_model=ItineraryItemOut)
def update_itinerary_item(item_id: int, data: ItineraryItemUpdate, db: Session = Depends(get_db)):
    from ..models.travel import ItineraryItem
    item = db.query(ItineraryItem).filter(ItineraryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Itinerary item not found")
    return crud.update_itinerary_item(db, item, data)


@router.delete("/itinerary/{item_id}", status_code=204)
def delete_itinerary_item(item_id: int, db: Session = Depends(get_db)):
    from ..models.travel import ItineraryItem
    item = db.query(ItineraryItem).filter(ItineraryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Itinerary item not found")
    crud.delete_itinerary_item(db, item)
    return Response(status_code=204)


# ── Packing ───────────────────────────────────────────────────────────────────

@router.post("/packing", response_model=PackingItemOut, status_code=201)
def add_packing_item(data: PackingItemCreate, db: Session = Depends(get_db)):
    return crud.create_packing_item(db, data)


@router.put("/packing/{item_id}", response_model=PackingItemOut)
def update_packing_item(item_id: int, data: PackingItemUpdate, db: Session = Depends(get_db)):
    from ..models.travel import PackingItem
    item = db.query(PackingItem).filter(PackingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Packing item not found")
    return crud.update_packing_item(db, item, data)


@router.delete("/packing/{item_id}", status_code=204)
def delete_packing_item(item_id: int, db: Session = Depends(get_db)):
    from ..models.travel import PackingItem
    item = db.query(PackingItem).filter(PackingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Packing item not found")
    crud.delete_packing_item(db, item)
    return Response(status_code=204)
