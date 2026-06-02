from pathlib import Path
from uuid import uuid4
from io import BytesIO
from zipfile import ZipFile, is_zipfile

import requests

from app.core.config import get_settings
from app.schemas.prediction_schema import BBox, RegionPredictionRequest
from app.services.earth_engine_service import EarthEngineUnavailable, initialize_earth_engine
from app.services.geo_service import bbox_pixel_grid

SENTINEL_2_SR_HARMONIZED = "COPERNICUS/S2_SR_HARMONIZED"
MODEL_BANDS = ["B2", "B3", "B4", "B8", "B11", "NDVI", "NDWI", "NDBI"]


def fetch_sentinel2_rgb(payload: RegionPredictionRequest) -> tuple[Path, dict]:
    initialize_earth_engine()

    try:
        import ee
    except ImportError as exc:
        raise EarthEngineUnavailable("earthengine-api is not installed. Run: pip install -r backend/requirements.txt") from exc

    bbox = payload.bbox
    region = ee.Geometry.Rectangle([bbox.west, bbox.south, bbox.east, bbox.north])
    collection = (
        ee.ImageCollection(SENTINEL_2_SR_HARMONIZED)
        .filterBounds(region)
        .filterDate(payload.start_date, payload.end_date)
        .filter(ee.Filter.lte("CLOUDY_PIXEL_PERCENTAGE", payload.cloud_percent))
        .select(["B2", "B3", "B4", "B8", "B11"])
    )
    image_count = int(collection.size().getInfo())
    if image_count == 0:
        raise EarthEngineUnavailable("No Sentinel-2 images found for the selected region/date/cloud filters.")

    composite = collection.median().clip(region)
    ndvi = composite.normalizedDifference(["B8", "B4"]).rename("NDVI")
    ndwi = composite.normalizedDifference(["B3", "B8"]).rename("NDWI")
    ndbi = composite.normalizedDifference(["B11", "B8"]).rename("NDBI")
    model_image = composite.addBands([ndvi, ndwi, ndbi]).select(MODEL_BANDS)
    pixel_grid = bbox_pixel_grid(
        bbox,
        pixel_size_m=payload.pixel_size_m,
        max_dimension=payload.image_size,
    )
    download_url = model_image.getDownloadURL({
        "region": _bbox_coordinates(bbox),
        "dimensions": pixel_grid["dimensions"],
        "format": "GEO_TIFF",
        "filePerBand": False,
    })

    response = requests.get(download_url, timeout=120)
    if not response.ok:
        raise EarthEngineUnavailable(f"Sentinel-2 download failed with status {response.status_code}")

    settings = get_settings()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    target = settings.upload_dir / f"sentinel2-{uuid4().hex}.tif"
    _write_geotiff_response(response.content, target)

    metadata = {
        "dataset": SENTINEL_2_SR_HARMONIZED,
        "source": payload.source,
        "bands": MODEL_BANDS,
        "rgb_bands": ["B4", "B3", "B2"],
        "start_date": payload.start_date,
        "end_date": payload.end_date,
        "cloud_percent": payload.cloud_percent,
        "image_count": image_count,
        "image_size": payload.image_size,
        "pixel_size_m": payload.pixel_size_m,
        "pixel_grid": pixel_grid,
        "pixel_area_m2": pixel_grid["pixel_area_m2"],
        "bbox": bbox.model_dump(),
    }
    return target, metadata


def _write_geotiff_response(content: bytes, target: Path) -> None:
    if is_zipfile(BytesIO(content)):
        with ZipFile(BytesIO(content)) as archive:
            tif_names = [
                name for name in archive.namelist()
                if name.lower().endswith((".tif", ".tiff"))
            ]
            if not tif_names:
                raise EarthEngineUnavailable("Sentinel-2 download ZIP did not contain a GeoTIFF.")
            target.write_bytes(archive.read(tif_names[0]))
            return

    target.write_bytes(content)


def _bbox_coordinates(bbox: BBox) -> list[list[float]]:
    return [
        [bbox.west, bbox.south],
        [bbox.east, bbox.south],
        [bbox.east, bbox.north],
        [bbox.west, bbox.north],
        [bbox.west, bbox.south],
    ]
