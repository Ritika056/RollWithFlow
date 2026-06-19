import base64
import hashlib
import hmac
import json
import secrets
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import User


TOKEN_TTL_HOURS = 24 * 14


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
    return f"scrypt${_encode(salt)}${_encode(digest)}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, encoded_salt, encoded_digest = stored_hash.split("$", 2)
        if algorithm != "scrypt":
            return False
        expected = hashlib.scrypt(password.encode("utf-8"), salt=_decode(encoded_salt), n=2**14, r=8, p=1)
        return hmac.compare_digest(expected, _decode(encoded_digest))
    except (ValueError, TypeError):
        return False


def create_access_token(user: User) -> str:
    expires_at = datetime.now(UTC) + timedelta(hours=TOKEN_TTL_HOURS)
    header = _encode_json({"alg": "HS256", "typ": "JWT"})
    payload = _encode_json({"sub": str(user.id), "email": user.email, "exp": int(expires_at.timestamp())})
    signature = hmac.new(get_settings().secret_key.encode("utf-8"), f"{header}.{payload}".encode("utf-8"), hashlib.sha256).digest()
    return f"{header}.{payload}.{_encode(signature)}"


def get_user_from_token(db: Session, token: str) -> User | None:
    try:
        header, payload, signature = token.split(".")
        expected_signature = hmac.new(get_settings().secret_key.encode("utf-8"), f"{header}.{payload}".encode("utf-8"), hashlib.sha256).digest()
        if not hmac.compare_digest(expected_signature, _decode(signature)):
            return None
        data = json.loads(_decode(payload))
        if int(data["exp"]) < int(datetime.now(UTC).timestamp()):
            return None
        return db.scalar(select(User).where(User.id == int(data["sub"])))
    except (KeyError, TypeError, ValueError, json.JSONDecodeError):
        return None


def create_admin_from_settings(db: Session) -> User | None:
    settings = get_settings()
    if not settings.admin_email or not settings.admin_password:
        return None
    email = normalize_email(settings.admin_email)
    user = db.scalar(select(User).where(User.email == email))
    if user:
        return user
    user = User(
        email=email,
        password_hash=hash_password(settings.admin_password),
        display_name=settings.admin_display_name.strip() or "RollWithFlow Admin",
        is_active=True,
        is_admin=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def _decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def _encode_json(value: dict[str, str | int]) -> str:
    return _encode(json.dumps(value, separators=(",", ":")).encode("utf-8"))
