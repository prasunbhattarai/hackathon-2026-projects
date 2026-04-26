"""
Global exception handlers.

Ensures all errors use the ApiResponse envelope and canonical error codes.
"""

from __future__ import annotations

from collections import defaultdict
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.schemas.base import ApiResponse
from app.schemas.enums import ErrorCode

_STATUS_TO_ERROR_CODE: dict[int, ErrorCode] = {
    status.HTTP_401_UNAUTHORIZED: ErrorCode.AUTH_REQUIRED,
    status.HTTP_403_FORBIDDEN: ErrorCode.FORBIDDEN,
    status.HTTP_404_NOT_FOUND: ErrorCode.NOT_FOUND,
    status.HTTP_409_CONFLICT: ErrorCode.CONFLICT,
    status.HTTP_422_UNPROCESSABLE_ENTITY: ErrorCode.VALIDATION_ERROR,
    status.HTTP_500_INTERNAL_SERVER_ERROR: ErrorCode.INTERNAL_ERROR,
}


def _payload(status_code: int, code: ErrorCode, message: str, details: dict[str, list[str]] | None = None) -> JSONResponse:
    envelope = ApiResponse.fail(code=code.value, message=message, details=details)
    return JSONResponse(status_code=status_code, content=envelope.model_dump())


def _map_http_error(status_code: int, detail: Any) -> tuple[ErrorCode, str]:
    code = _STATUS_TO_ERROR_CODE.get(status_code, ErrorCode.INTERNAL_ERROR)
    if isinstance(detail, str):
        message = detail
    else:
        message = str(detail)
    if status_code >= 500 and code == ErrorCode.INTERNAL_ERROR and not message:
        message = "Unexpected server error"
    return code, message


def _validation_details(exc: RequestValidationError) -> dict[str, list[str]]:
    details: dict[str, list[str]] = defaultdict(list)
    for err in exc.errors():
        loc = list(err.get("loc") or [])
        field = "request"
        if len(loc) >= 2:
            field = ".".join(str(x) for x in loc[1:])
        elif len(loc) == 1:
            field = str(loc[0])
        details[field].append(str(err.get("msg", "Invalid value")))
    return dict(details)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def on_validation_error(_request: Request, exc: RequestValidationError) -> JSONResponse:
        return _payload(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code=ErrorCode.VALIDATION_ERROR,
            message="Request validation failed",
            details=_validation_details(exc),
        )

    @app.exception_handler(StarletteHTTPException)
    async def on_http_error(_request: Request, exc: StarletteHTTPException) -> JSONResponse:
        code, message = _map_http_error(exc.status_code, exc.detail)
        return _payload(status_code=exc.status_code, code=code, message=message)

    @app.exception_handler(Exception)
    async def on_unhandled_error(request: Request, _exc: Exception) -> JSONResponse:
        request_id = request.headers.get("x-request-id") or "unknown"
        return _payload(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code=ErrorCode.INTERNAL_ERROR,
            message=f"Unexpected server error (requestId={request_id})",
        )
