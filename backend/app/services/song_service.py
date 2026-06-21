from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Album, Artist, Genre, Song, Source, SourceType, song_folders, song_sources
from app.schemas.common import SongUpdate, SongWrite


def normalize_text(value: str | None) -> str | None:
    cleaned = value.strip() if value else None
    return cleaned or None


def get_or_create_named(db: Session, model: type, value: str | None, field: str = "name"):
    cleaned = normalize_text(value)
    if not cleaned:
        return None
    existing = db.scalar(select(model).where(getattr(model, field) == cleaned))
    if existing:
        return existing
    created = model(**{field: cleaned})
    db.add(created)
    db.flush()
    return created


def source_type_from_value(value: str | None) -> SourceType:
    if not value:
        return SourceType.manual
    try:
        return SourceType(value)
    except ValueError:
        return SourceType.other


def attach_source(db: Session, song: Song, source_type: str | None, source_url: str | None) -> None:
    source_enum = source_type_from_value(source_type)
    url = normalize_text(source_url)
    if source_enum == SourceType.local and url:
        url = Path(url).expanduser().resolve(strict=False).as_posix()
    source_name = f"{source_enum.value.title()} Source"
    existing = db.scalar(
        select(Source).where(
            Source.type == source_enum,
            Source.url == url,
            Source.name == source_name,
        )
    )
    source = existing or Source(name=source_name, type=source_enum, url=url)
    if not existing:
        db.add(source)
        db.flush()
    if source not in song.sources:
        song.sources.append(source)


def apply_song_payload(db: Session, song: Song, payload: SongWrite | SongUpdate) -> Song:
    data = payload.model_dump(exclude_unset=True)
    if "title" in data and normalize_text(data["title"]):
        song.title = normalize_text(data["title"]) or song.title
    if "artist_name" in data:
        song.artist = get_or_create_named(db, Artist, data["artist_name"])
    if "album_name" in data:
        song.album = get_or_create_named(db, Album, data["album_name"], field="title")
    if "genre_name" in data:
        song.genre = get_or_create_named(db, Genre, data["genre_name"])

    for field in ["duration_seconds", "bpm", "musical_key", "energy_level", "rating", "notes", "compatibility_note"]:
        if field in data:
            setattr(song, field, data[field])
    if "is_liked" in data and data["is_liked"] is not None:
        song.is_liked = bool(data["is_liked"])
    if "source_type" in data or "source_url" in data:
        attach_source(db, song, data.get("source_type"), data.get("source_url"))
    return song


def song_with_relations_query():
    return select(Song).options(
        selectinload(Song.artist),
        selectinload(Song.album),
        selectinload(Song.genre),
        selectinload(Song.sources),
        selectinload(Song.folders),
    )


def filter_songs(
    statement,
    *,
    search: str | None = None,
    source_type: str | None = None,
    genre_id: int | None = None,
    folder_id: int | None = None,
    liked: bool | None = None,
    missing_bpm: bool = False,
    missing_key: bool = False,
    missing_genre: bool = False,
    include_rejected: bool = False,
):
    if not include_rejected:
        statement = statement.where(Song.is_active.is_(True), Song.is_rejected.is_(False))
    if search:
        like_value = f"%{search.strip()}%"
        statement = statement.outerjoin(Artist).where((Song.title.ilike(like_value)) | (Artist.name.ilike(like_value)))
    if source_type:
        statement = statement.join(song_sources, Song.id == song_sources.c.song_id).join(Source).where(Source.type == source_type_from_value(source_type))
    if genre_id:
        statement = statement.where(Song.genre_id == genre_id)
    if folder_id:
        statement = statement.join(song_folders, Song.id == song_folders.c.song_id).where(song_folders.c.folder_id == folder_id)
    if liked is not None:
        statement = statement.where(Song.is_liked.is_(liked))
    if missing_bpm:
        statement = statement.where(Song.bpm.is_(None))
    if missing_key:
        statement = statement.where(Song.musical_key.is_(None))
    if missing_genre:
        statement = statement.where(Song.genre_id.is_(None))
    return statement.order_by(Song.created_at.desc(), Song.id.desc())
