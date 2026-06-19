import base64
import hashlib
import hmac
import json
import secrets
from datetime import UTC, datetime, timedelta
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import ProviderConnection
from app.schemas.common import ProviderSearchItem


SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com"
SPOTIFY_API_URL = "https://api.spotify.com/v1"


class SpotifyProviderError(Exception):
    pass


def is_configured() -> bool:
    settings = get_settings()
    return bool(settings.spotify_client_id and settings.spotify_client_secret and settings.spotify_redirect_uri)


def is_connected(db: Session, user_id: int) -> bool:
    return bool(db.scalar(select(ProviderConnection.id).where(ProviderConnection.user_id == user_id, ProviderConnection.provider == "spotify")))


def authorization_url(user_id: int) -> str:
    _require_configuration()
    settings = get_settings()
    params = {
        "client_id": settings.spotify_client_id,
        "response_type": "code",
        "redirect_uri": settings.spotify_redirect_uri,
        "scope": "user-read-private",
        "state": _create_state(user_id),
    }
    return f"{SPOTIFY_ACCOUNTS_URL}/authorize?{urlencode(params)}"


def connect_callback(db: Session, code: str, state: str) -> None:
    user_id = _read_state(state)
    _require_configuration()
    settings = get_settings()
    response = _request_json(
        f"{SPOTIFY_ACCOUNTS_URL}/api/token",
        method="POST",
        data=urlencode({"grant_type": "authorization_code", "code": code, "redirect_uri": settings.spotify_redirect_uri}).encode(),
        headers={"Authorization": _basic_authorization(), "Content-Type": "application/x-www-form-urlencoded"},
    )
    _save_connection(db, user_id, response)


def search_tracks(db: Session, user_id: int, query: str, limit: int) -> list[ProviderSearchItem]:
    token = _access_token(db, user_id)
    payload = _request_json(
        f"{SPOTIFY_API_URL}/search?{urlencode({'q': query, 'type': 'track', 'limit': limit})}",
        headers={"Authorization": f"Bearer {token}"},
    )
    items: list[ProviderSearchItem] = []
    for track in payload.get("tracks", {}).get("items", []):
        album = track.get("album") or {}
        images = album.get("images") or []
        artists = track.get("artists") or []
        external_urls = track.get("external_urls") or {}
        items.append(
            ProviderSearchItem(
                title=track.get("name") or "Untitled Spotify track",
                artist_name=", ".join(artist.get("name", "") for artist in artists if artist.get("name")) or None,
                platform="spotify",
                source_url=external_urls.get("spotify"),
                thumbnail_url=images[0].get("url") if images else None,
                popularity_score=track.get("popularity"),
                metadata_json={
                    "spotify_id": track.get("id"),
                    "album_name": album.get("name"),
                    "duration_ms": track.get("duration_ms"),
                    "explicit": track.get("explicit"),
                },
            )
        )
    return items


def _access_token(db: Session, user_id: int) -> str:
    connection = db.scalar(select(ProviderConnection).where(ProviderConnection.user_id == user_id, ProviderConnection.provider == "spotify"))
    if not connection:
        raise SpotifyProviderError("Spotify is not connected. Connect Spotify before searching.")
    if connection.expires_at and connection.expires_at <= _database_now() + timedelta(seconds=30):
        if not connection.refresh_token:
            raise SpotifyProviderError("Spotify connection expired. Connect Spotify again.")
        response = _request_json(
            f"{SPOTIFY_ACCOUNTS_URL}/api/token",
            method="POST",
            data=urlencode({"grant_type": "refresh_token", "refresh_token": connection.refresh_token}).encode(),
            headers={"Authorization": _basic_authorization(), "Content-Type": "application/x-www-form-urlencoded"},
        )
        _save_connection(db, user_id, response, connection)
    return connection.access_token


def _save_connection(db: Session, user_id: int, payload: dict, connection: ProviderConnection | None = None) -> None:
    connection = connection or db.scalar(select(ProviderConnection).where(ProviderConnection.user_id == user_id, ProviderConnection.provider == "spotify"))
    if not connection:
        connection = ProviderConnection(user_id=user_id, provider="spotify", access_token="")
        db.add(connection)
    connection.access_token = payload["access_token"]
    connection.refresh_token = payload.get("refresh_token") or connection.refresh_token
    expires_in = int(payload.get("expires_in", 3600))
    connection.expires_at = _database_now() + timedelta(seconds=expires_in)
    db.commit()


def _require_configuration() -> None:
    if not is_configured():
        raise SpotifyProviderError("Spotify is not configured. Add SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REDIRECT_URI on the backend.")


def _create_state(user_id: int) -> str:
    payload = {"user_id": user_id, "exp": int((datetime.now(UTC) + timedelta(minutes=10)).timestamp()), "nonce": secrets.token_urlsafe(12)}
    encoded = _encode(json.dumps(payload, separators=(",", ":")).encode())
    signature = hmac.new(get_settings().secret_key.encode(), encoded.encode(), hashlib.sha256).digest()
    return f"{encoded}.{_encode(signature)}"


def _read_state(state: str) -> int:
    try:
        encoded, supplied_signature = state.split(".", 1)
        expected_signature = hmac.new(get_settings().secret_key.encode(), encoded.encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(expected_signature, _decode(supplied_signature)):
            raise ValueError
        payload = json.loads(_decode(encoded))
        if int(payload["exp"]) < int(datetime.now(UTC).timestamp()):
            raise ValueError
        return int(payload["user_id"])
    except (KeyError, TypeError, ValueError, json.JSONDecodeError):
        raise SpotifyProviderError("Spotify authorization state is invalid or expired. Start the connection again.") from None


def _basic_authorization() -> str:
    settings = get_settings()
    credentials = f"{settings.spotify_client_id}:{settings.spotify_client_secret}".encode()
    return f"Basic {base64.b64encode(credentials).decode()}"


def _request_json(url: str, method: str = "GET", data: bytes | None = None, headers: dict[str, str] | None = None) -> dict:
    request = Request(url, data=data, headers=headers or {}, method=method)
    try:
        with urlopen(request, timeout=15) as response:
            return json.loads(response.read().decode())
    except HTTPError as error:
        message = error.read().decode(errors="replace")
        raise SpotifyProviderError(f"Spotify request failed ({error.code}): {message[:220]}") from None
    except URLError as error:
        raise SpotifyProviderError("Spotify is temporarily unreachable.") from error


def _encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode()


def _decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def _database_now() -> datetime:
    # SQLAlchemy DateTime columns are timezone-naive in the existing schema.
    return datetime.now(UTC).replace(tzinfo=None)
