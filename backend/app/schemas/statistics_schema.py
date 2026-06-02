from pydantic import BaseModel

from app.schemas.prediction_schema import ClassStatistic


class StatisticsResponse(BaseModel):
    prediction_id: int
    total_area_m2: float
    classes: list[ClassStatistic]
