import asyncio
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models.homes import HomeListing
from ..schemas.homes import HomeListingOut, HomesStats
from ..crud import homes as homes_crud
from ..scrapers.zillow import run_full_scrape

logger = logging.getLogger(__name__)
router = APIRouter(tags=["homes"])

_scrape_lock = asyncio.Lock()


def _listing_to_out(listing: HomeListing, db: Session) -> HomeListingOut:
    action = homes_crud.get_action(db, listing.id)
    out = HomeListingOut.model_validate(listing)
    out.is_favorite = action == "favorite"
    out.is_dismissed = action == "dismiss"
    return out


# ── Listings ──────────────────────────────────────────────────────────────────

@router.get("/listings", response_model=list[HomeListingOut])
def list_listings(
    neighborhood: Optional[str] = Query(None),
    sort: str = Query("newest"),
    favorites_only: bool = Query(False),
    include_dismissed: bool = Query(False),
    db: Session = Depends(get_db),
):
    listings = homes_crud.get_listings(
        db,
        neighborhood=neighborhood,
        sort=sort,
        include_dismissed=include_dismissed,
        favorites_only=favorites_only,
    )
    return [_listing_to_out(l, db) for l in listings]


@router.get("/listings/{listing_id}", response_model=HomeListingOut)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(HomeListing).filter(HomeListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return _listing_to_out(listing, db)


# ── Actions ───────────────────────────────────────────────────────────────────

@router.post("/listings/{listing_id}/favorite", response_model=HomeListingOut)
def toggle_favorite(listing_id: int, db: Session = Depends(get_db)):
    current = homes_crud.get_action(db, listing_id)
    new_action = None if current == "favorite" else "favorite"
    if not homes_crud.set_action(db, listing_id, new_action):
        raise HTTPException(status_code=404, detail="Listing not found")
    listing = db.query(HomeListing).filter(HomeListing.id == listing_id).first()
    return _listing_to_out(listing, db)


@router.post("/listings/{listing_id}/dismiss", response_model=HomeListingOut)
def dismiss_listing(listing_id: int, db: Session = Depends(get_db)):
    if not homes_crud.set_action(db, listing_id, "dismiss"):
        raise HTTPException(status_code=404, detail="Listing not found")
    listing = db.query(HomeListing).filter(HomeListing.id == listing_id).first()
    return _listing_to_out(listing, db)


@router.delete("/listings/{listing_id}/dismiss", status_code=status.HTTP_204_NO_CONTENT)
def undo_dismiss(listing_id: int, db: Session = Depends(get_db)):
    homes_crud.set_action(db, listing_id, None)


# ── Stats ─────────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=HomesStats)
def get_stats(db: Session = Depends(get_db)):
    return HomesStats(**homes_crud.get_stats(db))


# ── Manual scrape trigger ─────────────────────────────────────────────────────

@router.post("/scrape")
async def trigger_scrape(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Kick off a scrape in the background. Returns immediately."""
    if _scrape_lock.locked():
        return {"status": "already_running"}
    background_tasks.add_task(_do_scrape, db)
    return {"status": "started"}


async def _do_scrape(db: Session):
    """Run scrape and persist results."""
    async with _scrape_lock:
        logger.info("[homes] Starting Zillow scrape...")
        try:
            result = await run_full_scrape()
            listings_data = result["listings"]
            errors = result["errors"]

            new_count = 0
            seen_by_neighborhood: dict[str, set] = {}

            for data in listings_data:
                hood = data["neighborhood"]
                seen_by_neighborhood.setdefault(hood, set()).add(data["zillow_id"])
                _, is_new = homes_crud.upsert_listing(db, data)
                if is_new:
                    new_count += 1

            for hood, seen_ids in seen_by_neighborhood.items():
                homes_crud.mark_stale(db, hood, seen_ids)

            status = result["status"]
            error_msg = "; ".join(errors) if errors else None
            homes_crud.log_scrape(db, len(listings_data), new_count, status, error_msg)
            logger.info(
                f"[homes] Scrape complete: {len(listings_data)} found, {new_count} new. Status: {status}"
            )
        except Exception as exc:
            logger.error(f"[homes] Scrape failed: {exc}", exc_info=True)
            try:
                homes_crud.log_scrape(db, 0, 0, "error", str(exc))
            except Exception:
                pass
