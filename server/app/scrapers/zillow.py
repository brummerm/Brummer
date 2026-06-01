"""
Zillow scraper — two-layer approach.

Layer 1 (httpx, fast):
  Hit the Zillow search URL directly using httpx with HTTP/2 and full
  browser-like headers. Zillow uses Next.js SSR, so __NEXT_DATA__ is
  embedded in the raw HTML before any JS runs. No browser automation
  fingerprint → often gets through bot detection that Playwright trips.

Layer 2 (Playwright + stealth, fallback):
  If httpx returns a blocked/empty page, launch a headless Chromium with
  playwright-stealth applied. This patches every known automation telltale
  (webdriver flag, plugins array, chrome object, permissions API, etc.)
  and handles JS-challenge pages that httpx cannot.

Proxy support:
  Set PROXY_URL env var (e.g. http://user:pass@host:port) to route all
  requests through a residential proxy — most reliable long-term fix if
  Zillow tightens detection further.
"""

import asyncio
import json
import logging
import os
import random
import re
from typing import Optional
import httpx

logger = logging.getLogger(__name__)

# ── Search targets ────────────────────────────────────────────────────────────

# Neighborhood display name → Zillow URL slug
NEIGHBORHOOD_SLUGS: dict[str, str] = {
    "Brooklyn":      "brooklyn-new-york-ny",
    "Queens":        "queens-new-york-ny",
    "Manhattan":     "manhattan-new-york-ny",
    "Bronx":         "bronx-new-york-ny",
    "Staten Island": "staten-island-new-york-ny",
}

# Available neighborhoods shown in the Settings UI
ALL_NEIGHBORHOODS = list(NEIGHBORHOOD_SLUGS.keys())


def build_search_targets(settings) -> list[dict]:
    """Build the list of {neighborhood, url} dicts from current ScrapeSettings."""
    import urllib.parse as _up

    neighborhoods = []
    try:
        import json as _json
        neighborhoods = _json.loads(settings.neighborhoods_json)
    except Exception:
        neighborhoods = ["Brooklyn", "Queens", "Manhattan"]

    targets = []
    for hood in neighborhoods:
        slug = NEIGHBORHOOD_SLUGS.get(hood)
        if not slug:
            continue
        filter_state: dict = {
            "filterState": {
                "price": {"max": settings.max_price},
                "beds":  {"min": settings.min_beds},
                "baths": {"min": settings.min_baths},
                "fore":  {"value": False},
                "con":   {"value": False},
            }
        }
        if settings.no_hoa:
            filter_state["filterState"]["hoa"] = {"max": 0}
        if settings.single_family_only:
            filter_state["filterState"]["sf"] = {"value": True}
            filter_state["filterState"]["mf"] = {"value": False}

        encoded = _up.quote(
            json.dumps(filter_state, separators=(",", ":")), safe=""
        )
        beds_str = f"{settings.min_beds}-bedrooms"
        url = (
            f"https://www.zillow.com/{slug}/houses/{beds_str}/"
            f"?searchQueryState={encoded}"
        )
        targets.append({"neighborhood": hood, "url": url})
    return targets

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
]

# ── Data extraction helpers ───────────────────────────────────────────────────

def _dig(obj, *keys):
    cur = obj
    for k in keys:
        if isinstance(cur, dict):
            cur = cur.get(k)
        elif isinstance(cur, list) and isinstance(k, int) and k < len(cur):
            cur = cur[k]
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
    s = re.sub(r"[^\d]", "", str(raw))
    return int(s) if s else None


def _int(v) -> Optional[int]:
    try:
        return int(v) if v is not None else None
    except (ValueError, TypeError):
        return None


def _float(v) -> Optional[float]:
    try:
        return float(v) if v is not None else None
    except (ValueError, TypeError):
        return None


def _extract_listings(data: dict, neighborhood: str) -> list[dict]:
    """Try all known __NEXT_DATA__ paths and return normalised listing dicts."""
    raw: list = []
    for path in (
        ("props", "pageProps", "searchPageState", "cat1", "searchResults", "listResults"),
        ("props", "pageProps", "searchPageState", "cat1", "searchResults", "mapResults"),
        ("props", "pageProps", "searchPageState", "listResults"),
        ("props", "pageProps", "initialReduxState", "listings", "listResults"),
    ):
        found = _dig(data, *path)
        if found:
            raw = found
            break

    if not raw:
        logger.warning("[zillow] No listResults found in __NEXT_DATA__ for %s", neighborhood)
        return []

    results = []
    for item in raw:
        zpid = item.get("zpid") or item.get("id")
        if not zpid:
            continue
        price = _parse_price(item.get("unformattedPrice") or item.get("price"))
        if not price:
            continue
        detail = item.get("detailUrl", "")
        if detail and not detail.startswith("http"):
            detail = "https://www.zillow.com" + detail
        ll = item.get("latLong") or {}
        results.append({
            "zillow_id": str(zpid),
            "address": item.get("address") or item.get("streetAddress", "Unknown"),
            "neighborhood": neighborhood,
            "price": price,
            "beds": _int(item.get("beds") or item.get("bedrooms")),
            "baths": _float(item.get("baths") or item.get("bathrooms")),
            "sqft": _int(item.get("area") or item.get("livingArea")),
            "days_on_market": _int(item.get("daysOnZillow") or item.get("daysOnMarket")),
            "listing_agent": item.get("brokerName") or item.get("agentName"),
            "property_type": item.get("statusType") or item.get("homeType", "FOR_SALE"),
            "zillow_url": detail,
            "image_url": (
                item.get("imgSrc")
                or (_dig(item, "carouselPhotos", 0, "url"))
            ),
            "latitude": _float(ll.get("latitude") or item.get("latitude")),
            "longitude": _float(ll.get("longitude") or item.get("longitude")),
        })
    return results


def _parse_next_data_from_html(html: str, neighborhood: str) -> list[dict]:
    m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.DOTALL)
    if not m:
        return []
    try:
        data = json.loads(m.group(1))
        return _extract_listings(data, neighborhood)
    except json.JSONDecodeError:
        return []


# ── Layer 1: httpx (no browser fingerprint) ───────────────────────────────────

def _browser_headers(ua: str, referer: str = "") -> dict:
    h = {
        "User-Agent": ua,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "max-age=0",
        "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "Connection": "keep-alive",
    }
    if referer:
        h["Referer"] = referer
        h["Sec-Fetch-Site"] = "same-origin"
    return h


async def _scraperapi_scrape(url: str, neighborhood: str) -> list[dict]:
    """Route through ScraperAPI residential IPs to bypass Cloudflare/datacenter blocks."""
    import urllib.parse
    key = os.getenv("SCRAPERAPI_KEY", "").strip()
    if not key:
        return []
    api_url = (
        f"http://api.scraperapi.com"
        f"?api_key={key}"
        f"&url={urllib.parse.quote(url, safe='')}"
        f"&render=true"
        f"&country_code=us"
    )
    try:
        async with httpx.AsyncClient(timeout=90.0, follow_redirects=True) as client:
            logger.info("[zillow][scraperapi] Fetching %s…", neighborhood)
            resp = await client.get(api_url)
            logger.info("[zillow][scraperapi] %s → HTTP %d (%d bytes)",
                        neighborhood, resp.status_code, len(resp.content))
            if resp.status_code != 200:
                logger.warning("[zillow][scraperapi] Non-200 for %s: %d", neighborhood, resp.status_code)
                return []
            listings = _parse_next_data_from_html(resp.text, neighborhood)
            logger.info("[zillow][scraperapi] %s: %d listings", neighborhood, len(listings))
            return listings
    except Exception as exc:
        logger.warning("[zillow][scraperapi] %s failed: %s", neighborhood, exc)
        return []


async def _httpx_scrape(url: str, neighborhood: str) -> list[dict]:
    """
    Attempt to get listings via plain HTTP (no browser).
    Zillow SSRs __NEXT_DATA__ into the HTML, so this works when the request
    is not flagged as a bot.
    """
    ua = random.choice(USER_AGENTS)
    proxy = os.getenv("PROXY_URL", "").strip() or None

    client_kwargs: dict = {
        "http2": True,
        "follow_redirects": True,
        "timeout": 30.0,
    }
    if proxy:
        client_kwargs["proxies"] = proxy

    try:
        async with httpx.AsyncClient(**client_kwargs) as client:
            # Step 1: hit Zillow homepage to seed cookies
            await client.get(
                "https://www.zillow.com/",
                headers=_browser_headers(ua),
            )
            await asyncio.sleep(random.uniform(1.5, 3.0))

            # Step 2: fetch the actual search page
            resp = await client.get(url, headers=_browser_headers(ua, "https://www.zillow.com/"))
            logger.info("[zillow][httpx] %s → HTTP %d (%d bytes)",
                        neighborhood, resp.status_code, len(resp.content))

            if resp.status_code != 200:
                logger.warning("[zillow][httpx] Non-200 for %s: %d", neighborhood, resp.status_code)
                return []

            listings = _parse_next_data_from_html(resp.text, neighborhood)
            if listings:
                logger.info("[zillow][httpx] %s: %d listings", neighborhood, len(listings))
            else:
                logger.warning("[zillow][httpx] %s: no listings in HTML (may be blocked)", neighborhood)
            return listings

    except Exception as exc:
        logger.warning("[zillow][httpx] %s failed: %s", neighborhood, exc)
        return []


# ── Layer 2: Playwright + stealth (fallback) ──────────────────────────────────

PLAYWRIGHT_STEALTH_SCRIPT = """
// Mask webdriver
Object.defineProperty(navigator, 'webdriver', {get: () => undefined});

// Realistic plugins
const makePlugin = (name, filename, mimeTypes=[]) => {
    const plugin = {name, filename, length: mimeTypes.length};
    mimeTypes.forEach((mt, i) => { plugin[i] = mt; });
    return plugin;
};
Object.defineProperty(navigator, 'plugins', {
    get: () => {
        const plugins = [
            makePlugin('Chrome PDF Plugin', 'internal-pdf-viewer'),
            makePlugin('Chrome PDF Viewer', 'mhjfbmdgcfjbbpaeojofohoefgiehjai'),
            makePlugin('Native Client', 'internal-nacl-plugin'),
        ];
        plugins.length = 3;
        plugins.item = (i) => plugins[i];
        plugins.namedItem = (n) => plugins.find(p => p.name === n) || null;
        plugins.refresh = () => {};
        return plugins;
    }
});

// Language
Object.defineProperty(navigator, 'languages', {get: () => ['en-US', 'en']});

// Chrome object
window.chrome = {
    runtime: {id: undefined, connect: ()=>{}, sendMessage: ()=>{}},
    loadTimes: () => ({}),
    csi: () => ({}),
    app: {isInstalled: false},
};

// Permissions
const _origQuery = window.navigator.permissions ? window.navigator.permissions.query.bind(window.navigator.permissions) : null;
if (_origQuery) {
    window.navigator.permissions.query = (params) =>
        params.name === 'notifications'
            ? Promise.resolve({state: Notification.permission, onchange: null})
            : _origQuery(params);
}

// iFrame check
HTMLIFrameElement.prototype.__defineGetter__('contentWindow', function() {
    return window;
});

// Screen
Object.defineProperty(screen, 'width', {get: () => 1920});
Object.defineProperty(screen, 'height', {get: () => 1080});
Object.defineProperty(screen, 'availWidth', {get: () => 1920});
Object.defineProperty(screen, 'availHeight', {get: () => 1040});
Object.defineProperty(screen, 'colorDepth', {get: () => 24});
Object.defineProperty(screen, 'pixelDepth', {get: () => 24});
"""


async def _playwright_scrape(url: str, neighborhood: str) -> list[dict]:
    """Playwright fallback with stealth patches."""
    from playwright.async_api import async_playwright

    ua = random.choice(USER_AGENTS)
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxy = {"server": proxy_url} if proxy_url else None

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
                    "--disable-infobars",
                    "--window-size=1920,1080",
                    "--start-maximized",
                ],
            )
            context = await browser.new_context(
                user_agent=ua,
                viewport={"width": 1920, "height": 1080},
                locale="en-US",
                timezone_id="America/New_York",
                java_script_enabled=True,
                **({"proxy": proxy} if proxy else {}),
            )
            # Apply stealth script to every new page
            await context.add_init_script(PLAYWRIGHT_STEALTH_SCRIPT)

            # Try to also apply playwright-stealth if available
            try:
                from playwright_stealth import stealth_async
                page = await context.new_page()
                await stealth_async(page)
            except ImportError:
                page = await context.new_page()

            # Block heavy resources but allow the page to load JS
            await page.route(
                re.compile(r"\.(png|jpg|jpeg|gif|webp|svg|woff2?|ttf|eot|mp4|mp3)$"),
                lambda r: r.abort(),
            )

            logger.info("[zillow][playwright] Fetching %s…", neighborhood)
            try:
                await page.goto(url, wait_until="networkidle", timeout=60_000)
            except Exception as nav_err:
                logger.warning("[zillow][playwright] Navigation warning %s: %s", neighborhood, nav_err)

            await asyncio.sleep(random.uniform(2, 4))

            # Scroll to trigger any lazy-load
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
            await asyncio.sleep(1)

            title = await page.title()
            if any(kw in title.lower() for kw in ("captcha", "robot", "blocked", "access denied")):
                logger.warning("[zillow][playwright] Blocked for %s (title: %r)", neighborhood, title)
                await browser.close()
                return []

            # Try __NEXT_DATA__ via JS eval
            raw = await page.evaluate("""
                () => {
                    const el = document.getElementById('__NEXT_DATA__');
                    return el ? el.textContent : null;
                }
            """)

            listings = []
            if raw:
                try:
                    data = json.loads(raw)
                    listings = _extract_listings(data, neighborhood)
                    logger.info("[zillow][playwright] %s: %d listings", neighborhood, len(listings))
                except json.JSONDecodeError as e:
                    logger.error("[zillow][playwright] JSON error %s: %s", neighborhood, e)
            else:
                # Last resort: parse from page HTML
                html = await page.content()
                listings = _parse_next_data_from_html(html, neighborhood)
                if listings:
                    logger.info("[zillow][playwright] %s: %d listings (from HTML)", neighborhood, len(listings))
                else:
                    logger.warning("[zillow][playwright] %s: no data found", neighborhood)

            await browser.close()
            return listings

    except Exception as exc:
        logger.error("[zillow][playwright] Error for %s: %s", neighborhood, exc, exc_info=True)
        return []


# ── Combined scrape function ──────────────────────────────────────────────────

async def scrape_neighborhood(neighborhood: str, url: str) -> list[dict]:
    """
    Try in order:
      1. ScraperAPI  — residential IPs, bypasses Cloudflare (needs SCRAPERAPI_KEY env var)
      2. httpx       — fast, no browser, blocked by Cloudflare on datacenter IPs like Render
      3. Playwright  — full headless browser with stealth, last resort
    """
    if os.getenv("SCRAPERAPI_KEY", "").strip():
        listings = await _scraperapi_scrape(url, neighborhood)
        if listings:
            return listings
        logger.warning("[zillow] ScraperAPI empty for %s", neighborhood)

    listings = await _httpx_scrape(url, neighborhood)
    if listings:
        return listings

    logger.info("[zillow] Trying Playwright for %s…", neighborhood)
    return await _playwright_scrape(url, neighborhood)


async def run_full_scrape(settings=None) -> dict:
    """Scrape all configured neighborhoods with staggered delays.
    Pass a ScrapeSettings ORM object to use saved filters; omits defaults."""
    from ..models.homes import ScrapeSettings as _SS

    if settings is None:
        # Fallback defaults when called without a DB session (e.g. from tests)
        class _Defaults:
            max_price = 650_000
            min_beds = 3
            min_baths = 2.0
            no_hoa = True
            no_foreclosure = True
            single_family_only = True
            neighborhoods_json = '["Brooklyn","Queens","Manhattan"]'
        settings = _Defaults()

    targets = build_search_targets(settings)
    all_listings: list[dict] = []
    errors: list[str] = []

    for target in targets:
        try:
            results = await scrape_neighborhood(target["neighborhood"], target["url"])
            all_listings.extend(results)
        except Exception as exc:
            msg = f"{target['neighborhood']}: {exc}"
            logger.error("[zillow] %s", msg)
            errors.append(msg)
        # Stagger: 10–20s between neighborhoods
        await asyncio.sleep(random.uniform(10, 20))

    status = (
        "error" if (not all_listings and errors)
        else "blocked" if not all_listings
        else "ok"
    )
    return {"listings": all_listings, "errors": errors, "status": status}
