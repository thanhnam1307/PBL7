from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile

from app.core.config import get_settings

ALLOWED_EXTENSIONS = {".tif", ".tiff", ".png", ".jpg", ".jpeg"}


async def save_upload(file: UploadFile) -> Path:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported raster/image format")

    settings = get_settings()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    target = settings.upload_dir / f"{uuid4().hex}{suffix}"

    with target.open("wb") as buffer:
        while chunk := await file.read(1024 * 1024):
            buffer.write(chunk)

    return target


def create_region_placeholder() -> Path:
    settings = get_settings()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    target = settings.upload_dir / f"region-{uuid4().hex}.png"

    try:
        from PIL import Image, ImageDraw
    except ImportError as exc:
        raise RuntimeError("Pillow is required to create a region preview image") from exc

    image = Image.new("RGB", (512, 512), "#1b2836")
    draw = ImageDraw.Draw(image)
    draw.rectangle((40, 40, 472, 472), outline="#2be8a4", width=4)
    draw.text((56, 56), "Da Nang selected region", fill="#e8eef2")
    image.save(target)
    return target
