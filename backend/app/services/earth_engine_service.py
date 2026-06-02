import time
from dataclasses import dataclass
from uuid import uuid4

import requests

from app.core.config import get_settings
from app.services.geo_service import DANANG_BOUNDARY_GEOJSON


class EarthEngineUnavailable(RuntimeError):
    pass


LAND_CLASSES = [
    {"id": "water", "label": "Water", "band": "water", "color": "#419bdf", "labelIndex": 0},
    {"id": "trees", "label": "Trees", "band": "trees", "color": "#397d49", "labelIndex": 1},
    {"id": "grass", "label": "Grass", "band": "grass", "color": "#88b053", "labelIndex": 2},
    {
        "id": "flooded_vegetation",
        "label": "Flooded veg",
        "band": "flooded_vegetation",
        "color": "#7a87c6",
        "labelIndex": 3,
    },
    {"id": "crops", "label": "Crops", "band": "crops", "color": "#e49635", "labelIndex": 4},
    {"id": "shrub_and_scrub", "label": "Shrub", "band": "shrub_and_scrub", "color": "#dfc35a", "labelIndex": 5},
    {"id": "built", "label": "Built area", "band": "built", "color": "#c4281b", "labelIndex": 6},
    {"id": "bare", "label": "Bare ground", "band": "bare", "color": "#a59b8f", "labelIndex": 7},
    {"id": "snow_and_ice", "label": "Snow / Ice", "band": "snow_and_ice", "color": "#b39fe1", "labelIndex": 8},
]
CLASS_BY_ID = {item["id"]: item for item in LAND_CLASSES}
LABEL_PALETTE = [item["color"].removeprefix("#") for item in LAND_CLASSES]
DATASET_ID = "GOOGLE/DYNAMICWORLD/V1"
LAYER_TTL_SECONDS = 15 * 60
_initialized = False
_layers: dict[str, "EarthEngineLayer"] = {}


@dataclass
class EarthEngineLayer:
    tile_url_format: str
    created_at: float
    request: dict


def get_status() -> dict:
    settings = get_settings()
    configured = bool(settings.gee_project_id)
    try:
        if configured:
            initialize_earth_engine()
        return {
            "configured": configured,
            "ready": configured,
            "project": settings.gee_project_id,
            "authMode": settings.gee_auth_mode,
            "message": "Google Earth Engine is initialized." if configured else "Set GEE_PROJECT_ID to enable Earth Engine.",
        }
    except EarthEngineUnavailable as exc:
        return {
            "configured": configured,
            "ready": False,
            "project": settings.gee_project_id,
            "authMode": settings.gee_auth_mode,
            "message": str(exc),
        }


def create_dynamic_world_layer(year: int, mode: str, classes: str, api_base_url: str) -> dict:
    initialize_earth_engine()
    request = _validate_request(year, mode, classes)
    image, vis_params, primary_class = _build_image(request)
    map_info = image.getMapId(vis_params)
    tile_url_format = _extract_tile_url_format(map_info)
    layer_id = uuid4().hex

    _layers[layer_id] = EarthEngineLayer(
        tile_url_format=tile_url_format,
        created_at=time.time(),
        request=request,
    )
    _prune_layers()

    return {
        "layerId": layer_id,
        "tileTemplate": f"{api_base_url}/api/satellite/land-cover/tiles/{layer_id}/{{z}}/{{x}}/{{y}}.png",
        "attribution": "Google Earth Engine · WRI · Dynamic World",
        "minzoom": 0,
        "maxzoom": 18,
        "legend": [_public_class(item) for item in LAND_CLASSES],
        "mode": request["mode"],
        "year": request["year"],
        "primaryClass": primary_class,
        "boundary": DANANG_BOUNDARY_GEOJSON,
        "expiresInSeconds": LAYER_TTL_SECONDS,
    }


def fetch_tile(layer_id: str, z: int, x: int, y: int) -> tuple[bytes, str]:
    _prune_layers()
    layer = _layers.get(layer_id)
    if not layer:
        raise EarthEngineUnavailable("Satellite layer expired or does not exist. Reload the Dynamic World layer.")

    tile_url = layer.tile_url_format.format(z=z, x=x, y=y)
    response = requests.get(tile_url, timeout=20)
    if not response.ok:
        raise EarthEngineUnavailable(f"Earth Engine tile request failed with status {response.status_code}")

    return response.content, response.headers.get("content-type", "image/png")


def initialize_earth_engine() -> None:
    global _initialized
    if _initialized:
        return

    settings = get_settings()
    if not settings.gee_project_id:
        raise EarthEngineUnavailable("Missing GEE_PROJECT_ID. Set it in backend/.env or root .env.")

    try:
        import ee
    except ImportError as exc:
        raise EarthEngineUnavailable("earthengine-api is not installed. Run: pip install -r backend/requirements.txt") from exc

    try:
        if settings.gee_auth_mode == "service-account-key":
            if not settings.gee_service_account_email or not settings.google_application_credentials:
                raise EarthEngineUnavailable(
                    "Service account mode requires GEE_SERVICE_ACCOUNT_EMAIL and GOOGLE_APPLICATION_CREDENTIALS."
                )
            credentials = ee.ServiceAccountCredentials(
                settings.gee_service_account_email,
                settings.google_application_credentials,
            )
            ee.Initialize(credentials=credentials, project=settings.gee_project_id)
        else:
            ee.Initialize(project=settings.gee_project_id)
    except Exception as exc:
        raise EarthEngineUnavailable(
            "Unable to initialize Google Earth Engine. Run `earthengine authenticate` or "
            "`gcloud auth application-default login --scopes=https://www.googleapis.com/auth/earthengine,"
            "https://www.googleapis.com/auth/cloud-platform`, enable the Earth Engine API, and verify project access."
        ) from exc

    _initialized = True


def _build_image(request: dict):
    import ee

    collection = ee.ImageCollection(DATASET_ID).filterDate(
        f"{request['year']}-01-01",
        f"{request['year'] + 1}-01-01",
    )

    if request["mode"] == "probability":
        primary_class = CLASS_BY_ID[request["classes"][0]]
        probability = collection.select(primary_class["band"]).mean().rename(primary_class["band"])
        return (
            probability.updateMask(probability.gt(0.05)),
            {
                "min": 0,
                "max": 1,
                "palette": ["101820", primary_class["color"].removeprefix("#")],
                "format": "png",
            },
            primary_class["id"],
        )

    label = collection.select("label").reduce(ee.Reducer.mode()).rename("label")
    selected_indexes = [CLASS_BY_ID[class_id]["labelIndex"] for class_id in request["classes"]]
    selected_mask = selected_indexes[0]
    mask = label.eq(selected_mask)
    for label_index in selected_indexes[1:]:
        mask = mask.Or(label.eq(label_index))

    return (
        label.updateMask(mask),
        {"min": 0, "max": 8, "palette": LABEL_PALETTE, "format": "png"},
        None,
    )


def _extract_tile_url_format(map_info: dict) -> str:
    tile_fetcher = map_info.get("tile_fetcher")
    if tile_fetcher and getattr(tile_fetcher, "url_format", None):
        return tile_fetcher.url_format

    if map_info.get("tile_url"):
        return map_info["tile_url"]

    raise EarthEngineUnavailable("Earth Engine did not return a tile URL format.")


def _validate_request(year: int, mode: str, classes: str) -> dict:
    if year < 2015 or year > 2100:
        raise EarthEngineUnavailable("year must be between 2015 and 2100")
    if mode not in {"top1", "probability"}:
        raise EarthEngineUnavailable("mode must be one of: top1, probability")

    class_ids = [item.strip() for item in classes.split(",") if item.strip()]
    if not class_ids:
        class_ids = [item["id"] for item in LAND_CLASSES]

    unknown = next((item for item in class_ids if item not in CLASS_BY_ID), None)
    if unknown:
        raise EarthEngineUnavailable(f"unknown land class: {unknown}")

    return {"year": year, "mode": mode, "classes": list(dict.fromkeys(class_ids))}


def _public_class(item: dict) -> dict:
    return {key: item[key] for key in ("id", "label", "color")}


def _prune_layers() -> None:
    now = time.time()
    expired = [layer_id for layer_id, layer in _layers.items() if now - layer.created_at > LAYER_TTL_SECONDS]
    for layer_id in expired:
        del _layers[layer_id]
