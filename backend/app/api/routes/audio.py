import mimetypes

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models import Song, SourceType
from app.services.library_scan_service import resolve_local_file


router = APIRouter(prefix="/api/audio", tags=["audio"])

SUPPORTED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".flac", ".m4a", ".aiff", ".aif"}
MEDIA_TYPES = {".mp3": "audio/mpeg", ".wav": "audio/wav", ".flac": "audio/flac", ".m4a": "audio/mp4", ".aiff": "audio/aiff", ".aif": "audio/aiff"}


@router.get("/local/{song_id}")
def stream_local_audio(song_id: int, db: Session = Depends(get_db)) -> FileResponse:
    song = db.scalar(
        select(Song)
        .options(selectinload(Song.sources))
        .where(Song.id == song_id, Song.is_active.is_(True), Song.is_rejected.is_(False))
    )
    if not song:
        raise HTTPException(status_code=404, detail="Active song not found")
    source = next((item for item in song.sources if item.type == SourceType.local), None)
    if not source:
        raise HTTPException(status_code=404, detail="This song has no local audio source")
    path, error = resolve_local_file(source)
    if error or path is None:
        status_code = 400 if error == "Local file format is unsupported" else 404
        raise HTTPException(status_code=status_code, detail=error or "Local audio file is not available")
    extension = path.suffix.lower()
    media_type = MEDIA_TYPES.get(extension) or mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    # Starlette FileResponse handles HTTP Range requests for browser seeking.
    return FileResponse(path=path, media_type=media_type, filename=path.name, content_disposition_type="inline")
