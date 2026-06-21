from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.dependencies import get_current_active_user
from app.api.routes import audio, auth, collections, crates, dashboard, discovery, folders, health, library, mixes, playlists, providers, songs
from app.core.config import get_settings
from app.core.database import SessionLocal, init_db
from app.services.auth_service import create_admin_from_settings


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.4.0",
    description="Phase 3/4 API foundation for the RollWithFlow private DJ operating system.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys([*settings.cors_origin_list, "http://localhost:3000", "http://127.0.0.1:3000"])),
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+):3000",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    db = SessionLocal()
    try:
        create_admin_from_settings(db)
    finally:
        db.close()


app.include_router(health.router)
app.include_router(auth.router)
protected = [Depends(get_current_active_user)]
app.include_router(dashboard.router, dependencies=protected)
app.include_router(songs.router, dependencies=protected)
app.include_router(library.router, dependencies=protected)
app.include_router(folders.router, dependencies=protected)
app.include_router(playlists.router, dependencies=protected)
app.include_router(crates.router, dependencies=protected)
app.include_router(mixes.router, dependencies=protected)
app.include_router(discovery.router, dependencies=protected)
app.include_router(collections.router, dependencies=protected)
app.include_router(providers.router)
app.include_router(audio.router, dependencies=protected)
