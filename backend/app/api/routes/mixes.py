from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models import Genre, Mix, MixSong, Song
from app.schemas.common import MixRead, MixSongRead, MixSongUpdate, MixSongWrite, MixWrite
from app.services.song_service import get_or_create_named, song_with_relations_query

router = APIRouter(prefix="/api/mixes", tags=["mixes"])


def mix_or_404(db: Session, mix_id: int) -> Mix:
    item = db.get(Mix, mix_id)
    if not item:
        raise HTTPException(status_code=404, detail="Mix not found")
    return item


def apply_mix(db: Session, item: Mix, payload: MixWrite) -> Mix:
    data = payload.model_dump()
    item.title = data["title"].strip()
    item.genre = get_or_create_named(db, Genre, data.pop("genre_name"), field="name")
    for key, value in data.items():
        if key != "title":
            setattr(item, key, value)
    return item


@router.get("", response_model=list[MixRead])
def list_mixes(db: Session = Depends(get_db)):
    return list(db.scalars(select(Mix).options(selectinload(Mix.genre)).order_by(Mix.created_at.desc())).all())


@router.post("", response_model=MixRead, status_code=201)
def create_mix(payload: MixWrite, db: Session = Depends(get_db)):
    item = apply_mix(db, Mix(title=payload.title.strip()), payload)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/{mix_id}", response_model=MixRead)
def get_mix(mix_id: int, db: Session = Depends(get_db)):
    return mix_or_404(db, mix_id)


@router.patch("/{mix_id}", response_model=MixRead)
def update_mix(mix_id: int, payload: MixWrite, db: Session = Depends(get_db)):
    item = apply_mix(db, mix_or_404(db, mix_id), payload)
    db.commit()
    return item


@router.delete("/{mix_id}")
def delete_mix(mix_id: int, db: Session = Depends(get_db)):
    db.delete(mix_or_404(db, mix_id))
    db.commit()
    return {"status": "deleted"}


@router.get("/{mix_id}/songs", response_model=list[MixSongRead])
def list_mix_songs(mix_id: int, db: Session = Depends(get_db)):
    mix_or_404(db, mix_id)
    return list(db.scalars(select(MixSong).options(selectinload(MixSong.song).selectinload(Song.artist), selectinload(MixSong.song).selectinload(Song.album), selectinload(MixSong.song).selectinload(Song.genre), selectinload(MixSong.song).selectinload(Song.sources), selectinload(MixSong.song).selectinload(Song.folders)).where(MixSong.mix_id == mix_id).order_by(MixSong.position, MixSong.id)).all())


@router.post("/{mix_id}/songs", response_model=MixSongRead, status_code=201)
def add_mix_song(mix_id: int, payload: MixSongWrite, db: Session = Depends(get_db)):
    mix_or_404(db, mix_id)
    if not db.get(Song, payload.song_id): raise HTTPException(status_code=404, detail="Song not found")
    existing = db.scalar(select(MixSong).where(MixSong.mix_id == mix_id, MixSong.song_id == payload.song_id))
    if existing: return existing
    position = payload.position if payload.position is not None else (db.scalar(select(MixSong.position).where(MixSong.mix_id == mix_id).order_by(MixSong.position.desc()).limit(1)) or 0) + 1
    item = MixSong(mix_id=mix_id, song_id=payload.song_id, position=position, cue_notes=payload.cue_notes, transition_notes=payload.transition_notes)
    db.add(item); db.commit()
    return db.scalar(select(MixSong).options(selectinload(MixSong.song).selectinload(Song.artist), selectinload(MixSong.song).selectinload(Song.album), selectinload(MixSong.song).selectinload(Song.genre), selectinload(MixSong.song).selectinload(Song.sources), selectinload(MixSong.song).selectinload(Song.folders)).where(MixSong.id == item.id))


@router.patch("/{mix_id}/songs/{mix_song_id}", response_model=MixSongRead)
def update_mix_song(mix_id: int, mix_song_id: int, payload: MixSongUpdate, db: Session = Depends(get_db)):
    item = db.get(MixSong, mix_song_id)
    if not item or item.mix_id != mix_id: raise HTTPException(status_code=404, detail="Mix song link not found")
    for key, value in payload.model_dump(exclude_unset=True).items(): setattr(item, key, value)
    db.commit()
    return item


@router.delete("/{mix_id}/songs/{mix_song_id}")
def delete_mix_song(mix_id: int, mix_song_id: int, db: Session = Depends(get_db)):
    item = db.get(MixSong, mix_song_id)
    if not item or item.mix_id != mix_id: raise HTTPException(status_code=404, detail="Mix song link not found")
    db.delete(item); db.commit(); return {"status": "deleted"}
