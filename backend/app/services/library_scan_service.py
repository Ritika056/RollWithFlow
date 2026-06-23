import hashlib
import os
import re
import shutil
import subprocess
from pathlib import Path

from fastapi import UploadFile

from mutagen import File as MutagenFile
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Album, Artist, Genre, Song, Source, SourceType
from app.schemas.common import AudioUploadResult, LibraryScanResult, LocalFileHealthResult, LocalFileMissingRead
from app.core.config import get_settings
from app.services.song_service import get_or_create_named


AUDIO_EXTENSIONS = {".mp3", ".wav", ".flac", ".m4a", ".aiff", ".aif"}
BROWSER_UNSUPPORTED_EXTENSIONS = {".aiff", ".aif"}
MAX_REPORTED_ERRORS = 25
UPLOAD_CHUNK_SIZE = 1024 * 1024
MAX_UPLOAD_BYTES = 500 * 1024 * 1024


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
                metadata = extract_local_metadata(file_path)
                song = Song(
                    title=metadata["title"] or file_path.stem.replace("_", " ").strip() or file_path.name,
                    duration_seconds=metadata["duration_seconds"],
                    is_active=True,
                    is_rejected=False,
                )
                song.artist = get_or_create_named(db, Artist, metadata["artist"] if isinstance(metadata["artist"], str) else None)
                song.album = get_or_create_named(db, Album, metadata["album"] if isinstance(metadata["album"], str) else None, field="title")
                song.genre = get_or_create_named(db, Genre, metadata["genre"] if isinstance(metadata["genre"], str) else None)
                source = Source(name=file_path.name, type=SourceType.local, url=normalized_path, metadata_json={"file_path": normalized_path, "extension": file_path.suffix.lower(), **metadata})
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


async def import_uploaded_audio(db: Session, files: list[UploadFile]) -> AudioUploadResult:
    upload_dir = get_settings().audio_upload_dir
    upload_dir.mkdir(parents=True, exist_ok=True)
    uploaded_count = created_count = skipped_count = 0
    errors: list[str] = []
    created_songs: list[Song] = []

    for upload in files:
        filename = Path(upload.filename or "audio").name
        extension = Path(filename).suffix.lower()
        if extension not in AUDIO_EXTENSIONS:
            skipped_count += 1
            if len(errors) < MAX_REPORTED_ERRORS:
                errors.append(f"{filename}: unsupported audio format")
            continue

        uploaded_count += 1
        temporary = upload_dir / f".{hashlib.sha256(filename.encode()).hexdigest()}.upload"
        digest = hashlib.sha256()
        total = 0
        try:
            with temporary.open("wb") as destination:
                while chunk := await upload.read(UPLOAD_CHUNK_SIZE):
                    total += len(chunk)
                    if total > MAX_UPLOAD_BYTES:
                        raise ValueError("file exceeds the 500 MB local import limit")
                    digest.update(chunk)
                    destination.write(chunk)
            file_hash = digest.hexdigest()
            existing = db.scalar(select(Source).where(Source.type == SourceType.local, Source.external_id == f"sha256:{file_hash}"))
            if existing:
                temporary.unlink(missing_ok=True)
                skipped_count += 1
                continue

            stem = re.sub(r"[^A-Za-z0-9_-]+", "-", Path(filename).stem).strip("-_") or "track"
            target = upload_dir / f"{stem[:80]}-{file_hash[:12]}{extension}"
            if target.exists():
                temporary.unlink(missing_ok=True)
                skipped_count += 1
                continue
            temporary.replace(target)
            playback_path, conversion_error = make_browser_playable_copy(target)
            metadata = extract_local_metadata(playback_path)
            song = Song(
                title=metadata["title"] or Path(filename).stem.replace("_", " ").strip() or filename,
                duration_seconds=metadata["duration_seconds"],
                is_active=True,
                is_rejected=False,
            )
            song.artist = get_or_create_named(db, Artist, metadata["artist"] if isinstance(metadata["artist"], str) else None)
            song.album = get_or_create_named(db, Album, metadata["album"] if isinstance(metadata["album"], str) else None, field="title")
            song.genre = get_or_create_named(db, Genre, metadata["genre"] if isinstance(metadata["genre"], str) else None)
            song.sources.append(Source(
                name=filename,
                type=SourceType.local,
                external_id=f"sha256:{file_hash}",
                url=playback_path.resolve().as_posix(),
                metadata_json={"managed_upload": True, "extension": playback_path.suffix.lower(), "original_path": target.resolve().as_posix(), "sha256": file_hash, "conversion_error": conversion_error, **metadata},
            ))
            db.add(song)
            db.commit()
            db.refresh(song)
            created_songs.append(song)
            created_count += 1
        except Exception as error:
            db.rollback()
            temporary.unlink(missing_ok=True)
            skipped_count += 1
            if len(errors) < MAX_REPORTED_ERRORS:
                errors.append(f"{filename}: {error}")
        finally:
            await upload.close()

    return AudioUploadResult(uploaded_count=uploaded_count, created_count=created_count, skipped_count=skipped_count, errors=errors, created_songs=created_songs)


def extract_local_metadata(file_path: Path) -> dict[str, str | int | None]:
    """Read lightweight tags for newly scanned files; invalid files keep filename fallback."""
    metadata: dict[str, str | int | None] = {"title": None, "artist": None, "album": None, "genre": None, "duration_seconds": None}
    try:
        audio = MutagenFile(file_path)
        if audio is None:
            return metadata
        if audio.info and audio.info.length:
            metadata["duration_seconds"] = max(1, round(audio.info.length))
        tagged_audio = MutagenFile(file_path, easy=True)
        tags = tagged_audio.tags if tagged_audio and tagged_audio.tags else {}
        for tag, key in (("title", "title"), ("artist", "artist"), ("album", "album"), ("genre", "genre")):
            values = tags.get(tag)
            if values:
                metadata[key] = str(values[0]).strip() or None
    except Exception:
        # Scanning must continue even when an individual file has unsupported tags.
        pass
    return metadata


def make_browser_playable_copy(file_path: Path) -> tuple[Path, str | None]:
    """Create a WAV playback copy for formats Chrome cannot decode, preserving the original upload."""
    if file_path.suffix.lower() not in BROWSER_UNSUPPORTED_EXTENSIONS:
        return file_path, None
    output = file_path.with_name(f"{file_path.stem}-playable.wav")
    if output.is_file():
        return output, None
    executable = ffmpeg_executable()
    if not executable:
        return file_path, "FFmpeg is unavailable; convert this AIFF file to WAV or MP3 for browser playback."
    try:
        subprocess.run(
            [executable, "-y", "-i", str(file_path), "-vn", "-c:a", "pcm_s16le", str(output)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=120,
        )
    except (OSError, subprocess.SubprocessError) as error:
        output.unlink(missing_ok=True)
        return file_path, f"Could not convert AIFF for browser playback: {error}"
    return output, None


def ffmpeg_executable() -> str | None:
    configured = get_settings().ffmpeg_path
    if configured and Path(configured).is_file():
        return configured
    found = shutil.which("ffmpeg")
    if found:
        return found
    local_app_data = os.environ.get("LOCALAPPDATA")
    if local_app_data:
        candidates = Path(local_app_data).glob("Microsoft/WinGet/Packages/Gyan.FFmpeg.Essentials_*/ffmpeg-*/bin/ffmpeg.exe")
        return next((str(candidate) for candidate in candidates if candidate.is_file()), None)
    return None


def resolve_local_file(source: Source) -> tuple[Path | None, str | None]:
    if not source.url:
        return None, "No local file is linked"
    try:
        path = Path(source.url).expanduser().resolve(strict=True)
    except (OSError, RuntimeError):
        return None, "Local file is missing or cannot be accessed"
    if not path.is_file():
        return None, "Local file is missing or cannot be accessed"
    if path.suffix.lower() not in AUDIO_EXTENSIONS:
        return None, "Local file format is unsupported"
    return path, None


def check_local_files(db: Session) -> LocalFileHealthResult:
    songs = list(db.scalars(select(Song).options(selectinload(Song.sources), selectinload(Song.artist)).where(Song.is_active.is_(True), Song.is_rejected.is_(False))).unique().all())
    checked = ok = errors = 0
    missing: list[LocalFileMissingRead] = []
    for song in songs:
        source = next((item for item in song.sources if item.type == SourceType.local), None)
        if not source:
            continue
        checked += 1
        _, error = resolve_local_file(source)
        if error:
            errors += 1
            missing.append(LocalFileMissingRead(id=song.id, title=song.title, artist_name=song.artist.name if song.artist else None, source_name=source.name, status=error))
        else:
            ok += 1
    return LocalFileHealthResult(checked_count=checked, ok_count=ok, missing_count=len(missing), error_count=errors, missing_songs=missing)


def apply_local_metadata(db: Session, song: Song, file_path: Path, overwrite: bool = False) -> None:
    metadata = extract_local_metadata(file_path)
    if metadata["duration_seconds"] and (overwrite or not song.duration_seconds):
        song.duration_seconds = int(metadata["duration_seconds"])
    if metadata["title"] and (overwrite or not song.title.strip()):
        song.title = str(metadata["title"])
    if metadata["artist"] and (overwrite or song.artist is None):
        song.artist = get_or_create_named(db, Artist, str(metadata["artist"]))
    if metadata["album"] and (overwrite or song.album is None):
        song.album = get_or_create_named(db, Album, str(metadata["album"]), field="title")
    if metadata["genre"] and (overwrite or song.genre is None):
        song.genre = get_or_create_named(db, Genre, str(metadata["genre"]))


def repair_local_path(db: Session, song: Song, new_file_path: str) -> Song:
    try:
        path = Path(new_file_path).expanduser().resolve(strict=True)
    except (OSError, RuntimeError):
        raise ValueError("The replacement local file does not exist.") from None
    if not path.is_file() or path.suffix.lower() not in AUDIO_EXTENSIONS:
        raise ValueError("The replacement file is not a supported audio format.")
    normalized_path = path.as_posix()
    duplicate = db.scalar(select(Source).where(Source.type == SourceType.local, Source.url == normalized_path))
    if duplicate and duplicate not in song.sources:
        raise ValueError("That local file is already linked to another song.")
    source = next((item for item in song.sources if item.type == SourceType.local), None)
    if not source:
        source = Source(name=path.name, type=SourceType.local, url=normalized_path)
        song.sources.append(source)
    else:
        source.name = path.name
        source.url = normalized_path
    source.metadata_json = {**(source.metadata_json or {}), "file_path": normalized_path, "extension": path.suffix.lower()}
    apply_local_metadata(db, song, path, overwrite=False)
    return song
