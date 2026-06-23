from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Artist, Crate, Event, Folder, Genre, Playlist, Song, Source, SourceType, crate_songs, song_sources
from app.schemas.common import AnalyticsSummary

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


def pairs(rows): return [{"name": str(row[0] or "Unassigned"), "count": int(row[1])} for row in rows]


@router.get("/summary", response_model=AnalyticsSummary)
def summary(db: Session = Depends(get_db)) -> AnalyticsSummary:
    active = (Song.is_active.is_(True), Song.is_rejected.is_(False))
    total = db.scalar(select(func.count()).select_from(Song).where(*active)) or 0
    local_ids = select(song_sources.c.song_id).join(Source).where(Source.type == SourceType.local)
    playable = db.scalar(select(func.count()).select_from(Song).where(*active, Song.id.in_(local_ids))) or 0
    return AnalyticsSummary(
        total_songs=total, playable_local_songs=playable, provider_only_songs=max(0, total - playable),
        liked_songs=db.scalar(select(func.count()).select_from(Song).where(*active, Song.is_liked.is_(True))) or 0,
        rejected_songs=db.scalar(select(func.count()).select_from(Song).where(Song.is_rejected.is_(True))) or 0,
        missing_bpm=db.scalar(select(func.count()).select_from(Song).where(*active, Song.bpm.is_(None))) or 0,
        missing_key=db.scalar(select(func.count()).select_from(Song).where(*active, Song.musical_key.is_(None))) or 0,
        missing_genre=db.scalar(select(func.count()).select_from(Song).where(*active, Song.genre_id.is_(None))) or 0,
        missing_artwork=total,
        top_genres=pairs(db.execute(select(func.coalesce(Genre.name, "Unassigned"), func.count()).select_from(Song).outerjoin(Genre).where(*active).group_by(Genre.name).order_by(func.count().desc()).limit(6)).all()),
        top_artists=pairs(db.execute(select(func.coalesce(Artist.name, "Unknown"), func.count()).select_from(Song).outerjoin(Artist).where(*active).group_by(Artist.name).order_by(func.count().desc()).limit(6)).all()),
        source_breakdown=pairs(db.execute(select(Source.type, func.count(func.distinct(Song.id))).select_from(Song).join(song_sources).join(Source).where(*active).group_by(Source.type)).all()),
        energy_distribution=pairs(db.execute(select(func.coalesce(Song.energy_level, 0), func.count()).where(*active).group_by(Song.energy_level).order_by(Song.energy_level)).all()),
        rating_distribution=pairs(db.execute(select(func.coalesce(Song.rating, 0), func.count()).where(*active).group_by(Song.rating).order_by(Song.rating)).all()),
        most_used_folders=pairs(db.execute(select(Folder.name, func.count(Song.id)).select_from(Folder).outerjoin(Folder.songs).group_by(Folder.id).order_by(func.count(Song.id).desc()).limit(6)).all()),
        most_used_crates=pairs(db.execute(select(Crate.name, func.count(crate_songs.c.song_id)).select_from(Crate).outerjoin(crate_songs).group_by(Crate.id).order_by(func.count(crate_songs.c.song_id).desc()).limit(6)).all()),
        playlist_count=db.scalar(select(func.count()).select_from(Playlist)) or 0,
        event_count=db.scalar(select(func.count()).select_from(Event)) or 0,
    )
