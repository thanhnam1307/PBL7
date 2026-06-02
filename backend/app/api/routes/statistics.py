from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.schemas.statistics_schema import StatisticsResponse
from app.services.statistics_service import get_statistics

router = APIRouter(prefix="/api/statistics", tags=["statistics"])


@router.get("/{prediction_id}", response_model=StatisticsResponse)
def show(prediction_id: int, db: Session = Depends(get_db)) -> StatisticsResponse:
    return get_statistics(db, prediction_id)
