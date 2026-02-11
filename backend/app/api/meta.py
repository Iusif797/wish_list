import logging
import re
from decimal import Decimal
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

log = logging.getLogger(__name__)

router = APIRouter(prefix="/meta", tags=["meta"])

_BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,cs;q=0.8,ru;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
}


class MetaFetchRequest(BaseModel):
    url: str


class MetaFetchResponse(BaseModel):
    title: str
    image_url: str | None
    price: Decimal | None


def _parse_price(text: str) -> Decimal | None:
    if not text:
        return None
    nums = re.findall(r"[\d\s.,]+", text)
    if not nums:
        return None
    s = nums[0].replace("\xa0", "").replace(" ", "").replace(",", ".")
    parts = re.findall(r"[\d.]+", s)
    if not parts:
        return None
    try:
        return Decimal(parts[0])
    except Exception:
        return None


@router.post("/fetch", response_model=MetaFetchResponse)
async def fetch_meta(data: MetaFetchRequest):
    parsed = urlparse(data.url)
    if not parsed.scheme or not parsed.netloc:
        raise HTTPException(status_code=400, detail="Invalid URL")
    try:
        async with httpx.AsyncClient(
            timeout=15.0,
            follow_redirects=True,
            headers=_BROWSER_HEADERS,
            http2=True,
        ) as client:
            resp = await client.get(data.url)
            resp.raise_for_status()
    except httpx.TimeoutException:
        raise HTTPException(status_code=422, detail="Request timed out — site too slow")
    except httpx.HTTPStatusError as exc:
        log.warning("HTTP %s for %s", exc.response.status_code, data.url)
        raise HTTPException(
            status_code=422,
            detail=f"Site returned HTTP {exc.response.status_code}",
        )
    except Exception as exc:
        log.warning("Fetch failed for %s: %s", data.url, exc)
        raise HTTPException(status_code=422, detail="Could not fetch URL")

    soup = BeautifulSoup(resp.text, "html.parser")
    title = None
    image_url = None
    price = None

    # --- title ---
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content"):
        title = og_title["content"].strip()
    if not title:
        t = soup.find("title")
        if t:
            title = t.get_text(strip=True)
    if not title:
        desc = soup.find("meta", attrs={"name": "description"})
        if desc and desc.get("content"):
            title = desc["content"][:200]

    # --- image ---
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        img = og_image["content"]
        if img.startswith("//"):
            img = "https:" + img
        elif img.startswith("/"):
            img = f"{parsed.scheme}://{parsed.netloc}{img}"
        image_url = img

    # --- price ---
    # 1) product:price:amount meta
    og_price = soup.find("meta", property="product:price:amount")
    if og_price and og_price.get("content"):
        price = _parse_price(og_price["content"])
    # 2) og:price:amount meta
    if price is None:
        price_elem = soup.find("meta", property="og:price:amount")
        if price_elem and price_elem.get("content"):
            price = _parse_price(price_elem["content"])
    # 3) schema.org JSON-LD
    if price is None:
        import json as _json
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                ld = _json.loads(script.string or "")
                items = ld if isinstance(ld, list) else [ld]
                for item in items:
                    offers = item.get("offers") or item.get("Offers")
                    if isinstance(offers, list):
                        offers = offers[0] if offers else {}
                    if isinstance(offers, dict):
                        p = offers.get("price") or offers.get("lowPrice")
                        if p is not None:
                            price = _parse_price(str(p))
                            break
                if price is not None:
                    break
            except Exception:
                continue
    # 4) text patterns (RUB, CZK, EUR, USD, etc.)
    if price is None:
        for elem in soup.find_all(
            string=re.compile(r"[\d\s.,]+\s*(?:р\.|руб|₽|Kč|CZK|EUR|USD|\$|€|£)")
        ):
            p = _parse_price(elem)
            if p and p > 0:
                price = p
                break

    return MetaFetchResponse(
        title=title or "Unknown",
        image_url=image_url,
        price=price,
    )
