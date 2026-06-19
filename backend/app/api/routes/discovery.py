from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import DiscoveryItem
from app.schemas.common import DiscoveryItemRead, DiscoveryItemWrite, SongRead
from app.services.discovery_service import apply_discovery, run_mock_daily_discovery_fetch, save_discovery_to_library

router = APIRouter(prefix="/api/discovery", tags=["discovery"])


def item_or_404(db: Session, item_id: int) -> DiscoveryItem:
    item = db.get(DiscoveryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Discovery item not found")
    return item


@router.get("", response_model=list[DiscoveryItemRead])
def list_discovery(
    db: Session = Depends(get_db),
    search: str | None = None,
    platform: str | None = None,
    discovery_type: str | None = None,
    saved: bool | None = None,
    rejected: bool | None = None,
):
    statement = select(DiscoveryItem)
    if search:
        term = f"%{search}%"
        statement = statement.where((DiscoveryItem.title.ilike(term)) | (DiscoveryItem.artist_name.ilike(term)))
    if platform:
        statement = statement.where(DiscoveryItem.platform == platform)
    if discovery_type:
        statement = statement.where(DiscoveryItem.discovery_type == discovery_type)
    if saved is not None:
        statement = statement.where(DiscoveryItem.is_saved.is_(saved))
    if rejected is not None:
        statement = statement.where(DiscoveryItem.is_rejected.is_(rejected))
    return list(db.scalars(statement.order_by(DiscoveryItem.fetched_at.desc(), DiscoveryItem.id.desc())).all())


@router.post("", response_model=DiscoveryItemRead, status_code=201)
def create_discovery(payload: DiscoveryItemWrite, db: Session = Depends(get_db)):
    item = apply_discovery(DiscoveryItem(title=payload.title, platform=payload.platform), payload)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.post("/{item_id}/save-to-library", response_model=SongRead)
def save_to_library(item_id: int, db: Session = Depends(get_db)):
    item = item_or_404(db, item_id)
    song = save_discovery_to_library(db, item)
    db.commit()
    db.refresh(song)
    return song


@router.post("/{item_id}/reject")
def reject_item(item_id: int, db: Session = Depends(get_db)):
    item = item_or_404(db, item_id)
    item.is_rejected = True
    db.commit()
    return {"status": "rejected"}


@router.post("/{item_id}/restore", response_model=DiscoveryItemRead)
def restore_item(item_id: int, db: Session = Depends(get_db)):
    item = item_or_404(db, item_id)
    item.is_rejected = False
    db.commit()
    return item


@router.post("/mock-daily-fetch", response_model=list[DiscoveryItemRead])
def mock_daily_fetch(db: Session = Depends(get_db)):
    return run_mock_daily_discovery_fetch(db)
