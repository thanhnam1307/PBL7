from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.schemas.prediction_schema import PredictionDetail, RegionPredictionRequest
from app.services.prediction_service import PredictionRuntimeError, run_region_prediction, run_upload_prediction

router = APIRouter(prefix="/api/prediction", tags=["prediction"])


@router.post("/upload", response_model=PredictionDetail)
async def upload(file: UploadFile = File(...), db: Session = Depends(get_db)) -> PredictionDetail:
    try:
        return await run_upload_prediction(db, file)
    except PredictionRuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/region", response_model=PredictionDetail)
async def region(payload: RegionPredictionRequest, db: Session = Depends(get_db)) -> PredictionDetail:
    try:
        return await run_region_prediction(db, payload)
    except PredictionRuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
