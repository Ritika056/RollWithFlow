from functools import lru_cache
from pathlib import Path

from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = BASE_DIR / "rollwithflow.db"


class Settings(BaseSettings):
    app_name: str = "RollWithFlow"
    environment: str = Field(default="local", validation_alias=AliasChoices("APP_ENV", "ENVIRONMENT"))
    phase: int = 5
    database_url: str = f"sqlite:///{DEFAULT_DB_PATH.as_posix()}"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    secret_key: str = "change-me-before-production"
    admin_email: str | None = None
    admin_password: str | None = None
    admin_display_name: str = "RollWithFlow Admin"
    spotify_client_id: str | None = None
    spotify_client_secret: str | None = None
    spotify_redirect_uri: str | None = None
    youtube_api_key: str | None = None

    @model_validator(mode="after")
    def require_production_secret(self) -> "Settings":
        # Render supplies a standard postgresql:// URL. Use the installed
        # psycopg v3 driver instead of SQLAlchemy's legacy psycopg2 default.
        if self.database_url.startswith("postgresql://"):
            self.database_url = self.database_url.replace("postgresql://", "postgresql+psycopg://", 1)

        if self.environment.lower() in {"production", "prod"}:
            if self.secret_key == "change-me-before-production" or len(self.secret_key) < 32:
                raise ValueError("SECRET_KEY must be a strong value of at least 32 characters in production.")
        return self

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip().rstrip("/") for origin in self.cors_origins.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
