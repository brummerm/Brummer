from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
from typing import Optional
from ..models.homes import HomeListing, HomeListingAction, ScrapeLog, ScrapeSettings
import json


# ── Listings ──────────────────────────────────────────────────────────────────

def upsert_listing(db: Session, data: dict) -> tuple["HomeListing", bool]:
    """Insert new or refresh last_seen on existing listing. Returns (listing, is_new)."""
    existing = db.query(HomeListing).filter(HomeListing.zillow_id == data["zillow_id"]).first()
    if existing:
        existing.price = data["price"]
        existing.days_on_market = data.get("days_on_market")
        existing.image_url = data.get("image_url")
        existing.is_active = True
        existing.last_seen = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing)
        return existing, False
    else:
        listing = HomeListing(**data)
        db.add(listing)
        db.commit()
        db.refresh(listing)
        return listing, True


def mark_stale(db: Session, neighborhood: str, seen_ids: set[str]) -> int:
    """Mark listings not seen in the latest scrape as inactive."""
    if not seen_ids:
        return 0
    stale = (
        db.query(HomeListing)
        .filter(
            HomeListing.neighborhood == neighborhood,
            HomeListing.is_active == True,
            ~HomeListing.zillow_id.in_(seen_ids),
        )
        .all()
    )
    for listing in stale:
        listing.is_active = False
    db.commit()
    return len(stale)


def get_listings(
    db: Session,
    neighborhood: Optional[str] = None,
    sort: str = "newest",
    include_dismissed: bool = False,
    favorites_only: bool = False,
) -> list[HomeListing]:
    dismissed_ids = {
        a.listing_id
        for a in db.query(HomeListingAction).filter(HomeListingAction.action == "dismiss").all()
    }
    favorite_ids = {
        a.listing_id
        for a in db.query(HomeListingAction).filter(HomeListingAction.action == "favorite").all()
    }

    q = db.query(HomeListing).filter(HomeListing.is_active == True)
    if neighborhood:
        q = q.filter(HomeListing.neighborhood == neighborhood)
    if not include_dismissed:
        if dismissed_ids:
            q = q.filter(~HomeListing.id.in_(dismissed_ids))
    if favorites_only:
        if favorite_ids:
            q = q.filter(HomeListing.id.in_(favorite_ids))
        else:
            return []

    if sort == "price_asc":
        q = q.order_by(HomeListing.price.asc())
    elif sort == "price_desc":
        q = q.order_by(HomeListing.price.desc())
    elif sort == "dom":
        q = q.order_by(HomeListing.days_on_market.asc())
    else:  # newest
        q = q.order_by(HomeListing.first_seen.desc())

    listings = q.all()
    # Attach computed flags
    for listing in listings:
        listing._is_favorite = listing.id in favorite_ids
        listing._is_dismissed = listing.id in dismissed_ids
    return listings


def set_action(db: Session, listing_id: int, action: Optional[str]) -> bool:
    """
    Set or clear an action ('favorite' | 'dismiss') on a listing.
    Pass action=None to clear. Returns True if listing exists.
    """
    listing = db.query(HomeListing).filter(HomeListing.id == listing_id).first()
    if not listing:
        return False
    existing = db.query(HomeListingAction).filter(
        HomeListingAction.listing_id == listing_id
    ).first()
    if action is None:
        if existing:
            db.delete(existing)
            db.commit()
    elif existing:
        existing.action = action
        db.commit()
    else:
        db.add(HomeListingAction(listing_id=listing_id, action=action))
        db.commit()
    return True


def get_action(db: Session, listing_id: int) -> Optional[str]:
    a = db.query(HomeListingAction).filter(HomeListingAction.listing_id == listing_id).first()
    return a.action if a else None


# ── Stats ─────────────────────────────────────────────────────────────────────

def get_stats(db: Session) -> dict:
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    dismissed_ids = {
        a.listing_id
        for a in db.query(HomeListingAction).filter(HomeListingAction.action == "dismiss").all()
    }
    total_active = (
        db.query(HomeListing)
        .filter(HomeListing.is_active == True, ~HomeListing.id.in_(dismissed_ids))
        .count()
        if dismissed_ids
        else db.query(HomeListing).filter(HomeListing.is_active == True).count()
    )
    new_today = db.query(HomeListing).filter(
        HomeListing.is_active == True,
        HomeListing.first_seen >= today_start,
    ).count()
    favorites = db.query(HomeListingAction).filter(HomeListingAction.action == "favorite").count()

    by_neighborhood = {}
    for neighborhood in ("Brooklyn", "Queens", "Manhattan"):
        q = db.query(HomeListing).filter(
            HomeListing.is_active == True,
            HomeListing.neighborhood == neighborhood,
        )
        if dismissed_ids:
            q = q.filter(~HomeListing.id.in_(dismissed_ids))
        by_neighborhood[neighborhood] = q.count()

    last_log = db.query(ScrapeLog).order_by(ScrapeLog.ran_at.desc()).first()

    return {
        "total_active": total_active,
        "new_today": new_today,
        "favorites": favorites,
        "by_neighborhood": by_neighborhood,
        "last_scraped": last_log.ran_at if last_log else None,
        "last_scrape_status": last_log.status if last_log else None,
    }


# ── Scrape log ────────────────────────────────────────────────────────────────

def log_scrape(db: Session, listings_found: int, new_listings: int, status: str = "ok", error_msg: str = None):
    log = ScrapeLog(
        listings_found=listings_found,
        new_listings=new_listings,
        status=status,
        error_msg=error_msg,
    )
    db.add(log)
    db.commit()


# ── Scrape settings ───────────────────────────────────────────────────────────

def get_settings(db: Session) -> ScrapeSettings:
    """Return singleton settings row, creating defaults on first call."""
    row = db.query(ScrapeSettings).filter(ScrapeSettings.id == 1).first()
    if not row:
        row = ScrapeSettings(id=1)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


def update_settings(db: Session, data: dict) -> ScrapeSettings:
    row = get_settings(db)
    for field, value in data.items():
        if field == "neighborhoods":
            row.neighborhoods_json = json.dumps(value)
        elif value is not None and hasattr(row, field):
            setattr(row, field, value)
    db.commit()
    db.refresh(row)
    return row


def settings_neighborhoods(settings: ScrapeSettings) -> list[str]:
    try:
        return json.loads(settings.neighborhoods_json)
    except Exception:
        return ["Brooklyn", "Queens", "Manhattan"]
