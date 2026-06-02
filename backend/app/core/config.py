from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Da Nang Satellite Land Classification"
    api_port: int = 8000
    database_url: str = "sqlite:///./app.db"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    upload_dir: Path = Path("uploads")
    output_dir: Path = Path("outputs")
    model_path: Path = Path("models/land_classification_model.pth")
    gee_project_id: str | None = None
    gee_auth_mode: str = "adc"
    gee_service_account_email: str | None = None
    google_application_credentials: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
