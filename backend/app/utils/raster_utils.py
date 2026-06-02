from pathlib import Path


def is_raster_path(path: Path) -> bool:
    return path.suffix.lower() in {".tif", ".tiff", ".png", ".jpg", ".jpeg"}
