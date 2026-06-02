# Backend

FastAPI backend for the Da Nang WebGIS land classification system.

## Setup

```sh
cd backend
python3.11 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Use Python 3.11 for local inference on this project. The pinned PyTorch build in
`requirements.txt` is selected for the current macOS x86_64 development
machine.

## Google Earth Engine

For local development with Application Default Credentials:

```sh
gcloud auth application-default login \
  --scopes=https://www.googleapis.com/auth/earthengine,https://www.googleapis.com/auth/cloud-platform
gcloud auth application-default set-quota-project YOUR_PROJECT_ID
cp .env.sample .env
```

Set `GEE_PROJECT_ID=YOUR_PROJECT_ID` in `backend/.env`, then restart Uvicorn.
Check the connection:

```sh
curl http://127.0.0.1:8000/api/satellite/status
curl "http://127.0.0.1:8000/api/satellite/land-cover/layer?year=2024&mode=top1&classes=water,built,trees"
```

The map page renders the returned Dynamic World tile template when the frontend
layer mode is set to `Dynamic World`.

Region prediction fetches Sentinel-2 SR Harmonized for the selected
bbox/date/cloud filters. It downloads an 8-band GeoTIFF in model order
`B2,B3,B4,B8,B11,NDVI,NDWI,NDBI`, measures the bbox from its coordinates,
computes the pixel grid from `pixel_size_m` (10m by default), runs the AI model
on native-pixel tiles, stitches the masks back into one georeferenced result,
and produces:

- PNG overlay for the map.
- GeoTIFF mask for GIS workflows.
- JSON report with area statistics and source metadata.

The AI endpoint loads `models/land_classification_model.pth` lazily. This file
is intentionally not committed to Git. For local runs, copy the trained
checkpoint into place:

```sh
cp ../Train_model/best_unetpp.pth models/land_classification_model.pth
```

The active checkpoint is the custom Dynamic World U-Net++ model from the
training notebook. The loader reads `model_state_dict`, `config`, and class
metadata from the checkpoint. If the architecture is unsupported, the API
returns a clear 503 error and the wrapper should be adjusted in
`app/ai/model_loader.py`.
