from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Table, Text

from app.core.database import Base


song_folders = Table(
    "song_folders",
    Base.metadata,
    Column("song_id", ForeignKey("songs.id", ondelete="CASCADE"), primary_key=True),
    Column("folder_id", ForeignKey("folders.id", ondelete="CASCADE"), primary_key=True),
)

playlist_songs = Table(
    "playlist_songs",
    Base.metadata,
    Column("playlist_id", ForeignKey("playlists.id", ondelete="CASCADE"), primary_key=True),
    Column("song_id", ForeignKey("songs.id", ondelete="CASCADE"), primary_key=True),
    Column("position", Integer, nullable=True),
    Column("cue_note", Text, nullable=True),
    Column("transition_note", Text, nullable=True),
    Column("must_play", Boolean, default=False, nullable=False),
    Column("optional", Boolean, default=False, nullable=False),
)

crate_songs = Table(
    "crate_songs",
    Base.metadata,
    Column("crate_id", ForeignKey("crates.id", ondelete="CASCADE"), primary_key=True),
    Column("song_id", ForeignKey("songs.id", ondelete="CASCADE"), primary_key=True),
)

song_tags = Table(
    "song_tags",
    Base.metadata,
    Column("song_id", ForeignKey("songs.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

song_sources = Table(
    "song_sources",
    Base.metadata,
    Column("song_id", ForeignKey("songs.id", ondelete="CASCADE"), primary_key=True),
    Column("source_id", ForeignKey("sources.id", ondelete="CASCADE"), primary_key=True),
)
