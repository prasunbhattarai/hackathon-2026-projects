from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import settings
from app.utils.logging import configure_logging

configure_logging()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)
