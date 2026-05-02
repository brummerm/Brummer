from __future__ import annotations
import uuid
import os
from pathlib import Path
from fastapi import UploadFile, HTTPException
from ..config import settings

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def _images_dir() -> Path:
    return Path(settings.IMAGES_DIR)


async def save_upload(file: UploadFile) -> str:
    """Save an uploaded file and return its relative filename (e.g. 'custom/uuid.jpg')."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type: {file.content_type}. Allowed: JPEG, PNG, WebP, GIF",
        )

    suffix = Path(file.filename or "image.jpg").suffix.lower()
    if suffix not in ALLOWED_EXTS:
        suffix = ".jpg"

    filename = f"{uuid.uuid4()}{suffix}"
    dest = _images_dir() / "custom" / filename

    content = await file.read()
    if len(content) > settings.MAX_IMAGE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"Image exceeds {settings.MAX_IMAGE_SIZE_MB}MB limit",
        )

    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(content)
    return f"custom/{filename}"


def delete_image(filename: str):
    """Delete a custom image from disk. Only removes files in the custom/ subdirectory."""
    if not filename or not filename.startswith("custom/"):
        return  # Never delete seeded images
    path = _images_dir() / filename
    if path.exists():
        path.unlink()


async def download_and_save(url: str, filename: str) -> bool:
    """Download an image from a URL and save to images/seeded/. Returns True on success."""
    import httpx

    dest = _images_dir() / "seeded" / filename
    dest.parent.mkdir(parents=True, exist_ok=True)

    if dest.exists():
        return True  # Already downloaded

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            dest.write_bytes(resp.content)
        return True
    except Exception:
        return False
