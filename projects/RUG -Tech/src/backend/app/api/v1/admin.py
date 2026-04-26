from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import AdminUser
from app.db.deps import get_db
from app.schemas.admin import ClinicOut, CreateClinicRequest, CreateUserRequest, PlatformStatsOut, UpdateUserStatusRequest
from app.schemas.auth import UserOut
from app.schemas.base import ApiResponse
from app.services import admin_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get(
	"/clinics",
	response_model=ApiResponse[list[ClinicOut]],
	summary="List all clinics",
)
def list_clinics(
	_admin: AdminUser,
	db: Session = Depends(get_db),
) -> ApiResponse[list[ClinicOut]]:
	result = admin_service.list_clinics(db)
	return ApiResponse.ok(result)


@router.post(
	"/clinics",
	response_model=ApiResponse[ClinicOut],
	summary="Create a clinic",
)
def create_clinic(
	body: CreateClinicRequest,
	_admin: AdminUser,
	db: Session = Depends(get_db),
) -> ApiResponse[ClinicOut]:
	result = admin_service.create_clinic(db, body)
	return ApiResponse.ok(result)


@router.get(
	"/users",
	response_model=ApiResponse[list[UserOut]],
	summary="List users (optionally filtered by clinicId)",
)
def list_users(
	_admin: AdminUser,
	db: Session = Depends(get_db),
	clinic_id: str | None = Query(default=None, alias="clinicId"),
) -> ApiResponse[list[UserOut]]:
	result = admin_service.list_users(db, clinic_id)
	return ApiResponse.ok(result)


@router.post(
	"/users",
	response_model=ApiResponse[UserOut],
	summary="Create doctor account",
)
def create_user(
	body: CreateUserRequest,
	_admin: AdminUser,
	db: Session = Depends(get_db),
) -> ApiResponse[UserOut]:
	result = admin_service.create_user(db, body)
	return ApiResponse.ok(result)


@router.post(
	"/users/{user_id}/status",
	response_model=ApiResponse[UserOut],
	summary="Activate/deactivate user",
)
def update_user_status(
	user_id: str,
	body: UpdateUserStatusRequest,
	_admin: AdminUser,
	db: Session = Depends(get_db),
) -> ApiResponse[UserOut]:
	result = admin_service.update_user_status(db, user_id, body)
	return ApiResponse.ok(result)


@router.get(
	"/stats",
	response_model=ApiResponse[PlatformStatsOut],
	summary="Get platform-wide aggregate stats",
)
def get_platform_stats(
	_admin: AdminUser,
	db: Session = Depends(get_db),
) -> ApiResponse[PlatformStatsOut]:
	result = admin_service.get_platform_stats(db)
	return ApiResponse.ok(result)
