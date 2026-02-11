import re
from decimal import Decimal
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/meta", tags=["meta"])


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
    s = nums[0].replace(" ", "").replace(",", ".")
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
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            resp = await client.get(data.url)
            resp.raise_for_status()
    except Exception:
        raise HTTPException(status_code=422, detail="Could not fetch URL")
    soup = BeautifulSoup(resp.text, "html.parser")
    title = None
    image_url = None
    price = None
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
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        img = og_image["content"]
        if img.startswith("//"):
            img = "https:" + img
        elif img.startswith("/"):
            img = f"{parsed.scheme}://{parsed.netloc}{img}"
        image_url = img
    og_price = soup.find("meta", property="product:price:amount")
    if og_price and og_price.get("content"):
        price = _parse_price(og_price["content"])
    if price is None:
        price_elem = soup.find("meta", property="og:price:amount")
        if price_elem and price_elem.get("content"):
            price = _parse_price(price_elem["content"])
    if price is None:
        for elem in soup.find_all(string=re.compile(r"\d+\s*(?:р\.|руб|₽|EUR|USD|\$)")):
            p = _parse_price(elem)
            if p and p > 0:
                price = p
                break
    return MetaFetchResponse(
        title=title or "Unknown",
        image_url=image_url,
        price=price,
    )
