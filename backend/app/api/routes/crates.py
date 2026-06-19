from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, insert, select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models import Crate, Song, crate_songs
from app.schemas.common import CrateRead, CrateWrite, SongRead
from app.services.song_service import song_with_relations_query

router = APIRouter(prefix="/api/crates", tags=["crates"])


def crate_or_404(db: Session, crate_id: int) -> Crate:
    item = db.get(Crate, crate_id)
    if not item:
        raise HTTPException(status_code=404, detail="Crate not found")
    return item


def crate_read(item: Crate) -> CrateRead:
    return CrateRead.model_validate(item).model_copy(update={"song_count": len(item.songs)})


@router.get("", response_model=list[CrateRead])
def list_crates(db: Session = Depends(get_db)):
    return [crate_read(item) for item in db.scalars(select(Crate).options(selectinload(Crate.songs)).order_by(Crate.created_at.desc())).all()]


@router.post("", response_model=CrateRead, status_code=201)
def create_crate(payload: CrateWrite, db: Session = Depends(get_db)):
    item = Crate(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return crate_read(item)


@router.get("/{crate_id}", response_model=CrateRead)
def get_crate(crate_id: int, db: Session = Depends(get_db)):
    return crate_read(crate_or_404(db, crate_id))


@router.patch("/{crate_id}", response_model=CrateRead)
def update_crate(crate_id: int, payload: CrateWrite, db: Session = Depends(get_db)):
    item = crate_or_404(db, crate_id)
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    return crate_read(item)


@router.delete("/{crate_id}")
def delete_crate(crate_id: int, db: Session = Depends(get_db)):
    db.delete(crate_or_404(db, crate_id))
    db.commit()
    return {"status": "deleted"}


@router.get("/{crate_id}/songs", response_model=list[SongRead])
def crate_song_list(crate_id: int, db: Session = Depends(get_db)):
    crate_or_404(db, crate_id)
    return list(db.scalars(song_with_relations_query().join(Song.crates).where(Crate.id == crate_id)).unique().all())


@router.post("/{crate_id}/songs/{song_id}", response_model=CrateRead)
def add_song(crate_id: int, song_id: int, db: Session = Depends(get_db)):
    crate = crate_or_404(db, crate_id)
    if not db.get(Song, song_id):
        raise HTTPException(status_code=404, detail="Song not found")
    exists = db.execute(select(crate_songs).where(crate_songs.c.crate_id == crate_id, crate_songs.c.song_id == song_id)).first()
    if not exists:
        db.execute(insert(crate_songs).values(crate_id=crate_id, song_id=song_id))
    db.commit()
    db.refresh(crate)
    return crate_read(crate)


@router.delete("/{crate_id}/songs/{song_id}", response_model=CrateRead)
def remove_song(crate_id: int, song_id: int, db: Session = Depends(get_db)):
    crate = crate_or_404(db, crate_id)
    db.execute(delete(crate_songs).where(crate_songs.c.crate_id == crate_id, crate_songs.c.song_id == song_id))
    db.commit()
    db.refresh(crate)
    return crate_read(crate)
