import math

from app.schemas.prediction_schema import BBox

DANANG_BBOX = BBox(west=107.8, south=15.86, east=108.36, north=16.23)
DANANG_BOUNDARY_GEOJSON = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {"name": "Da Nang"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [107.8, 15.86],
                    [108.36, 15.86],
                    [108.36, 16.23],
                    [107.8, 16.23],
                    [107.8, 15.86],
                ]],
            },
        }
    ],
}


def validate_bbox_order(bbox: BBox) -> BBox:
    if bbox.west >= bbox.east or bbox.south >= bbox.north:
        raise ValueError("bbox must have west < east and south < north")
    return bbox


def bbox_size_meters(bbox: BBox) -> tuple[float, float]:
    mid_lat = (bbox.south + bbox.north) / 2
    width_m = _haversine_meters(mid_lat, bbox.west, mid_lat, bbox.east)
    height_m = _haversine_meters(bbox.south, bbox.west, bbox.north, bbox.west)
    return width_m, height_m


def bbox_pixel_grid(
    bbox: BBox,
    pixel_size_m: float = 10.0,
    max_dimension: int = 4096,
) -> dict:
    width_m, height_m = bbox_size_meters(bbox)
    native_width_px = max(1, math.ceil(width_m / pixel_size_m))
    native_height_px = max(1, math.ceil(height_m / pixel_size_m))

    scale_factor = max(native_width_px / max_dimension, native_height_px / max_dimension, 1)
    width_px = max(1, math.ceil(native_width_px / scale_factor))
    height_px = max(1, math.ceil(native_height_px / scale_factor))
    pixel_width_m = width_m / width_px
    pixel_height_m = height_m / height_px

    return {
        "width_m": width_m,
        "height_m": height_m,
        "native_width_px": native_width_px,
        "native_height_px": native_height_px,
        "width_px": width_px,
        "height_px": height_px,
        "dimensions": f"{width_px}x{height_px}",
        "requested_pixel_size_m": pixel_size_m,
        "pixel_width_m": pixel_width_m,
        "pixel_height_m": pixel_height_m,
        "pixel_area_m2": pixel_width_m * pixel_height_m,
        "max_dimension": max_dimension,
        "downsampled": scale_factor > 1,
    }


def _haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_m = 6_371_008.8
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    return radius_m * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
