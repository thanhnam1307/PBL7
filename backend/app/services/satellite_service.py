from app.services.geo_service import DANANG_BOUNDARY_GEOJSON
from app.services.earth_engine_service import (
    EarthEngineUnavailable,
    create_dynamic_world_layer,
    fetch_tile,
    get_status,
)


class SatelliteLayerUnavailable(RuntimeError):
    pass


async def create_land_cover_layer(year: int, mode: str, classes: str, api_base_url: str) -> dict:
    try:
        return create_dynamic_world_layer(year=year, mode=mode, classes=classes, api_base_url=api_base_url)
    except EarthEngineUnavailable as exc:
        raise SatelliteLayerUnavailable(str(exc)) from exc


async def proxy_tile(layer_id: str, z: int, x: int, y: int) -> tuple[bytes, str]:
    try:
        return fetch_tile(layer_id=layer_id, z=z, x=x, y=y)
    except EarthEngineUnavailable as exc:
        raise SatelliteLayerUnavailable(str(exc)) from exc


def layer_metadata() -> dict:
    return {
        "region": "Da Nang",
        "boundary": DANANG_BOUNDARY_GEOJSON,
        "earthEngine": get_status(),
    }
