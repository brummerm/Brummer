from sqlalchemy import Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from typing import Optional
from ..database import Base


class HomeListing(Base):
    __tablename__ = "home_listings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    zillow_id: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    address: Mapped[str] = mapped_column(String, nullable=False)
    neighborhood: Mapped[str] = mapped_column(String, nullable=False)  # Brooklyn/Queens/Manhattan
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    beds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    baths: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    sqft: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    days_on_market: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    listing_agent: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    property_type: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    zillow_url: Mapped[str] = mapped_column(String, nullable=False)
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    first_seen: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_seen: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())

    actions: Mapped[list["HomeListingAction"]] = relationship(
        "HomeListingAction", back_populates="listing", cascade="all, delete"
    )


class HomeListingAction(Base):
    """Stores 'favorite' or 'dismiss' per listing. Only one action per listing (upsert)."""
    __tablename__ = "home_listing_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    listing_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("home_listings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    action: Mapped[str] = mapped_column(String, nullable=False)  # 'favorite' | 'dismiss'
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())

    listing: Mapped["HomeListing"] = relationship("HomeListing", back_populates="actions")


class ScrapeLog(Base):
    """Tracks scrape runs so we can show 'last updated' and 'new today' counts."""
    __tablename__ = "home_scrape_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ran_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())
    listings_found: Mapped[int] = mapped_column(Integer, default=0)
    new_listings: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String, default="ok")  # ok | error | blocked
    error_msg: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
