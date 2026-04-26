from pydantic import BaseModel

from app.schemas.base import ApiResponse


class HealthData(BaseModel):
    status: str
    message: str


# Convenience alias used by the health router
HealthCheckResponse = ApiResponse[HealthData]
