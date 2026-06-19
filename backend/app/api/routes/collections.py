from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models import Crate, DiscoveryItem, Mix, Playlist
from app.schemas.common import (
    CrateRead,
    DiscoveryItemRead,
    MixRead,
    PlaylistRead,
)

router = APIRouter(prefix="/api", tags=["collections"])


@router.get("/playlists", response_model=list[PlaylistRead])
def list_playlists(db: Session = Depends(get_db)) -> list[PlaylistRead]:
    playlists = db.scalars(select(Playlist).options(selectinload(Playlist.songs)).order_by(Playlist.created_at.desc())).all()
    return [PlaylistRead.model_validate(playlist).model_copy(update={"song_count": len(playlist.songs)}) for playlist in playlists]


@router.get("/crates", response_model=list[CrateRead])
def list_crates(db: Session = Depends(get_db)) -> list[CrateRead]:
    crates = db.scalars(select(Crate).options(selectinload(Crate.songs)).order_by(Crate.created_at.desc())).all()
    return [CrateRead.model_validate(crate).model_copy(update={"song_count": len(crate.songs)}) for crate in crates]


@router.get("/mixes", response_model=list[MixRead])
def list_mixes(db: Session = Depends(get_db)) -> list[Mix]:
    return list(db.scalars(select(Mix).options(selectinload(Mix.genre)).order_by(Mix.created_at.desc())).all())


@router.get("/discovery", response_model=list[DiscoveryItemRead])
def list_discovery(db: Session = Depends(get_db)) -> list[DiscoveryItem]:
    return list(db.scalars(select(DiscoveryItem).order_by(DiscoveryItem.fetched_at.desc(), DiscoveryItem.id.desc())).all())
