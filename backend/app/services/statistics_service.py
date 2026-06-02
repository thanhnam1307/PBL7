from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.prediction_result import PredictionResult
from app.schemas.statistics_schema import StatisticsResponse


def get_statistics(db: Session, prediction_id: int) -> StatisticsResponse:
    prediction = db.get(PredictionResult, prediction_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")

    return StatisticsResponse(
        prediction_id=prediction.id,
        total_area_m2=prediction.total_area_m2,
        classes=prediction.statistics or [],
    )
