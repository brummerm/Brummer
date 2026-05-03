from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Trip(Base):
    __tablename__ = "trips"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    country = Column(String, default="")
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    budget = Column(Float, default=0.0)
    currency = Column(String, default="USD")
    status = Column(String, default="planning")  # planning | active | completed | cancelled
    notes = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    itinerary = relationship(
        "ItineraryItem", back_populates="trip",
        cascade="all, delete-orphan",
        order_by="ItineraryItem.day_offset, ItineraryItem.id",
    )
    packing_items = relationship(
        "PackingItem", back_populates="trip",
        cascade="all, delete-orphan",
        order_by="PackingItem.category, PackingItem.id",
    )


class ItineraryItem(Base):
    __tablename__ = "itinerary_items"
    id = Column(Integer, primary_key=True, autoincrement=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    day_offset = Column(Integer, default=0)  # 0 = day 1
    time_label = Column(String, default="")  # e.g. "9:00 AM"
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    location = Column(String, default="")
    estimated_cost = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    trip = relationship("Trip", back_populates="itinerary")


class PackingItem(Base):
    __tablename__ = "packing_items"
    id = Column(Integer, primary_key=True, autoincrement=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, default="General")
    packed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    trip = relationship("Trip", back_populates="packing_items")
