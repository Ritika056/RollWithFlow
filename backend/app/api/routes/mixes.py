from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models import Genre, Mix
from app.schemas.common import MixRead, MixWrite
from app.services.song_service import get_or_create_named

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
