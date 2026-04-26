"""
Base response envelope and pagination schemas.

All endpoints return ApiResponse[T].  Paginated endpoints return
ApiResponse[PaginatedResponse[T]].
"""

from typing import Generic, TypeVar

from pydantic import BaseModel, Field

DataT = TypeVar("DataT")


class ApiError(BaseModel):
    code: str
    message: str
    details: dict[str, list[str]] | None = None


class ApiResponse(BaseModel, Generic[DataT]):
    success: bool
    data: DataT | None
    error: ApiError | None = None

    @classmethod
    def ok(cls, data: DataT) -> "ApiResponse[DataT]":
        return cls(success=True, data=data, error=None)

    @classmethod
    def fail(cls, code: str, message: str, details: dict[str, list[str]] | None = None) -> "ApiResponse[None]":
        return ApiResponse[None](
            success=False,
            data=None,
            error=ApiError(code=code, message=message, details=details),
        )


class PaginatedResponse(BaseModel, Generic[DataT]):
    items: list[DataT]
    total: int
    page: int = Field(ge=1)
    limit: int = Field(ge=1, le=100)
    totalPages: int
