from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class PredictionResult(Base):
    __tablename__ = "prediction_results"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    source_type: Mapped[str] = mapped_column(String(32), index=True)
    status: Mapped[str] = mapped_column(String(32), default="completed")
    input_path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    output_png_path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    output_geotiff_path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    output_report_path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    bbox: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    source_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    statistics: Mapped[list[dict]] = mapped_column(JSON, default=list)
    error_message: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    total_area_m2: Mapped[float] = mapped_column(Float, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )
    satellite_image_id: Mapped[int | None] = mapped_column(ForeignKey("satellite_images.id"), nullable=True)
    satellite_image = relationship("SatelliteImage", back_populates="predictions")
