"""
Analysis endpoints.

Routes:
  GET /analysis/{case_id}   → get analysis result for a case
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import CurrentUser
from app.db.deps import get_db
from app.schemas.analysis import AnalysisResultOut
from app.schemas.base import ApiResponse
from app.services import analysis_service

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.get(
    "/{case_id}",
    response_model=ApiResponse[AnalysisResultOut],
    summary="Get AI analysis result for a case",
)
def get_analysis_result(
    case_id: str,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> ApiResponse[AnalysisResultOut]:
    result = analysis_service.get_analysis_result(db, current_user, case_id)
    return ApiResponse.ok(result)

