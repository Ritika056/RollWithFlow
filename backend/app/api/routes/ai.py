from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Song, SourceType
from app.services.song_service import song_with_relations_query
from app.core.config import get_settings

router = APIRouter(prefix="/api/ai", tags=["ai"])

class MockRequest(BaseModel): query: str = ""; count: int = 8; playable_only: bool = False

def suggestions(db: Session, request: MockRequest):
    words = [word.lower() for word in request.query.split() if len(word) > 2]
    songs = list(db.scalars(song_with_relations_query().where(Song.is_active.is_(True), Song.is_rejected.is_(False))).unique().all())
    def score(song):
        haystack = " ".join([song.title, song.artist.name if song.artist else "", song.genre.name if song.genre else "", song.notes or ""]).lower()
        local = any(source.type == SourceType.local and source.url for source in song.sources)
        return (20 if song.is_liked else 0) + (10 if local else 0) + (song.rating or 0) * 2 + sum(5 for word in words if word in haystack)
    filtered = [song for song in songs if not request.playable_only or any(source.type == SourceType.local and source.url for source in song.sources)]
    return [{"song_id": song.id, "title": song.title, "artist": song.artist.name if song.artist else None, "reason": "Liked and playable locally" if song.is_liked else "Matches your library metadata"} for song in sorted(filtered, key=score, reverse=True)[:max(1, min(request.count, 20))]]

@router.get("/status")
def status():
    settings = get_settings()
    configured = bool(settings.ai_api_key and settings.ai_provider.lower() not in {"", "mock", "local"})
    return {"status": "provider_configured" if configured else "mock_ready", "real_ai": False, "provider": settings.ai_provider, "message": "AI is running in local mock mode." if not configured else "External AI calls are not enabled by this local build."}

@router.post("/mock-search")
def mock_search(payload: MockRequest, db: Session = Depends(get_db)): return {"results": suggestions(db, payload)}

@router.post("/mock-playlist")
def mock_playlist(payload: MockRequest, db: Session = Depends(get_db)): return {"title": "Mock DJ set", "tracks": suggestions(db, payload)}

@router.post("/feedback")
def feedback(): return {"status": "recorded_locally", "note": "Feedback storage is a future AI integration step."}
