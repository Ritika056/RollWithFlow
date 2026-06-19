from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Song, Source, SourceType
from app.schemas.common import LibraryScanResult


AUDIO_EXTENSIONS = {".mp3", ".wav", ".flac", ".m4a", ".aiff"}
MAX_REPORTED_ERRORS = 25


def scan_local_library(db: Session, folder_path: str) -> LibraryScanResult:
    root = Path(folder_path).expanduser()
    try:
        root = root.resolve(strict=True)
    except FileNotFoundError as error:
        raise ValueError("The folder path does not exist.") from error
    if not root.is_dir():
        raise ValueError("The supplied path is not a folder.")

    scanned_count = created_count = skipped_count = 0
    errors: list[str] = []
    try:
        for file_path in root.rglob("*"):
            if not file_path.is_file() or file_path.suffix.lower() not in AUDIO_EXTENSIONS:
                continue
            scanned_count += 1
            normalized_path = file_path.resolve().as_posix()
            existing_source = db.scalar(select(Source).where(Source.type == SourceType.local, Source.url == normalized_path))
            if existing_source:
                skipped_count += 1
                continue
            try:
                song = Song(title=file_path.stem.replace("_", " ").strip() or file_path.name, is_active=True, is_rejected=False)
                source = Source(name=file_path.name, type=SourceType.local, url=normalized_path, metadata_json={"file_path": normalized_path, "extension": file_path.suffix.lower()})
                song.sources.append(source)
                db.add(song)
                db.commit()
                created_count += 1
            except Exception as error:  # Keep scanning remaining files when one record cannot be created.
                db.rollback()
                skipped_count += 1
                if len(errors) < MAX_REPORTED_ERRORS:
                    errors.append(f"{file_path.name}: {error}")
    except OSError as error:
        errors.append(f"Could not scan folder: {error}")

    return LibraryScanResult(scanned_count=scanned_count, created_count=created_count, skipped_count=skipped_count, errors=errors)
