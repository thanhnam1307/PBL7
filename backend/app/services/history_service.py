from pathlib import Path

from fastapi import HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.prediction_result import PredictionResult
from app.schemas.prediction_schema import PredictionDetail, PredictionSummary
from app.utils.response_utils import prediction_to_detail, prediction_to_summary


def list_predictions(db: Session) -> list[PredictionSummary]:
    rows = db.query(PredictionResult).order_by(desc(PredictionResult.created_at)).all()
    return [prediction_to_summary(row) for row in rows]


def get_prediction_or_404(db: Session, prediction_id: int) -> PredictionDetail:
    return prediction_to_detail(get_prediction_model_or_404(db, prediction_id))


def get_prediction_model_or_404(db: Session, prediction_id: int) -> PredictionResult:
    prediction = db.get(PredictionResult, prediction_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return prediction


def resolve_download_path(prediction: PredictionDetail, output_type: str = "report") -> Path:
    paths = {
        "png": prediction.output_png_url,
        "geotiff": prediction.output_geotiff_url,
        "report": prediction.output_report_url,
    }
    if output_type not in paths:
        raise HTTPException(status_code=400, detail="type must be one of: png, geotiff, report")

    selected_path = paths[output_type]
    if selected_path:
        return Path(selected_path.removeprefix("/"))

    raise HTTPException(status_code=404, detail=f"Prediction has no {output_type} output file")


def resolve_model_download_path(prediction: PredictionResult, output_type: str = "report") -> Path:
    paths = {
        "png": prediction.output_png_path,
        "geotiff": prediction.output_geotiff_path,
        "report": prediction.output_report_path,
    }
    if output_type not in paths:
        raise HTTPException(status_code=400, detail="type must be one of: png, geotiff, report")
    selected_path = paths[output_type]
    if not selected_path:
        raise HTTPException(status_code=404, detail=f"Prediction has no {output_type} output file")
    return Path(selected_path)
