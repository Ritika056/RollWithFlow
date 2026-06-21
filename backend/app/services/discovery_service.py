from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import DiscoveryFetchRun, DiscoveryItem, DiscoveryMonitor, DiscoveryType, Song, SourceType
from app.schemas.common import DiscoveryItemWrite, ProviderSearchItem, SongWrite
from app.services.song_service import apply_song_payload
from app.services import spotify_client, youtube_client


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


def run_local_daily_discovery_fetch(db: Session, user_id: int, provider: str | None = None, run_type: str = "local_daily") -> list[DiscoveryFetchRun]:
    statement = select(DiscoveryMonitor).where(DiscoveryMonitor.is_active.is_(True))
    if provider:
        statement = statement.where(DiscoveryMonitor.provider == provider)
    monitors = list(db.scalars(statement.order_by(DiscoveryMonitor.id)).all())
    if not monitors:
        return [_finish_run(db, DiscoveryFetchRun(provider=provider or "mock", run_type=run_type, status="skipped", error_message="No active discovery monitors."))]

    grouped: dict[str, list[DiscoveryMonitor]] = {}
    for monitor in monitors:
        grouped.setdefault(monitor.provider, []).append(monitor)
    return [_run_provider_monitors(db, user_id, name, entries, run_type) for name, entries in grouped.items()]


def _run_provider_monitors(db: Session, user_id: int, provider: str, monitors: list[DiscoveryMonitor], run_type: str) -> DiscoveryFetchRun:
    run = DiscoveryFetchRun(provider=provider, run_type=run_type, status="success", metadata_json={"monitor_ids": [monitor.id for monitor in monitors]})
    db.add(run)
    db.flush()
    found = saved = 0
    errors: list[str] = []
    if provider not in {"mock", "spotify", "youtube"}:
        return _finish_run(db, run, status="skipped", error_message=f"Unsupported provider: {provider}")
    if provider == "spotify" and (not spotify_client.is_configured() or not spotify_client.is_connected(db, user_id)):
        return _finish_run(db, run, status="skipped", error_message="Spotify is not configured or connected locally.")
    if provider == "youtube" and not youtube_client.is_configured():
        return _finish_run(db, run, status="skipped", error_message="YouTube API key is not configured locally.")

    for monitor in monitors:
        try:
            results = _monitor_results(db, user_id, provider, monitor)
            found += len(results)
            for result in results:
                if _save_provider_item_once(db, result, monitor):
                    saved += 1
        except (spotify_client.SpotifyProviderError, youtube_client.YouTubeProviderError) as error:
            errors.append(f"{monitor.name}: {error}")
    status = "partial" if errors and found else "failed" if errors else "success"
    return _finish_run(db, run, status=status, items_found=found, items_saved=saved, error_message=" | ".join(errors) or None)


def _monitor_results(db: Session, user_id: int, provider: str, monitor: DiscoveryMonitor) -> list[ProviderSearchItem]:
    query = monitor.query or monitor.artist_name or monitor.genre or ("latest music" if monitor.monitor_type == "latest" else "trending music")
    if provider == "spotify":
        return spotify_client.search_tracks(db, user_id, query, 10)
    if provider == "youtube":
        return youtube_client.search_videos(query, 10)
    return [
        ProviderSearchItem(
            title=f"Mock {monitor.name}",
            artist_name=monitor.artist_name or "Local Discovery Monitor",
            platform="mock",
            source_url=f"mock://monitor/{monitor.id}",
            discovery_type="manual_search",
            popularity_score=50.0,
            metadata_json={"monitor_id": monitor.id, "monitor_type": monitor.monitor_type},
        )
    ]


def _save_provider_item_once(db: Session, result: ProviderSearchItem, monitor: DiscoveryMonitor) -> bool:
    statement = select(DiscoveryItem).where(DiscoveryItem.platform == result.platform)
    if result.source_url:
        statement = statement.where(DiscoveryItem.source_url == result.source_url)
    else:
        statement = statement.where(DiscoveryItem.title == result.title, DiscoveryItem.artist_name == result.artist_name)
    if db.scalar(statement):
        return False
    item = DiscoveryItem(
        title=result.title,
        artist_name=result.artist_name,
        platform=result.platform,
        source_url=result.source_url,
        thumbnail_url=result.thumbnail_url,
        discovery_type=discovery_type(result.discovery_type),
        popularity_score=result.popularity_score,
        fetched_at=datetime.now(UTC),
        is_saved=False,
        is_rejected=False,
        metadata_json={**(result.metadata_json or {}), "monitor_id": monitor.id},
    )
    db.add(item)
    return True


def _finish_run(
    db: Session,
    run: DiscoveryFetchRun,
    status: str | None = None,
    items_found: int | None = None,
    items_saved: int | None = None,
    error_message: str | None = None,
) -> DiscoveryFetchRun:
    if status:
        run.status = status
    if items_found is not None:
        run.items_found = items_found
    if items_saved is not None:
        run.items_saved = items_saved
    if error_message is not None:
        run.error_message = error_message
    run.finished_at = datetime.now(UTC)
    db.commit()
    db.refresh(run)
    return run
