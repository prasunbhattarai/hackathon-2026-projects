from fastapi import APIRouter

from app.api.health import router as health_router
from app.api.v1.analysis import router as analysis_router
from app.api.v1.auth import router as auth_router
from app.api.v1.cases import router as cases_router
from app.api.v1.patients import router as patients_router
from app.api.v1.reports import router as reports_router
from app.api.v1.admin import router as admin_router

v1_router = APIRouter()

# Keep health as part of v1 prefix for consistency with existing behavior.
v1_router.include_router(health_router, tags=["health"])
v1_router.include_router(auth_router)
v1_router.include_router(patients_router)
v1_router.include_router(cases_router)
v1_router.include_router(analysis_router)
v1_router.include_router(reports_router)
v1_router.include_router(admin_router)
