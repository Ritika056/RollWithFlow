from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, init_db
from app.models import (
    Album,
    Artist,
    Crate,
    DiscoveryItem,
    DiscoveryType,
    Folder,
    Genre,
    Mix,
    Playlist,
    Song,
    Source,
    SourceType,
    Tag,
)


def get_or_create(db: Session, model: type, defaults: dict | None = None, **lookup):
    instance = db.scalar(select(model).filter_by(**lookup))
    if instance:
        for key, value in (defaults or {}).items():
            if getattr(instance, key, None) in (None, "", False):
                setattr(instance, key, value)
        return instance

    instance = model(**{**lookup, **(defaults or {})})
    db.add(instance)
    db.flush()
    return instance


def attach_once(collection: list, item) -> None:
    if item not in collection:
        collection.append(item)


def seed() -> None:
    init_db()
    db = SessionLocal()
    try:
        genres = {
            name: get_or_create(db, Genre, name=name)
            for name in ["Afro House", "Tech House", "Bollywood", "Punjabi", "Deep House", "Hip-Hop", "Disco"]
        }
        artists = {
            name: get_or_create(db, Artist, name=name)
            for name in [
                "Rampa",
                "FISHER",
                "Nucleya",
                "Peggy Gou",
                "Black Coffee",
                "Diljit Dosanjh",
                "Disclosure",
                "Kaytranada",
                "Anish Sood",
                "Purple Disco Machine",
            ]
        }
        albums = {
            title: get_or_create(db, Album, title=title)
            for title in ["RollWithFlow Demo Cuts", "Club Notes", "Wedding Prep", "Late Night References"]
        }
        sources = {
            source_type.value: get_or_create(
                db,
                Source,
                name=f"{source_type.value.title()} Phase 2",
                type=source_type,
                defaults={"metadata_json": {"phase": 2}},
            )
            for source_type in [SourceType.local, SourceType.spotify, SourceType.youtube, SourceType.manual]
        }

        folders = {
            "Liked Songs": get_or_create(
                db,
                Folder,
                name="Liked Songs",
                defaults={"description": "Pinned collection for intentionally liked tracks.", "is_pinned": True},
            ),
            "Wedding Warmup": get_or_create(db, Folder, name="Wedding Warmup", defaults={"description": "Safe openers and family-friendly grooves."}),
            "Club References": get_or_create(db, Folder, name="Club References", defaults={"description": "High-energy tracks and references for club nights."}),
            "Afro House Pool": get_or_create(db, Folder, name="Afro House Pool", defaults={"description": "Rolling afro house ideas for future sets."}),
            "Metadata Cleanup": get_or_create(db, Folder, name="Metadata Cleanup", defaults={"description": "Songs that need BPM, key, or genre cleanup."}),
        }
        folders["Liked Songs"].is_pinned = True

        peak_playlist = get_or_create(
            db,
            Playlist,
            name="Phase 1 Demo Set",
            defaults={"description": "Small sample set used to verify playlist foundations.", "event_type": "Demo", "mood": "Focused"},
        )
        get_or_create(
            db,
            Playlist,
            name="Wedding Entry Ideas",
            defaults={"description": "Placeholder playlist for Phase 3 planning.", "event_type": "Wedding", "mood": "Celebratory"},
        )
        peak_crate = get_or_create(
            db,
            Crate,
            name="Peak Time",
            defaults={"description": "High-energy pool for later DJ set preparation.", "energy_level": 9, "mood": "Driving"},
        )
        warmup_crate = get_or_create(
            db,
            Crate,
            name="Warmup",
            defaults={"description": "Lower-pressure tracks for opening sections.", "energy_level": 5, "mood": "Groovy"},
        )

        song_specs = [
            ("Demo Groove One", "Rampa", "RollWithFlow Demo Cuts", "Afro House", 382, 122, "8A", 7, 4, True, "local", ["Liked Songs", "Afro House Pool"]),
            ("Warehouse Pulse", "FISHER", "Club Notes", "Tech House", 315, 125, "9A", 9, 5, True, "manual", ["Liked Songs", "Club References"]),
            ("Late Night Baarish", "Nucleya", "Wedding Prep", "Bollywood", 286, None, None, 6, 3, False, "youtube", ["Wedding Warmup", "Metadata Cleanup"]),
            ("Sunrise Tabla Drift", "Black Coffee", "Late Night References", "Afro House", 356, 120, "7A", 6, 4, True, "spotify", ["Liked Songs", "Afro House Pool"]),
            ("Peak Signal", "Disclosure", "Club Notes", "Deep House", 301, 124, "10A", 8, 4, False, "local", ["Club References"]),
            ("Punjabi Spark", "Diljit Dosanjh", "Wedding Prep", "Punjabi", 248, 96, None, 8, 5, True, "spotify", ["Liked Songs", "Wedding Warmup", "Metadata Cleanup"]),
            ("Metro Bounce", "Kaytranada", "Club Notes", "Hip-Hop", 214, 108, "5A", 7, 4, False, "youtube", ["Club References"]),
            ("Velvet Strobe", "Peggy Gou", "Late Night References", "Tech House", 332, 126, "6A", 8, 5, True, "spotify", ["Liked Songs", "Club References"]),
            ("Garden Afterhours", "Anish Sood", "Late Night References", "Deep House", 289, None, "4A", 5, 3, False, "manual", ["Metadata Cleanup"]),
            ("Mirrorball Run", "Purple Disco Machine", "Club Notes", "Disco", 276, 118, "11A", 7, 4, False, "local", ["Wedding Warmup"]),
            ("Monsoon Lift", "Rampa", "Late Night References", "Afro House", 344, 121, "8A", 7, 4, False, "youtube", ["Afro House Pool"]),
            ("Bassline RSVP", "FISHER", "Club Notes", "Tech House", 298, 126, None, 9, 4, False, "spotify", ["Club References", "Metadata Cleanup"]),
            ("Family Floor Starter", "Diljit Dosanjh", "Wedding Prep", "Punjabi", 239, 101, "2A", 6, 4, True, "manual", ["Liked Songs", "Wedding Warmup"]),
            ("No Genre Reference", "Peggy Gou", "Late Night References", None, 267, 123, "3A", 6, 3, False, "youtube", ["Metadata Cleanup"]),
            ("Local USB Test Cut", "Anish Sood", "RollWithFlow Demo Cuts", "Deep House", 312, 122, "7B", 6, 3, False, "local", []),
        ]

        for title, artist, album, genre, duration, bpm, key, energy, rating, liked, source_type, folder_names in song_specs:
            song = get_or_create(db, Song, title=title)
            song.artist = artists[artist]
            song.album = albums[album]
            song.genre = genres[genre] if genre else None
            song.duration_seconds = duration
            song.bpm = bpm
            song.musical_key = key
            song.energy_level = energy
            song.rating = rating
            song.is_liked = liked
            song.is_active = True
            song.is_rejected = False
            song.notes = song.notes or "Phase 2 sample library record."
            attach_once(song.sources, sources[source_type])
            for folder_name in folder_names:
                attach_once(folders[folder_name].songs, song)
            if liked:
                attach_once(folders["Liked Songs"].songs, song)
            attach_once(peak_playlist.songs, song)
            attach_once(peak_crate.songs if energy >= 8 else warmup_crate.songs, song)

        get_or_create(db, Tag, name="demo")
        get_or_create(
            db,
            Mix,
            title="Opening Hour Demo Mix",
            defaults={
                "genre": genres["Afro House"],
                "mood": "Warm",
                "event_type": "House Party",
                "bpm_min": 118,
                "bpm_max": 124,
                "musical_key": "8A",
                "notes": "Placeholder archive item for Phase 1.",
                "tracklist_text": "Demo Groove One\nLate Night Baarish",
            },
        )

        discovery_items = [
            ("Fresh Find Alpha", "Demo Artist", "spotify", DiscoveryType.manual_search, 72, True),
            ("Trending Reference Beta", "Sample Channel", "youtube", DiscoveryType.trending, 88, False),
            ("Latest Demo Release", "Future Monitor", "manual", DiscoveryType.latest, 61, False),
        ]
        for title, artist_name, platform, discovery_type, popularity, saved in discovery_items:
            item = get_or_create(db, DiscoveryItem, title=title, platform=platform)
            item.artist_name = artist_name
            item.discovery_type = discovery_type
            item.popularity_score = popularity
            item.fetched_at = item.fetched_at or datetime.now(UTC)
            item.is_saved = saved
            item.metadata_json = {"phase": 2, "seeded": True}

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
    print("RollWithFlow Phase 2 seed data is ready.")
