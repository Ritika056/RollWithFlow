from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import DiscoveryItem, DiscoveryType, Song, SourceType
from app.schemas.common import DiscoveryItemWrite, SongWrite
from app.services.song_service import apply_song_payload


def discovery_type(value: str) -> DiscoveryType:
    try:
        return DiscoveryType(value)
    except ValueError:
        return DiscoveryType.manual_search


def apply_discovery(item: DiscoveryItem, payload: DiscoveryItemWrite) -> DiscoveryItem:
    data = payload.model_dump()
    item.title = data["title"].strip()
    item.artist_name = data["artist_name"]
    item.platform = data["platform"]
    item.source_url = data["source_url"]
    item.thumbnail_url = data["thumbnail_url"]
    item.discovery_type = discovery_type(data["discovery_type"])
    item.popularity_score = data["popularity_score"]
    item.metadata_json = data["metadata_json"]
    return item


def save_discovery_to_library(db: Session, item: DiscoveryItem) -> Song:
    source_type = item.platform if item.platform in [source.value for source in SourceType] else "other"
    song = Song(title=item.title, is_active=True, is_rejected=False, is_liked=False)
    db.add(song)
    apply_song_payload(
        db,
        song,
        SongWrite(
            title=item.title,
            artist_name=item.artist_name,
            source_type=source_type,
            source_url=item.source_url,
            notes=f"Saved from discovery ({item.discovery_type.value}).",
        ),
    )
    item.is_saved = True
    db.flush()
    return song


def run_mock_daily_discovery_fetch(db: Session) -> list[DiscoveryItem]:
    specs = [
        ("Mock Sunrise Trend", "Daily Monitor", "spotify", DiscoveryType.trending, 84.0),
        ("Mock Latest Club Tool", "Release Radar", "youtube", DiscoveryType.latest, 76.0),
        ("Mock Genre Pulse", "Afro House Watch", "manual", DiscoveryType.genre_monitoring, 69.0),
    ]
    created: list[DiscoveryItem] = []
    for title, artist, platform, kind, score in specs:
        item = db.scalar(select(DiscoveryItem).where(DiscoveryItem.title == title, DiscoveryItem.platform == platform))
        if not item:
            item = DiscoveryItem(
                title=title,
                artist_name=artist,
                platform=platform,
                discovery_type=kind,
                popularity_score=score,
                fetched_at=datetime.now(UTC),
                metadata_json={"mock_daily_fetch": True},
            )
            db.add(item)
        created.append(item)
    db.commit()
    return created
