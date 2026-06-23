from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Song, SourceType
from app.schemas.common import RepairLocalPathRequest, RescanMetadataRequest, SongRead, SongUpdate, SongWrite
from app.services.library_scan_service import apply_local_metadata, repair_local_path, resolve_local_file
from app.services.song_service import apply_song_payload, filter_songs, song_with_relations_query

router = APIRouter(prefix="/api", tags=["songs"])


def get_song_or_404(db: Session, song_id: int) -> Song:
    song = db.get(Song, song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song


@router.get("/songs", response_model=list[SongRead])
def list_songs(
    db: Session = Depends(get_db),
    search: str | None = None,
    source_type: str | None = None,
    genre_id: int | None = None,
    folder_id: int | None = None,
    liked: bool | None = None,
    missing_bpm: bool = False,
    missing_key: bool = False,
    missing_genre: bool = False,
    include_rejected: bool = False,
) -> list[Song]:
    statement = filter_songs(
        song_with_relations_query(),
        search=search,
        source_type=source_type,
        genre_id=genre_id,
        folder_id=folder_id,
        liked=liked,
        missing_bpm=missing_bpm,
        missing_key=missing_key,
        missing_genre=missing_genre,
        include_rejected=include_rejected,
    )
    return list(db.scalars(statement).unique().all())


@router.get("/songs/{song_id}", response_model=SongRead)
def get_song(song_id: int, db: Session = Depends(get_db)) -> Song:
    statement = song_with_relations_query().where(Song.id == song_id)
    song = db.scalars(statement).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song


@router.post("/songs", response_model=SongRead, status_code=201)
def create_song(payload: SongWrite, db: Session = Depends(get_db)) -> Song:
    if not payload.title.strip():
        raise HTTPException(status_code=422, detail="Title is required")
    song = Song(title=payload.title.strip(), is_active=True, is_rejected=False)
    db.add(song)
    apply_song_payload(db, song, payload)
    db.commit()
    db.refresh(song)
    return get_song(song.id, db)


@router.patch("/songs/{song_id}", response_model=SongRead)
def update_song(song_id: int, payload: SongUpdate, db: Session = Depends(get_db)) -> Song:
    song = get_song_or_404(db, song_id)
    apply_song_payload(db, song, payload)
    db.commit()
    return get_song(song.id, db)


@router.post("/songs/{song_id}/repair-local-path", response_model=SongRead)
def repair_song_local_path(song_id: int, payload: RepairLocalPathRequest, db: Session = Depends(get_db)) -> Song:
    song = get_song_or_404(db, song_id)
    try:
        repair_local_path(db, song, payload.new_file_path.strip())
        db.commit()
    except ValueError as error:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(error)) from error
    return get_song(song.id, db)


@router.post("/songs/{song_id}/rescan-metadata", response_model=SongRead)
def rescan_song_metadata(song_id: int, payload: RescanMetadataRequest, db: Session = Depends(get_db)) -> Song:
    song = get_song_or_404(db, song_id)
    source = next((item for item in song.sources if item.type == SourceType.local), None)
    if not source:
        raise HTTPException(status_code=400, detail="This song has no local file to rescan")
    path, error = resolve_local_file(source)
    if error or path is None:
        raise HTTPException(status_code=400, detail=error or "Local file is unavailable")
    apply_local_metadata(db, song, path, overwrite=payload.overwrite)
    db.commit()
    return get_song(song.id, db)


@router.post("/songs/{song_id}/analyze-audio-basic", response_model=SongRead)
def analyze_audio_basic(song_id: int, db: Session = Depends(get_db)) -> Song:
    song = get_song_or_404(db, song_id)
    source = next((item for item in song.sources if item.type == SourceType.local), None)
    if not source:
        raise HTTPException(status_code=400, detail="Basic analysis is available only for local audio")
    path, error = resolve_local_file(source)
    if error or path is None:
        raise HTTPException(status_code=400, detail=error or "Local file is unavailable")
    # This foundation intentionally avoids expensive BPM/key analysis libraries.
    song.analysis_status = "completed"
    song.waveform_status = "placeholder"
    song.analysis_error = "BPM and key detection are planned for a future local analysis job."
    db.commit()
    return get_song(song.id, db)


@router.delete("/songs/{song_id}")
def delete_song(song_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    song = get_song_or_404(db, song_id)
    song.is_active = False
    db.commit()
    return {"status": "soft_deleted"}


@router.post("/songs/{song_id}/like", response_model=SongRead)
def like_song(song_id: int, db: Session = Depends(get_db)) -> Song:
    song = get_song_or_404(db, song_id)
    song.is_liked = True
    db.commit()
    return get_song(song.id, db)


@router.post("/songs/{song_id}/unlike", response_model=SongRead)
def unlike_song(song_id: int, db: Session = Depends(get_db)) -> Song:
    song = get_song_or_404(db, song_id)
    song.is_liked = False
    db.commit()
    return get_song(song.id, db)


@router.post("/songs/{song_id}/reject")
def reject_song(song_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    song = get_song_or_404(db, song_id)
    song.is_rejected = True
    song.is_active = False
    db.commit()
    return {"status": "rejected"}


@router.post("/songs/{song_id}/restore", response_model=SongRead)
def restore_song(song_id: int, db: Session = Depends(get_db)) -> Song:
    song = get_song_or_404(db, song_id)
    song.is_rejected = False
    song.is_active = True
    db.commit()
    return get_song(song.id, db)


@router.get("/liked-songs", response_model=list[SongRead])
def liked_songs(db: Session = Depends(get_db)) -> list[Song]:
    statement = song_with_relations_query().where(
        Song.is_liked.is_(True),
        Song.is_active.is_(True),
        Song.is_rejected.is_(False),
    ).order_by(Song.updated_at.desc(), Song.id.desc())
    return list(db.scalars(statement).unique().all())
