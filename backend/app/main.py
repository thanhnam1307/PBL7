from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import auth, history, prediction, satellite, statistics
from app.core.config import get_settings
from app.core.database import init_db


def create_app() -> FastAPI:
    settings = get_settings()

    @asynccontextmanager
    async def lifespan(_app: FastAPI):
        init_db()
        yield

    app = FastAPI(title=settings.app_name, lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    settings.output_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/outputs", StaticFiles(directory=settings.output_dir), name="outputs")
    app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

    app.include_router(auth.router)
    app.include_router(satellite.router)
    app.include_router(prediction.router)
    app.include_router(statistics.router)
    app.include_router(history.router)

    @app.get("/api/health")
    def health() -> dict:
        return {"ok": True, "service": settings.app_name}

    return app


app = create_app()
