from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class HomeListingOut(BaseModel):
    id: int
    zillow_id: str
    address: str
    neighborhood: str
    price: int
    beds: Optional[int]
    baths: Optional[float]
    sqft: Optional[int]
    days_on_market: Optional[int]
    listing_agent: Optional[str]
    property_type: Optional[str]
    zillow_url: str
    image_url: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    is_active: bool
    first_seen: datetime
    last_seen: datetime
    is_favorite: bool = False
    is_dismissed: bool = False

    model_config = {"from_attributes": True}


class ScrapeLogOut(BaseModel):
    id: int
    ran_at: datetime
    listings_found: int
    new_listings: int
    status: str
    error_msg: Optional[str]

    model_config = {"from_attributes": True}


class ScrapeSettingsOut(BaseModel):
    max_price: int
    min_beds: int
    min_baths: float
    no_hoa: bool
    no_foreclosure: bool
    single_family_only: bool
    neighborhoods: list[str]

    model_config = {"from_attributes": True}


class ScrapeSettingsUpdate(BaseModel):
    max_price: Optional[int] = None
    min_beds: Optional[int] = None
    min_baths: Optional[float] = None
    no_hoa: Optional[bool] = None
    no_foreclosure: Optional[bool] = None
    single_family_only: Optional[bool] = None
    neighborhoods: Optional[list[str]] = None


class HomesStats(BaseModel):
    total_active: int
    new_today: int
    favorites: int
    by_neighborhood: dict[str, int]
    last_scraped: Optional[datetime]
    last_scrape_status: Optional[str]
