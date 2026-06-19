from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.common import LibraryScanRequest, LibraryScanResult
from app.services.library_scan_service import scan_local_library


router = APIRouter(prefix="/api/library", tags=["library"])


@router.post("/scan-folder", response_model=LibraryScanResult)
def scan_folder(payload: LibraryScanRequest, db: Session = Depends(get_db)) -> LibraryScanResult:
    if not payload.folder_path.strip():
        raise HTTPException(status_code=422, detail="folder_path is required")
    try:
        return scan_local_library(db, payload.folder_path.strip())
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
