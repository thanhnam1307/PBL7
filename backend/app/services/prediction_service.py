import json
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.ai.predict import predict_file
from app.core.config import get_settings
from app.models.prediction_result import PredictionResult
from app.models.satellite_image import SatelliteImage
from app.schemas.prediction_schema import PredictionDetail, RegionPredictionRequest
from app.services.geo_service import validate_bbox_order
from app.services.image_service import save_upload
from app.services.sentinel_service import fetch_sentinel2_rgb
from app.utils.response_utils import prediction_to_detail


class PredictionRuntimeError(RuntimeError):
    pass


async def run_upload_prediction(db: Session, file: UploadFile) -> PredictionDetail:
    image_path = await save_upload(file)
    satellite_image = SatelliteImage(
        filename=file.filename or image_path.name,
        path=str(image_path),
        content_type=file.content_type,
    )
    db.add(satellite_image)
    db.flush()

    prediction = _run_prediction(db, source_type="upload", image_path=image_path, satellite_image=satellite_image)
    return prediction_to_detail(prediction)


async def run_region_prediction(db: Session, payload: RegionPredictionRequest) -> PredictionDetail:
    try:
        bbox = validate_bbox_order(payload.bbox)
    except ValueError as exc:
        raise PredictionRuntimeError(str(exc)) from exc

    if payload.source != "sentinel-2":
        raise PredictionRuntimeError("Only sentinel-2 region prediction is supported for the demo pipeline")

    try:
        image_path, source_metadata = fetch_sentinel2_rgb(payload)
    except Exception as exc:
        raise PredictionRuntimeError(str(exc)) from exc

    prediction = _run_prediction(
        db,
        source_type="region",
        image_path=image_path,
        bbox=bbox.model_dump(),
        source_metadata=source_metadata,
    )
    return prediction_to_detail(prediction)


def _run_prediction(
    db: Session,
    source_type: str,
    image_path: Path,
    satellite_image: SatelliteImage | None = None,
    bbox: dict | None = None,
    source_metadata: dict | None = None,
) -> PredictionResult:
    settings = get_settings()
    settings.output_dir.mkdir(parents=True, exist_ok=True)

    try:
        pixel_area_m2 = (source_metadata or {}).get(
            "pixel_area_m2",
            (source_metadata or {}).get("pixel_size_m", 10) ** 2,
        )
        mask_path, geotiff_path, report_path, statistics, total_area_m2, tiling_metadata = predict_file(
            image_path,
            settings.output_dir,
            bbox=bbox,
            pixel_area_m2=pixel_area_m2,
        )
    except Exception as exc:
        raise PredictionRuntimeError(f"AI prediction unavailable: {exc}") from exc

    enriched_source_metadata = {
        **(source_metadata or {}),
        "tiling": tiling_metadata,
    }
    prediction = PredictionResult(
        source_type=source_type,
        status="completed",
        input_path=str(image_path),
        output_png_path=str(mask_path),
        output_geotiff_path=str(geotiff_path),
        output_report_path=str(report_path),
        bbox=bbox,
        source_metadata=enriched_source_metadata,
        statistics=statistics,
        total_area_m2=total_area_m2,
        satellite_image=satellite_image,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    report_payload = {
        "prediction_id": prediction.id,
        "source_type": source_type,
        "bbox": bbox,
        "source_metadata": enriched_source_metadata,
        "statistics": statistics,
        "total_area_m2": total_area_m2,
        "input_path": str(image_path),
        "output_png_path": str(mask_path),
        "output_geotiff_path": str(geotiff_path),
    }
    report_path.write_text(json.dumps(report_payload, indent=2), encoding="utf-8")
    return prediction
