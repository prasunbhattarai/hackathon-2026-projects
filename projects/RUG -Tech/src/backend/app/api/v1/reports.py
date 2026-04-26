from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import CurrentUser
from app.db.deps import get_db
from app.schemas.base import ApiResponse
from app.schemas.enums import ReportType
from app.schemas.report import (
	DoctorReportOut,
	GenerateReportRequest,
	PDFDownloadUrlOut,
	PatientReportOut,
	ReportOut,
)
from app.services import report_service

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post(
	"/generate",
	response_model=ApiResponse[ReportOut],
	summary="Generate and persist a report + signed PDF URL",
)
def generate_report(
	body: GenerateReportRequest,
	current_user: CurrentUser,
	db: Session = Depends(get_db),
) -> ApiResponse[ReportOut]:
	result = report_service.generate_report(db, current_user, body.caseId, body.reportType)
	return ApiResponse.ok(result)


@router.get(
	"",
	response_model=ApiResponse[list[ReportOut]],
	summary="List reports for a case",
)
def list_reports(
	case_id: str,
	current_user: CurrentUser,
	db: Session = Depends(get_db),
) -> ApiResponse[list[ReportOut]]:
	result = report_service.list_reports(db, current_user, case_id)
	return ApiResponse.ok(result)


@router.get(
	"/{report_id}",
	response_model=ApiResponse[ReportOut],
	summary="Get a report by id",
)
def get_report(
	report_id: str,
	current_user: CurrentUser,
	db: Session = Depends(get_db),
) -> ApiResponse[ReportOut]:
	result = report_service.get_report(db, current_user, report_id)
	return ApiResponse.ok(result)


@router.get(
	"/{case_id}/doctor",
	response_model=ApiResponse[DoctorReportOut],
	summary="Get doctor-facing JSON report",
)
def get_doctor_report(
	case_id: str,
	current_user: CurrentUser,
	db: Session = Depends(get_db),
) -> ApiResponse[DoctorReportOut]:
	result = report_service.get_case_report_json(db, current_user, case_id, ReportType.DOCTOR)
	return ApiResponse.ok(result)


@router.get(
	"/{case_id}/patient",
	response_model=ApiResponse[PatientReportOut],
	summary="Get patient-friendly JSON report",
)
def get_patient_report(
	case_id: str,
	current_user: CurrentUser,
	db: Session = Depends(get_db),
) -> ApiResponse[PatientReportOut]:
	result = report_service.get_case_report_json(db, current_user, case_id, ReportType.PATIENT)
	return ApiResponse.ok(result)


@router.get(
	"/{case_id}/pdf",
	response_model=ApiResponse[PDFDownloadUrlOut],
	summary="Get time-limited signed PDF URL",
)
def get_case_pdf_url(
	case_id: str,
	current_user: CurrentUser,
	db: Session = Depends(get_db),
	report_type: ReportType = Query(default=ReportType.DOCTOR, alias="type"),
) -> ApiResponse[PDFDownloadUrlOut]:
	result = report_service.get_case_pdf_url(db, current_user, case_id, report_type)
	return ApiResponse.ok(result)
