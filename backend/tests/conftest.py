import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["GEE_PROJECT_ID"] = ""

from app.core.config import get_settings
from app.core.database import Base, engine
from app.main import create_app


@pytest.fixture(autouse=True)
def reset_settings(tmp_path, monkeypatch):
    get_settings.cache_clear()
    monkeypatch.setenv("UPLOAD_DIR", str(tmp_path / "uploads"))
    monkeypatch.setenv("OUTPUT_DIR", str(tmp_path / "outputs"))
    monkeypatch.setenv("MODEL_PATH", str(tmp_path / "model.pth"))
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    get_settings.cache_clear()


@pytest.fixture
def client():
    return TestClient(create_app())
