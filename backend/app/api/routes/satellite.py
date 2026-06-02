from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response

from app.services.satellite_service import SatelliteLayerUnavailable, create_land_cover_layer, layer_metadata, proxy_tile

router = APIRouter(prefix="/api/satellite", tags=["satellite"])


@router.get("/land-cover/layer")
async def land_cover_layer(request: Request, year: int = 2024, mode: str = "top1", classes: str = "") -> dict:
    try:
        return await create_land_cover_layer(
            year=year,
            mode=mode,
            classes=classes,
            api_base_url=_api_base_url(request),
        )
    except SatelliteLayerUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/status")
async def status() -> dict:
    return layer_metadata()


@router.get("/land-cover/tiles/{layer_id}/{z}/{x}/{y}.png")
async def land_cover_tile(layer_id: str, z: int, x: int, y: int) -> Response:
    try:
        content, media_type = await proxy_tile(layer_id=layer_id, z=z, x=x, y=y)
    except SatelliteLayerUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return Response(content=content, media_type=media_type)


def _api_base_url(request: Request) -> str:
    forwarded_proto = request.headers.get("x-forwarded-proto")
    forwarded_host = request.headers.get("x-forwarded-host")
    if forwarded_proto and forwarded_host:
        return f"{forwarded_proto.split(',')[0]}://{forwarded_host.split(',')[0]}"
    return str(request.base_url).rstrip("/")
