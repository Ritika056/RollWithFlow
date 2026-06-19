from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_active_user
from app.core.database import get_db
from app.models import User
from app.schemas.common import (
    ProviderSearchRequest,
    ProviderSearchResponse,
    ProviderStatusRead,
    SpotifyConnectResponse,
    SpotifyProviderStatus,
    YouTubeProviderStatus,
)
from app.services import spotify_client, youtube_client


router = APIRouter(prefix="/api/providers", tags=["providers"])


@router.get("/status", response_model=ProviderStatusRead)
def provider_status(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)) -> ProviderStatusRead:
    return ProviderStatusRead(
        spotify=SpotifyProviderStatus(configured=spotify_client.is_configured(), connected=spotify_client.is_connected(db, current_user.id)),
        youtube=YouTubeProviderStatus(configured=youtube_client.is_configured()),
    )


@router.get("/spotify/status", response_model=SpotifyProviderStatus)
def spotify_status(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)) -> SpotifyProviderStatus:
    return SpotifyProviderStatus(configured=spotify_client.is_configured(), connected=spotify_client.is_connected(db, current_user.id))


@router.get("/spotify/connect", response_model=SpotifyConnectResponse)
def spotify_connect(current_user: User = Depends(get_current_active_user)) -> SpotifyConnectResponse:
    try:
        return SpotifyConnectResponse(authorization_url=spotify_client.authorization_url(current_user.id))
    except spotify_client.SpotifyProviderError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@router.get("/spotify/callback", response_class=HTMLResponse)
def spotify_callback(
    code: str | None = Query(default=None),
    state: str | None = Query(default=None),
    error: str | None = Query(default=None),
    error_description: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> HTMLResponse:
    if error:
        message = error_description or error
        return HTMLResponse(_callback_page("Spotify connection was cancelled", message), status_code=400)
    if not code or not state:
        return HTMLResponse(_callback_page("Spotify connection failed", "Spotify did not return an authorization code."), status_code=400)
    try:
        spotify_client.connect_callback(db, code, state)
    except spotify_client.SpotifyProviderError as error:
        return HTMLResponse(_callback_page("Spotify connection failed", str(error)), status_code=400)
    return HTMLResponse(_callback_page("Spotify connected", "You can return to RollWithFlow Discovery and search Spotify."))


@router.post("/spotify/search", response_model=ProviderSearchResponse)
def spotify_search(payload: ProviderSearchRequest, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)) -> ProviderSearchResponse:
    try:
        return ProviderSearchResponse(provider="spotify", results=spotify_client.search_tracks(db, current_user.id, payload.query, payload.limit))
    except spotify_client.SpotifyProviderError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@router.post("/youtube/search", response_model=ProviderSearchResponse)
def youtube_search(payload: ProviderSearchRequest, current_user: User = Depends(get_current_active_user)) -> ProviderSearchResponse:
    try:
        return ProviderSearchResponse(provider="youtube", results=youtube_client.search_videos(payload.query, payload.limit))
    except youtube_client.YouTubeProviderError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


def _callback_page(title: str, detail: str) -> str:
    return f"""<!doctype html><html><head><title>RollWithFlow</title></head><body style='font-family:system-ui;background:#080a19;color:#fff;padding:48px;line-height:1.5'><h1>{title}</h1><p>{detail}</p><p>You may close this window and return to RollWithFlow.</p></body></html>"""
