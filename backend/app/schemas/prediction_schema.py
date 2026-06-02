from datetime import datetime

from pydantic import BaseModel, Field


class BBox(BaseModel):
    west: float = Field(..., ge=-180, le=180)
    south: float = Field(..., ge=-90, le=90)
    east: float = Field(..., ge=-180, le=180)
    north: float = Field(..., ge=-90, le=90)


class RegionPredictionRequest(BaseModel):
    bbox: BBox
    year: int = Field(default=2024, ge=2015, le=2100)
    source: str = "sentinel-2"
    start_date: str = Field(default="2024-01-01")
    end_date: str = Field(default="2024-12-31")
    cloud_percent: int = Field(default=30, ge=0, le=100)
    pixel_size_m: float = Field(default=10.0, ge=1.0, le=300.0)
    image_size: int = Field(default=4096, ge=128, le=10000)


class ClassStatistic(BaseModel):
    id: str
    label: str
    color: str
    pixels: int
    area_m2: float
    percent: float


class PredictionSummary(BaseModel):
    id: int
    source_type: str
    status: str
    created_at: datetime
    input_image_url: str | None = None
    output_png_url: str | None = None
    output_geotiff_url: str | None = None
    total_area_m2: float

    model_config = {"from_attributes": True}


class PredictionDetail(PredictionSummary):
    bbox: dict | None = None
    statistics: list[ClassStatistic] = []
    output_report_url: str | None = None
    error_message: str | None = None
    source_metadata: dict | None = None
