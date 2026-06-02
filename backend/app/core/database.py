from sqlalchemy import create_engine
from sqlalchemy import inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import get_settings

settings = get_settings()

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine_args = {"connect_args": connect_args}
if settings.database_url == "sqlite:///:memory:":
    engine_args["poolclass"] = StaticPool

engine = create_engine(settings.database_url, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def init_db() -> None:
    from app.models import land_class, prediction_result, satellite_image, user  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _migrate_sqlite_prediction_results()


def _migrate_sqlite_prediction_results() -> None:
    if not settings.database_url.startswith("sqlite"):
        return

    inspector = inspect(engine)
    if "prediction_results" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("prediction_results")}
    migrations = {
        "output_geotiff_path": "ALTER TABLE prediction_results ADD COLUMN output_geotiff_path VARCHAR(512)",
        "source_metadata": "ALTER TABLE prediction_results ADD COLUMN source_metadata JSON",
    }

    with engine.begin() as connection:
        for column_name, statement in migrations.items():
            if column_name not in columns:
                connection.execute(text(statement))
