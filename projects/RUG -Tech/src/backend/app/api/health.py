from fastapi import APIRouter

from app.schemas.base import ApiResponse
from app.schemas.health import HealthData
from app.services.health_service import get_health_status

router = APIRouter()


@router.get("/health", response_model=ApiResponse[HealthData])
def health_check() -> ApiResponse[HealthData]:
    return get_health_status()


@router.get("/health/ready", response_model=ApiResponse[HealthData])
def readiness_check() -> ApiResponse[HealthData]:
    return get_health_status()
