from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.common import AudioUploadResult, LibraryScanRequest, LibraryScanResult, LocalFileHealthResult
from app.services.library_scan_service import check_local_files, import_uploaded_audio, scan_local_library


router = APIRouter(prefix="/api/library", tags=["library"])


@router.post("/scan-folder", response_model=LibraryScanResult)
def scan_folder(payload: LibraryScanRequest, db: Session = Depends(get_db)) -> LibraryScanResult:
    if not payload.folder_path.strip():
        raise HTTPException(status_code=422, detail="folder_path is required")
    try:
        return scan_local_library(db, payload.folder_path.strip())
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.post("/check-files", response_model=LocalFileHealthResult)
def check_files(db: Session = Depends(get_db)) -> LocalFileHealthResult:
    return check_local_files(db)


@router.post("/upload-audio", response_model=AudioUploadResult)
async def upload_audio(files: list[UploadFile] = File(...), db: Session = Depends(get_db)) -> AudioUploadResult:
    if not files:
        raise HTTPException(status_code=422, detail="At least one audio file is required")
    return await import_uploaded_audio(db, files)
