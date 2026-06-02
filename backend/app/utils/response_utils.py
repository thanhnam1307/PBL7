from app.models.prediction_result import PredictionResult
from app.schemas.prediction_schema import PredictionDetail, PredictionSummary


def path_to_url(path: str | None) -> str | None:
    if not path:
        return None
    normalized = path.replace("\\", "/")
    for static_dir in ("uploads", "outputs"):
        marker = f"/{static_dir}/"
        if marker in normalized:
            return f"/{static_dir}/{normalized.split(marker, 1)[1]}"
        if normalized.startswith(f"{static_dir}/"):
            return f"/{normalized}"
    return f"/{normalized.lstrip('/')}"


def prediction_to_summary(prediction: PredictionResult) -> PredictionSummary:
    return PredictionSummary(
        id=prediction.id,
        source_type=prediction.source_type,
        status=prediction.status,
        created_at=prediction.created_at,
        input_image_url=path_to_url(prediction.input_path),
        output_png_url=path_to_url(prediction.output_png_path),
        output_geotiff_url=path_to_url(prediction.output_geotiff_path),
        total_area_m2=prediction.total_area_m2,
    )


def prediction_to_detail(prediction: PredictionResult) -> PredictionDetail:
    return PredictionDetail(
        **prediction_to_summary(prediction).model_dump(),
        bbox=prediction.bbox,
        statistics=prediction.statistics or [],
        output_report_url=path_to_url(prediction.output_report_path),
        error_message=prediction.error_message,
        source_metadata=prediction.source_metadata,
    )
