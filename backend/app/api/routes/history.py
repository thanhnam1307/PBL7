from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.schemas.prediction_schema import PredictionDetail, PredictionSummary
from app.services.history_service import (
    get_prediction_or_404,
    get_prediction_model_or_404,
    list_predictions,
    resolve_model_download_path,
)

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("", response_model=list[PredictionSummary])
def index(db: Session = Depends(get_db)) -> list[PredictionSummary]:
    return list_predictions(db)


@router.get("/{prediction_id}", response_model=PredictionDetail)
def show(prediction_id: int, db: Session = Depends(get_db)) -> PredictionDetail:
    return get_prediction_or_404(db, prediction_id)


@router.get("/{prediction_id}/download")
def download(prediction_id: int, type: str = "report", db: Session = Depends(get_db)) -> FileResponse:
    prediction = get_prediction_model_or_404(db, prediction_id)
    path = resolve_model_download_path(prediction, type)

    if not path.exists():
        raise HTTPException(status_code=404, detail="Prediction output is missing")

    return FileResponse(path, filename=path.name)
