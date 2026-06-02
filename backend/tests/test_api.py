from pathlib import Path

import numpy as np

from app.ai.preprocess import normalize_image_array
from app.schemas.prediction_schema import BBox
from app.services.geo_service import bbox_pixel_grid


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["ok"] is True


def test_upload_rejects_invalid_extension(client):
    response = client.post(
        "/api/prediction/upload",
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )
    assert response.status_code == 400


def test_satellite_status_reports_unconfigured(client):
    response = client.get("/api/satellite/status")
    assert response.status_code == 200
    payload = response.json()
    assert payload["earthEngine"]["configured"] is False
    assert payload["earthEngine"]["ready"] is False


def test_satellite_layer_uses_backend_tile_template(client, monkeypatch):
    def fake_create_dynamic_world_layer(year: int, mode: str, classes: str, api_base_url: str):
        return {
            "layerId": "layer-1",
            "tileTemplate": f"{api_base_url}/api/satellite/land-cover/tiles/layer-1/{{z}}/{{x}}/{{y}}.png",
            "mode": mode,
            "year": year,
            "legend": [],
        }

    monkeypatch.setattr(
        "app.services.satellite_service.create_dynamic_world_layer",
        fake_create_dynamic_world_layer,
    )
    response = client.get("/api/satellite/land-cover/layer?year=2024&mode=top1&classes=water")
    assert response.status_code == 200
    payload = response.json()
    assert payload["tileTemplate"].endswith("/api/satellite/land-cover/tiles/layer-1/{z}/{x}/{y}.png")


def test_bbox_pixel_grid_uses_coordinates_not_fixed_thumbnail():
    grid = bbox_pixel_grid(
        BBox(west=108.0, south=16.0, east=108.01, north=16.01),
        pixel_size_m=10,
        max_dimension=4096,
    )

    assert grid["width_px"] > 100
    assert grid["height_px"] > 100
    assert grid["downsampled"] is False
    assert grid["pixel_area_m2"] > 0


def test_sentinel2_normalization_preserves_index_bands():
    image = np.zeros((8, 2, 2), dtype=np.float32)
    image[:5] = 5000
    image[5] = 0.6
    image[6] = -0.4
    image[7] = 0.2

    normalized = normalize_image_array(image)

    assert np.allclose(normalized[0], 0.5)
    assert np.allclose(normalized[5], 0.6)
    assert np.allclose(normalized[6], 0.0)
    assert np.allclose(normalized[7], 0.2)


def test_upload_prediction_with_mock_model(client, monkeypatch, tmp_path):
    def fake_predict_file(image_path: Path, output_dir: Path, **_kwargs):
        output_dir.mkdir(parents=True, exist_ok=True)
        png = output_dir / "mock.png"
        geotiff = output_dir / "mock.tif"
        report = output_dir / "mock.json"
        png.write_bytes(b"png")
        geotiff.write_bytes(b"tif")
        report.write_text("{}", encoding="utf-8")
        return png, geotiff, report, [
            {"id": "water", "label": "Water", "color": "#2b83ba", "pixels": 4, "area_m2": 400, "percent": 100}
        ], 400.0, {"tile_size_m": 300, "tile_size_px": 30, "tile_count": 1}

    monkeypatch.setattr("app.services.prediction_service.predict_file", fake_predict_file)
    response = client.post(
        "/api/prediction/upload",
        files={"file": ("tile.png", b"png-bytes", "image/png")},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "completed"
    assert payload["output_geotiff_url"].endswith("/mock.tif")
    assert payload["statistics"][0]["id"] == "water"


def test_history_and_statistics(client, monkeypatch):
    def fake_predict_file(image_path: Path, output_dir: Path, **_kwargs):
        output_dir.mkdir(parents=True, exist_ok=True)
        png = output_dir / "region.png"
        geotiff = output_dir / "region.tif"
        report = output_dir / "region.json"
        png.write_bytes(b"png")
        geotiff.write_bytes(b"tif")
        report.write_text("{}", encoding="utf-8")
        return png, geotiff, report, [
            {"id": "building", "label": "Building", "color": "#d73027", "pixels": 2, "area_m2": 200, "percent": 50}
        ], 400.0, {"tile_size_m": 300, "tile_size_px": 30, "tile_count": 4}

    def fake_fetch(_payload):
        input_path = Path("backend/uploads/test-region.png")
        input_path.parent.mkdir(parents=True, exist_ok=True)
        input_path.write_bytes(b"input")
        return input_path, {
            "dataset": "COPERNICUS/S2_SR_HARMONIZED",
            "pixel_size_m": 10,
            "image_count": 2,
        }

    monkeypatch.setattr("app.services.prediction_service.fetch_sentinel2_rgb", fake_fetch)
    monkeypatch.setattr("app.services.prediction_service.predict_file", fake_predict_file)
    created = client.post(
        "/api/prediction/region",
        json={
            "bbox": {"west": 107.9, "south": 15.9, "east": 108.2, "north": 16.1},
            "start_date": "2024-01-01",
            "end_date": "2024-12-31",
            "cloud_percent": 30,
            "image_size": 512,
        },
    )
    assert created.status_code == 200
    prediction_id = created.json()["id"]
    assert created.json()["source_metadata"]["image_count"] == 2
    assert created.json()["source_metadata"]["tiling"]["tile_size_m"] == 300
    assert created.json()["source_metadata"]["tiling"]["tile_count"] == 4

    history = client.get("/api/history")
    assert history.status_code == 200
    assert history.json()[0]["id"] == prediction_id

    stats = client.get(f"/api/statistics/{prediction_id}")
    assert stats.status_code == 200
    assert stats.json()["classes"][0]["id"] == "building"

    download = client.get(f"/api/history/{prediction_id}/download?type=geotiff")
    assert download.status_code == 200
