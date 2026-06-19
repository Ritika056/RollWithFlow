from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models import Folder, Song
from app.schemas.common import FolderRead, FolderWrite, SongRead
from app.services.song_service import song_with_relations_query

router = APIRouter(prefix="/api/folders", tags=["folders"])


def folder_to_read(folder: Folder) -> FolderRead:
    count = len([song for song in folder.songs if song.is_active and not song.is_rejected])
    return FolderRead.model_validate(folder).model_copy(
        update={"song_count": count, "songs_count": count, "playlists_count": 0, "mixes_count": 0}
    )


def get_folder_or_404(db: Session, folder_id: int) -> Folder:
    folder = db.get(Folder, folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder


@router.get("", response_model=list[FolderRead])
def list_folders(db: Session = Depends(get_db)) -> list[FolderRead]:
    folders = db.scalars(select(Folder).options(selectinload(Folder.songs)).order_by(Folder.is_pinned.desc(), Folder.name)).all()
    return [folder_to_read(folder) for folder in folders]


@router.get("/{folder_id}", response_model=FolderRead)
def get_folder(folder_id: int, db: Session = Depends(get_db)) -> FolderRead:
    folder = db.scalars(select(Folder).options(selectinload(Folder.songs)).where(Folder.id == folder_id)).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder_to_read(folder)


@router.post("", response_model=FolderRead, status_code=201)
def create_folder(payload: FolderWrite, db: Session = Depends(get_db)) -> FolderRead:
    if not payload.name.strip():
        raise HTTPException(status_code=422, detail="Folder name is required")
    existing = db.scalar(select(Folder).where(Folder.name == payload.name.strip()))
    if existing:
        raise HTTPException(status_code=409, detail="Folder already exists")
    folder = Folder(name=payload.name.strip(), description=payload.description, is_pinned=payload.is_pinned)
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return folder_to_read(folder)


@router.patch("/{folder_id}", response_model=FolderRead)
def update_folder(folder_id: int, payload: FolderWrite, db: Session = Depends(get_db)) -> FolderRead:
    folder = get_folder_or_404(db, folder_id)
    if folder.is_pinned and folder.name == "Liked Songs":
        payload.is_pinned = True
    folder.name = payload.name.strip()
    folder.description = payload.description
    folder.is_pinned = payload.is_pinned
    db.commit()
    return get_folder(folder.id, db)


@router.delete("/{folder_id}")
def delete_folder(folder_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    folder = get_folder_or_404(db, folder_id)
    if folder.is_pinned and folder.name == "Liked Songs":
        raise HTTPException(status_code=400, detail="Pinned Liked Songs folder cannot be deleted")
    db.delete(folder)
    db.commit()
    return {"status": "deleted"}


@router.get("/{folder_id}/songs", response_model=list[SongRead])
def get_folder_songs(folder_id: int, db: Session = Depends(get_db)) -> list[Song]:
    get_folder_or_404(db, folder_id)
    statement = (
        song_with_relations_query()
        .join(Song.folders)
        .where(Folder.id == folder_id, Song.is_active.is_(True), Song.is_rejected.is_(False))
        .order_by(Song.title)
    )
    return list(db.scalars(statement).unique().all())


@router.post("/{folder_id}/songs/{song_id}", response_model=FolderRead)
def add_song_to_folder(folder_id: int, song_id: int, db: Session = Depends(get_db)) -> FolderRead:
    folder = get_folder_or_404(db, folder_id)
    song = db.get(Song, song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    if song not in folder.songs:
        folder.songs.append(song)
    db.commit()
    return get_folder(folder.id, db)


@router.delete("/{folder_id}/songs/{song_id}", response_model=FolderRead)
def remove_song_from_folder(folder_id: int, song_id: int, db: Session = Depends(get_db)) -> FolderRead:
    folder = get_folder_or_404(db, folder_id)
    song = db.get(Song, song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    if song in folder.songs:
        folder.songs.remove(song)
    db.commit()
    return get_folder(folder.id, db)
