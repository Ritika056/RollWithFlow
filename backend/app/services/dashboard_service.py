from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models import (
    Crate,
    DiscoveryItem,
    Folder,
    Mix,
    Playlist,
    Song,
    Source,
    SourceType,
    song_sources,
)
from app.schemas.dashboard import DashboardSummary


def get_dashboard_summary(db: Session) -> DashboardSummary:
    active_filter = (Song.is_active.is_(True), Song.is_rejected.is_(False))
    active_songs = select(func.count()).select_from(Song).where(*active_filter)
    local_songs = (
        select(func.count(func.distinct(Song.id)))
        .select_from(Song)
        .join(song_sources, Song.id == song_sources.c.song_id)
        .join(Source, Source.id == song_sources.c.source_id)
        .where(*active_filter, Source.type == SourceType.local)
    )
    unfiled_songs = (
        select(func.count())
        .select_from(Song)
        .outerjoin(Song.folders)
        .where(*active_filter, Folder.id.is_(None))
    )
    recent = db.scalars(
        select(Song)
        .options(selectinload(Song.artist), selectinload(Song.genre), selectinload(Song.sources), selectinload(Song.folders))
        .where(*active_filter)
        .order_by(Song.created_at.desc(), Song.id.desc())
        .limit(6)
    ).unique().all()

    counts = {
        "total_songs": db.scalar(active_songs) or 0,
        "local_songs": db.scalar(local_songs) or 0,
        "liked_songs": db.scalar(select(func.count()).select_from(Song).where(Song.is_liked.is_(True), *active_filter)) or 0,
        "discovered_songs": db.scalar(select(func.count()).select_from(DiscoveryItem).where(DiscoveryItem.is_saved.is_(True))) or 0,
        "folders": db.scalar(select(func.count()).select_from(Folder)) or 0,
        "playlists": db.scalar(select(func.count()).select_from(Playlist)) or 0,
        "crates": db.scalar(select(func.count()).select_from(Crate)) or 0,
        "mixes": db.scalar(select(func.count()).select_from(Mix)) or 0,
        "discovery_items": db.scalar(select(func.count()).select_from(DiscoveryItem)) or 0,
        "rejected_songs": db.scalar(select(func.count()).select_from(Song).where(Song.is_rejected.is_(True))) or 0,
        "missing_bpm": db.scalar(select(func.count()).select_from(Song).where(Song.bpm.is_(None), *active_filter)) or 0,
        "missing_key": db.scalar(select(func.count()).select_from(Song).where(Song.musical_key.is_(None), *active_filter)) or 0,
        "missing_genre": db.scalar(select(func.count()).select_from(Song).where(Song.genre_id.is_(None), *active_filter)) or 0,
        "unfiled_songs": db.scalar(unfiled_songs) or 0,
        "recently_added": [
            {
                "id": song.id,
                "title": song.title,
                "artist": song.artist.name if song.artist else None,
                "genre": song.genre.name if song.genre else None,
                "source_type": song.sources[0].type.value if song.sources else None,
                "created_at": song.created_at.isoformat(),
                "is_liked": song.is_liked,
                "folder_names": [folder.name for folder in song.folders],
            }
            for song in recent
        ],
    }
    return DashboardSummary(**counts)
