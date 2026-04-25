from app.schemas.health import HealthCheckResponse


def get_health_status() -> HealthCheckResponse:
    return HealthCheckResponse(status="ok", message="FastAPI server is running")
