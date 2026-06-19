from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings


settings = get_settings()

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    future=True,
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    # Lightweight SQLite migrations for existing local databases.
    if settings.database_url.startswith("sqlite"):
        with engine.begin() as conn:
            def add_column_if_missing(table: str, column: str, ddl: str) -> None:
                columns = {row[1] for row in conn.execute(text(f"PRAGMA table_info({table})"))}
                if column not in columns:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {ddl}"))

            add_column_if_missing("songs", "compatibility_note", "compatibility_note TEXT")
            add_column_if_missing("playlist_songs", "cue_note", "cue_note TEXT")
            add_column_if_missing("playlist_songs", "transition_note", "transition_note TEXT")
            add_column_if_missing("playlist_songs", "must_play", "must_play BOOLEAN NOT NULL DEFAULT 0")
            add_column_if_missing("playlist_songs", "optional", "optional BOOLEAN NOT NULL DEFAULT 0")
