from app.schemas.base import ApiResponse
from app.schemas.health import HealthData


def get_health_status() -> ApiResponse[HealthData]:
    return ApiResponse.ok(HealthData(status="ok", message="FastAPI server is running"))
