from __future__ import annotations
from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional


class ItineraryItemBase(BaseModel):
    day_offset: int = 0
    time_label: str = ""
    title: str
    description: str = ""
    location: str = ""
    estimated_cost: float = 0.0


class ItineraryItemCreate(ItineraryItemBase):
    trip_id: int


class ItineraryItemUpdate(BaseModel):
    day_offset: Optional[int] = None
    time_label: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    estimated_cost: Optional[float] = None


class ItineraryItemOut(ItineraryItemBase):
    id: int
    trip_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class PackingItemBase(BaseModel):
    name: str
    category: str = "General"
    packed: bool = False


class PackingItemCreate(PackingItemBase):
    trip_id: int


class PackingItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    packed: Optional[bool] = None


class PackingItemOut(PackingItemBase):
    id: int
    trip_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TripBase(BaseModel):
    title: str
    destination: str
    country: str = ""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: float = 0.0
    currency: str = "USD"
    status: str = "planning"
    notes: str = ""


class TripCreate(TripBase):
    pass


class TripUpdate(BaseModel):
    title: Optional[str] = None
    destination: Optional[str] = None
    country: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class TripOut(TripBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TripWithDetails(TripOut):
    itinerary: list[ItineraryItemOut] = []
    packing_items: list[PackingItemOut] = []
