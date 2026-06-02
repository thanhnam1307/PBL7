# Da Nang LandGIS

WebGIS demo for Da Nang land-cover classification. The system lets users view
satellite basemaps, select a region, fetch Sentinel-2 imagery from Google Earth
Engine, run a local PyTorch U-Net++ model, show the classification overlay, and
store prediction history with PNG, GeoTIFF, and JSON report outputs.

## Project Structure

```txt
backend/      FastAPI API, SQLite history, Earth Engine adapter, AI inference
frontend/     React + Mapbox WebGIS interface
Train_model/  Training notebook and local training artifacts
```

Runtime data is generated locally and is not committed:

```txt
backend/.env
frontend/.env
backend/app.db
backend/uploads/
backend/outputs/
backend/models/*.pth
frontend/node_modules/
frontend/build/
```

## Prerequisites

- Python 3.11
- Node.js 20 or compatible npm runtime
- Google Cloud project with Earth Engine access
- Mapbox access token
- Trained checkpoint file for the active model

The backend expects the active checkpoint at:

```txt
backend/models/land_classification_model.pth
```

For the current training notebook, copy your local checkpoint manually:

```sh
cp Train_model/best_unetpp.pth backend/models/land_classification_model.pth
```

The checkpoint is intentionally ignored by Git.

## Environment Setup

Create backend env:

```sh
cd backend
cp .env.sample .env
python3.11 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
cd ..
```

Create frontend env:

```sh
cd frontend
cp .env.sample .env
npm install
cd ..
```

Set at least these values:

```txt
backend/.env
GEE_PROJECT_ID=your-google-cloud-project-id
MODEL_PATH=models/land_classification_model.pth
```

```txt
frontend/.env
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_MAPBOX_TOKEN=your-mapbox-token
REACT_APP_REQUIRE_LOGIN=false
```

## Google Earth Engine

Authenticate local Application Default Credentials:

```sh
gcloud auth application-default login \
  --scopes=https://www.googleapis.com/auth/earthengine,https://www.googleapis.com/auth/cloud-platform
gcloud auth application-default set-quota-project YOUR_PROJECT_ID
```

Then set `GEE_PROJECT_ID=YOUR_PROJECT_ID` in `backend/.env`.

Check backend Earth Engine status after starting the API:

```sh
curl http://127.0.0.1:8000/api/satellite/status
```

## Run Locally

After backend/frontend dependencies and env files are ready, run both services
from the project root:

```sh
npm start
```

URLs:

```txt
Frontend: http://localhost:3000
Backend:  http://localhost:8000
API docs: http://localhost:8000/docs
```

Stop both processes with `Ctrl+C`.

You can also run services separately:

```sh
npm run start:backend
npm run start:frontend
```

## Prediction Flow

1. Open the frontend at `http://localhost:3000`.
2. Go to `Prediction`.
3. Select a region on the map or use the demo region.
4. Choose date range, cloud percentage, and pixel size.
5. Run AI prediction.
6. Review the overlay and statistics panel.
7. Use `History` to reopen or download PNG, GeoTIFF, and report files.

The region pipeline fetches `COPERNICUS/S2_SR_HARMONIZED` from Earth Engine and
builds an 8-band input in this order:

```txt
B2, B3, B4, B8, B11, NDVI, NDWI, NDBI
```

The current model class order is:

```txt
water, vegetation, agriculture, built_up, bare
```

## API Summary

Main endpoints:

```txt
GET  /api/health
GET  /api/satellite/status
GET  /api/satellite/land-cover/layer
GET  /api/satellite/land-cover/tiles/{layer_id}/{z}/{x}/{y}.png
POST /api/auth/login
POST /api/prediction/upload
POST /api/prediction/region
GET  /api/statistics/{prediction_id}
GET  /api/history
GET  /api/history/{prediction_id}
GET  /api/history/{prediction_id}/download?type=png|geotiff|report
```

Demo login is local only and is not production authentication.

## Tests

Run all tests:

```sh
npm test
```

Run backend only:

```sh
cd backend
. .venv/bin/activate
pytest tests
```

Run frontend only:

```sh
cd frontend
CI=true npm test -- --watchAll=false
```

## Docker

Create root env:

```sh
cp .env.example .env
```

Edit `.env`, put the model file in `backend/models/`, then run:

```sh
docker compose up --build
```

The compose setup mounts:

```txt
backend/uploads/
backend/outputs/
backend/models/
```

## Git Notes

Do not commit:

- Real `.env` files or service-account keys
- Mapbox tokens or Google credentials
- SQLite databases
- Uploads, generated PNG/GeoTIFF/report outputs
- Model checkpoints such as `.pth`
- `node_modules`, build folders, virtualenvs, caches

Commit source code, tests, Docker files, sample env files, documentation, and
training notebooks needed to understand the model architecture.
