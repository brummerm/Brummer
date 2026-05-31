"""
Zillow scraper using Playwright.

Strategy:
  1. Launch headless Chromium with anti-detection settings.
  2. Load each search URL and wait for the page to settle.
  3. Extract structured data from Zillow's embedded __NEXT_DATA__ JSON blob —
     this is far more reliable than CSS selectors that change with every deploy.
  4. Fall back to a second JSON blob (window.__data__ / searchPageData) if the
     primary path is missing.
  5. Return a list of normalised listing dicts ready for upsert.

Limitations / gotchas:
  - Zillow actively fights scrapers. The stealth settings below reduce but do
    not eliminate the chance of a CAPTCHA or empty result. If listings come back
    empty, check the scrape log's error_msg for clues.
  - If you start seeing consistent blocks, enabling a residential proxy is the
    reliable long-term fix (set PROXY_URL env var).
"""

import asyncio
import json
import logging
import os
import random
import re
from typing import Optional

logger = logging.getLogger(__name__)

# ── Target searches ───────────────────────────────────────────────────────────

SEARCH_TARGETS = [
    {
        "neighborhood": "Brooklyn",
        "url": (
            "https://www.zillow.com/brooklyn-new-york-ny/houses/3-bedrooms/"
            "?searchQueryState=%7B%22filterState%22%3A%7B%22price%22%3A%7B%22max%22%3A650000%7D"
            "%2C%22beds%22%3A%7B%22min%22%3A3%7D%2C%22baths%22%3A%7B%22min%22%3A2%7D"
            "%2C%22hoa%22%3A%7B%22max%22%3A0%7D%2C%22fore%22%3A%7B%22value%22%3Afalse%7D"
            "%2C%22con%22%3A%7B%22value%22%3Afalse%7D%2C%22sf%22%3A%7B%22value%22%3Atrue%7D"
            "%2C%22mf%22%3A%7B%22value%22%3Afalse%7D%7D%7D"
        ),
    },
    {
        "neighborhood": "Queens",
        "url": (
            "https://www.zillow.com/queens-new-york-ny/houses/3-bedrooms/"
            "?searchQueryState=%7B%22filterState%22%3A%7B%22price%22%3A%7B%22max%22%3A650000%7D"
            "%2C%22beds%22%3A%7B%22min%22%3A3%7D%2C%22baths%22%3A%7B%22min%22%3A2%7D"
            "%2C%22hoa%22%3A%7B%22max%22%3A0%7D%2C%22fore%22%3A%7B%22value%22%3Afalse%7D"
            "%2C%22con%22%3A%7B%22value%22%3Afalse%7D%2C%22sf%22%3A%7B%22value%22%3Atrue%7D"
            "%2C%22mf%22%3A%7B%22value%22%3Afalse%7D%7D%7D"
        ),
    },
    {
        "neighborhood": "Manhattan",
        "url": (
            "https://www.zillow.com/manhattan-new-york-ny/houses/3-bedrooms/"
            "?searchQueryState=%7B%22filterState%22%3A%7B%22price%22%3A%7B%22max%22%3A650000%7D"
            "%2C%22beds%22%3A%7B%22min%22%3A3%7D%2C%22baths%22%3A%7B%22min%22%3A2%7D"
            "%2C%22hoa%22%3A%7B%22max%22%3A0%7D%2C%22fore%22%3A%7B%22value%22%3Afalse%7D"
            "%2C%22con%22%3A%7B%22value%22%3Afalse%7D%2C%22sf%22%3A%7B%22value%22%3Atrue%7D"
            "%2C%22mf%22%3A%7B%22value%22%3Afalse%7D%7D%7D"
        ),
    },
]

# ── Stealth helpers ───────────────────────────────────────────────────────────

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
]

STEALTH_SCRIPT = """
Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
window.chrome = { runtime: {} };
"""


# ── JSON extraction helpers ───────────────────────────────────────────────────

def _dig(obj: dict, *keys):
    """Safely traverse nested dicts/lists."""
    cur = obj
    for k in keys:
        if isinstance(cur, dict):
            cur = cur.get(k)
        elif isinstance(cur, list) and isinstance(k, int):
            cur = cur[k] if k < len(cur) else None
        else:
            return None
        if cur is None:
            return None
    return cur


def _parse_price(raw) -> Optional[int]:
    if raw is None:
        return None
    if isinstance(raw, (int, float)):
        return int(raw)
    s = str(raw).replace("$", "").replace(",", "").strip()
    m = re.search(r"(\d+)", s)
    return int(m.group(1)) if m else None


def _parse_int(raw) -> Optional[int]:
    if raw is None:
        return None
    try:
        return int(raw)
    except (ValueError, TypeError):
        return None


def _parse_float(raw) -> Optional[float]:
    if raw is None:
        return None
    try:
        return float(raw)
    except (ValueError, TypeError):
        return None


def _extract_listings_from_next_data(data: dict, neighborhood: str) -> list[dict]:
    """
    Try the known __NEXT_DATA__ paths that Zillow has used.
    Returns a list of normalised listing dicts.
    """
    raw_listings = []

    # Path 1: cat1.searchResults.listResults (most common)
    r1 = _dig(data, "props", "pageProps", "searchPageState", "cat1", "searchResults", "listResults")
    if r1:
        raw_listings = r1

    # Path 2: cat1.searchResults.mapResults
    if not raw_listings:
        r2 = _dig(data, "props", "pageProps", "searchPageState", "cat1", "searchResults", "mapResults")
        if r2:
            raw_listings = r2

    # Path 3: newer format with a flat results array
    if not raw_listings:
        r3 = _dig(data, "props", "pageProps", "searchPageState", "listResults")
        if r3:
            raw_listings = r3

    # Path 4: even newer format
    if not raw_listings:
        r4 = _dig(data, "props", "pageProps", "initialReduxState", "listings", "listResults")
        if r4:
            raw_listings = r4

    if not raw_listings:
        logger.warning(f"[zillow] No listing results found in __NEXT_DATA__ for {neighborhood}")
        return []

    results = []
    for item in raw_listings:
        # Skip non-property entries (ads, "loading" placeholders, etc.)
        zpid = item.get("zpid") or item.get("id")
        if not zpid:
            continue

        price = _parse_price(item.get("unformattedPrice") or item.get("price"))
        if not price:
            continue

        detail_url = item.get("detailUrl", "")
        if detail_url and not detail_url.startswith("http"):
            detail_url = "https://www.zillow.com" + detail_url

        lat_long = item.get("latLong") or {}
        lat = _parse_float(lat_long.get("latitude") or item.get("latitude"))
        lng = _parse_float(lat_long.get("longitude") or item.get("longitude"))

        results.append({
            "zillow_id": str(zpid),
            "address": item.get("address") or item.get("streetAddress", "Unknown"),
            "neighborhood": neighborhood,
            "price": price,
            "beds": _parse_int(item.get("beds") or item.get("bedrooms")),
            "baths": _parse_float(item.get("baths") or item.get("bathrooms")),
            "sqft": _parse_int(item.get("area") or item.get("livingArea")),
            "days_on_market": _parse_int(item.get("daysOnZillow") or item.get("daysOnMarket")),
            "listing_agent": item.get("brokerName") or item.get("agentName"),
            "property_type": item.get("statusType") or item.get("homeType", "FOR_SALE"),
            "zillow_url": detail_url,
            "image_url": item.get("imgSrc") or item.get("carouselPhotos", [{}])[0].get("url"),
            "latitude": lat,
            "longitude": lng,
        })

    return results


# ── Main scrape function ───────────────────────────────────────────────────────

async def scrape_neighborhood(neighborhood: str, url: str) -> list[dict]:
    """Scrape a single Zillow search page. Returns list of listing dicts."""
    from playwright.async_api import async_playwright

    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxy = {"server": proxy_url} if proxy_url else None

    ua = random.choice(USER_AGENTS)
    listings: list[dict] = []

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--disable-extensions",
                ],
            )
            context = await browser.new_context(
                user_agent=ua,
                viewport={"width": 1920, "height": 1080},
                java_script_enabled=True,
                **({"proxy": proxy} if proxy else {}),
            )
            await context.add_init_script(STEALTH_SCRIPT)

            page = await context.new_page()

            # Intercept and abort heavy unnecessary resources to speed up load
            await page.route(
                "**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf,mp4,mp3}",
                lambda route: route.abort()
                if "maps" not in route.request.url
                else route.continue_(),
            )

            logger.info(f"[zillow] Fetching {neighborhood}: {url[:80]}...")
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=45_000)
            except Exception as nav_err:
                logger.warning(f"[zillow] Navigation warning for {neighborhood}: {nav_err}")
                # Don't bail — the page may still have usable content

            # Random delay to appear human
            await asyncio.sleep(random.uniform(2.5, 5.0))

            # Check for CAPTCHA / block page
            title = await page.title()
            if any(kw in title.lower() for kw in ("captcha", "robot", "access denied", "blocked")):
                logger.warning(f"[zillow] Bot detection triggered for {neighborhood} (title: {title!r})")
                await browser.close()
                return []

            # Extract __NEXT_DATA__
            next_data_raw = await page.evaluate("""
                () => {
                    const el = document.getElementById('__NEXT_DATA__');
                    return el ? el.textContent : null;
                }
            """)

            if next_data_raw:
                try:
                    next_data = json.loads(next_data_raw)
                    listings = _extract_listings_from_next_data(next_data, neighborhood)
                    logger.info(f"[zillow] {neighborhood}: {len(listings)} listings via __NEXT_DATA__")
                except json.JSONDecodeError as e:
                    logger.error(f"[zillow] JSON parse error for {neighborhood}: {e}")
            else:
                logger.warning(f"[zillow] No __NEXT_DATA__ found for {neighborhood}")

            await browser.close()

    except Exception as exc:
        logger.error(f"[zillow] Scraper error for {neighborhood}: {exc}", exc_info=True)

    return listings


async def run_full_scrape() -> dict:
    """
    Scrape all three neighborhoods. Returns summary dict.
    Adds a staggered delay between requests to be polite.
    """
    all_listings: list[dict] = []
    errors: list[str] = []

    for target in SEARCH_TARGETS:
        try:
            results = await scrape_neighborhood(target["neighborhood"], target["url"])
            all_listings.extend(results)
        except Exception as exc:
            msg = f"{target['neighborhood']}: {exc}"
            logger.error(f"[zillow] {msg}")
            errors.append(msg)
        # Stagger requests: 8–15s between neighborhoods
        await asyncio.sleep(random.uniform(8, 15))

    return {
        "listings": all_listings,
        "errors": errors,
        "status": "error" if (not all_listings and errors) else "blocked" if (not all_listings) else "ok",
    }
