import enum
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.associations import crate_songs, playlist_songs, song_folders, song_sources, song_tags
from app.models.base import TimestampMixin


class SourceType(str, enum.Enum):
    local = "local"
    spotify = "spotify"
    youtube = "youtube"
    soundcloud = "soundcloud"
    beatport = "beatport"
    manual = "manual"
    other = "other"


class DiscoveryType(str, enum.Enum):
    manual_search = "manual_search"
    trending = "trending"
    latest = "latest"
    artist_monitoring = "artist_monitoring"
    genre_monitoring = "genre_monitoring"
    daily_fetch = "daily_fetch"


class Artist(TimestampMixin, Base):
    __tablename__ = "artists"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)

    songs: Mapped[list["Song"]] = relationship(back_populates="artist")


class Album(TimestampMixin, Base):
    __tablename__ = "albums"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)

    songs: Mapped[list["Song"]] = relationship(back_populates="album")


class Genre(TimestampMixin, Base):
    __tablename__ = "genres"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)

    songs: Mapped[list["Song"]] = relationship(back_populates="genre")
    mixes: Mapped[list["Mix"]] = relationship(back_populates="genre")


class Source(TimestampMixin, Base):
    __tablename__ = "sources"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[SourceType] = mapped_column(Enum(SourceType), default=SourceType.manual, nullable=False)
    external_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    url: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)

    songs: Mapped[list["Song"]] = relationship(
        secondary=song_sources,
        back_populates="sources",
    )


class Folder(TimestampMixin, Base):
    __tablename__ = "folders"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(180), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    songs: Mapped[list["Song"]] = relationship(
        secondary=song_folders,
        back_populates="folders",
    )


class Playlist(TimestampMixin, Base):
    __tablename__ = "playlists"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(180), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    event_type: Mapped[str | None] = mapped_column(String(120), nullable=True)
    mood: Mapped[str | None] = mapped_column(String(120), nullable=True)

    songs: Mapped[list["Song"]] = relationship(
        secondary=playlist_songs,
        back_populates="playlists",
    )


class Crate(TimestampMixin, Base):
    __tablename__ = "crates"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(180), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    energy_level: Mapped[int | None] = mapped_column(Integer, nullable=True)
    mood: Mapped[str | None] = mapped_column(String(120), nullable=True)

    songs: Mapped[list["Song"]] = relationship(
        secondary=crate_songs,
        back_populates="crates",
    )


class Tag(TimestampMixin, Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)

    songs: Mapped[list["Song"]] = relationship(
        secondary=song_tags,
        back_populates="tags",
    )


class Song(TimestampMixin, Base):
    __tablename__ = "songs"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    artist_id: Mapped[int | None] = mapped_column(ForeignKey("artists.id"), nullable=True)
    album_id: Mapped[int | None] = mapped_column(ForeignKey("albums.id"), nullable=True)
    genre_id: Mapped[int | None] = mapped_column(ForeignKey("genres.id"), nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bpm: Mapped[float | None] = mapped_column(Float, nullable=True)
    musical_key: Mapped[str | None] = mapped_column(String(32), nullable=True)
    energy_level: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    compatibility_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    detected_bpm: Mapped[float | None] = mapped_column(Float, nullable=True)
    detected_key: Mapped[str | None] = mapped_column(String(32), nullable=True)
    cue_points_json: Mapped[list[dict[str, Any]] | None] = mapped_column(JSON, nullable=True)
    loop_points_json: Mapped[list[dict[str, Any]] | None] = mapped_column(JSON, nullable=True)
    waveform_status: Mapped[str | None] = mapped_column(String(32), nullable=True)
    analysis_status: Mapped[str | None] = mapped_column(String(32), nullable=True)
    analysis_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_liked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_rejected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    artist: Mapped[Artist | None] = relationship(back_populates="songs")
    album: Mapped[Album | None] = relationship(back_populates="songs")
    genre: Mapped[Genre | None] = relationship(back_populates="songs")
    folders: Mapped[list[Folder]] = relationship(secondary=song_folders, back_populates="songs")
    playlists: Mapped[list[Playlist]] = relationship(secondary=playlist_songs, back_populates="songs")
    crates: Mapped[list[Crate]] = relationship(secondary=crate_songs, back_populates="songs")
    tags: Mapped[list[Tag]] = relationship(secondary=song_tags, back_populates="songs")
    sources: Mapped[list[Source]] = relationship(secondary=song_sources, back_populates="songs")


class Mix(TimestampMixin, Base):
    __tablename__ = "mixes"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    genre_id: Mapped[int | None] = mapped_column(ForeignKey("genres.id"), nullable=True)
    mood: Mapped[str | None] = mapped_column(String(120), nullable=True)
    event_type: Mapped[str | None] = mapped_column(String(120), nullable=True)
    bpm_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bpm_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    musical_key: Mapped[str | None] = mapped_column(String(32), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    tracklist_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    genre: Mapped[Genre | None] = relationship(back_populates="mixes")
    song_links: Mapped[list["MixSong"]] = relationship(back_populates="mix", cascade="all, delete-orphan", order_by="MixSong.position")


class MixSong(TimestampMixin, Base):
    __tablename__ = "mix_songs"
    id: Mapped[int] = mapped_column(primary_key=True)
    mix_id: Mapped[int] = mapped_column(ForeignKey("mixes.id", ondelete="CASCADE"), index=True)
    song_id: Mapped[int] = mapped_column(ForeignKey("songs.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    cue_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    transition_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    mix: Mapped[Mix] = relationship(back_populates="song_links")
    song: Mapped[Song] = relationship()


class Event(TimestampMixin, Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    event_type: Mapped[str | None] = mapped_column(String(120), nullable=True)
    event_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    venue: Mapped[str | None] = mapped_column(String(255), nullable=True)
    client_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    expected_guests: Mapped[int | None] = mapped_column(Integer, nullable=True)
    mood: Mapped[str | None] = mapped_column(String(120), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    readiness_percent: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    timeline_items: Mapped[list["EventTimelineItem"]] = relationship(back_populates="event", cascade="all, delete-orphan", order_by="EventTimelineItem.sort_order")
    checklist_items: Mapped[list["EventChecklistItem"]] = relationship(back_populates="event", cascade="all, delete-orphan", order_by="EventChecklistItem.sort_order")
    music_links: Mapped[list["EventMusicLink"]] = relationship(back_populates="event", cascade="all, delete-orphan")


class EventTimelineItem(TimestampMixin, Base):
    __tablename__ = "event_timeline_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    start_time: Mapped[str | None] = mapped_column(String(32), nullable=True)
    end_time: Mapped[str | None] = mapped_column(String(32), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    playlist_id: Mapped[int | None] = mapped_column(ForeignKey("playlists.id", ondelete="SET NULL"), nullable=True)
    crate_id: Mapped[int | None] = mapped_column(ForeignKey("crates.id", ondelete="SET NULL"), nullable=True)
    event: Mapped[Event] = relationship(back_populates="timeline_items")


class EventChecklistItem(TimestampMixin, Base):
    __tablename__ = "event_checklist_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str | None] = mapped_column(String(120), nullable=True)
    is_done: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    event: Mapped[Event] = relationship(back_populates="checklist_items")


class EventMusicLink(TimestampMixin, Base):
    __tablename__ = "event_music_links"
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), index=True)
    playlist_id: Mapped[int | None] = mapped_column(ForeignKey("playlists.id", ondelete="SET NULL"), nullable=True)
    crate_id: Mapped[int | None] = mapped_column(ForeignKey("crates.id", ondelete="SET NULL"), nullable=True)
    mix_id: Mapped[int | None] = mapped_column(ForeignKey("mixes.id", ondelete="SET NULL"), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    event: Mapped[Event] = relationship(back_populates="music_links")


class DiscoveryItem(TimestampMixin, Base):
    __tablename__ = "discovery_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    artist_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    platform: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    source_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    discovery_type: Mapped[DiscoveryType] = mapped_column(Enum(DiscoveryType), default=DiscoveryType.manual_search, nullable=False)
    popularity_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    fetched_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    is_saved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_rejected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    metadata_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)


class DiscoveryMonitor(TimestampMixin, Base):
    __tablename__ = "discovery_monitors"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    provider: Mapped[str] = mapped_column(String(80), index=True, nullable=False, default="mock")
    monitor_type: Mapped[str] = mapped_column(String(80), nullable=False, default="query")
    query: Mapped[str | None] = mapped_column(String(255), nullable=True)
    genre: Mapped[str | None] = mapped_column(String(120), nullable=True)
    artist_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class DiscoveryFetchRun(Base):
    __tablename__ = "discovery_fetch_runs"

    id: Mapped[int] = mapped_column(primary_key=True)
    provider: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    run_type: Mapped[str] = mapped_column(String(80), nullable=False)
    status: Mapped[str] = mapped_column(String(80), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    items_found: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    items_saved: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
