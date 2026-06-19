from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, insert, select, update
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models import Playlist, Song, playlist_songs
from app.schemas.common import PlaylistRead, PlaylistSongRead, PlaylistSongUpdate, PlaylistWrite
from app.services.song_service import song_with_relations_query

router = APIRouter(prefix="/api/playlists", tags=["playlists"])


def playlist_or_404(db: Session, playlist_id: int) -> Playlist:
    item = db.get(Playlist, playlist_id)
    if not item:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return item


def playlist_read(item: Playlist) -> PlaylistRead:
    return PlaylistRead.model_validate(item).model_copy(update={"song_count": len(item.songs)})


@router.get("", response_model=list[PlaylistRead])
def list_playlists(db: Session = Depends(get_db)):
    items = db.scalars(select(Playlist).options(selectinload(Playlist.songs)).order_by(Playlist.created_at.desc())).all()
    return [playlist_read(item) for item in items]


@router.post("", response_model=PlaylistRead, status_code=201)
def create_playlist(payload: PlaylistWrite, db: Session = Depends(get_db)):
    item = Playlist(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return playlist_read(item)


@router.get("/{playlist_id}", response_model=PlaylistRead)
def get_playlist(playlist_id: int, db: Session = Depends(get_db)):
    return playlist_read(playlist_or_404(db, playlist_id))


@router.patch("/{playlist_id}", response_model=PlaylistRead)
def update_playlist(playlist_id: int, payload: PlaylistWrite, db: Session = Depends(get_db)):
    item = playlist_or_404(db, playlist_id)
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    return playlist_read(item)


@router.delete("/{playlist_id}")
def delete_playlist(playlist_id: int, db: Session = Depends(get_db)):
    db.delete(playlist_or_404(db, playlist_id))
    db.commit()
    return {"status": "deleted"}


@router.get("/{playlist_id}/songs", response_model=list[PlaylistSongRead])
def playlist_song_list(playlist_id: int, db: Session = Depends(get_db)):
    playlist_or_404(db, playlist_id)
    rows = db.execute(select(playlist_songs).where(playlist_songs.c.playlist_id == playlist_id)).mappings().all()
    meta = {row["song_id"]: row for row in rows}
    songs = db.scalars(song_with_relations_query().where(Song.id.in_(meta.keys()))).unique().all() if meta else []
    songs.sort(key=lambda song: meta[song.id]["position"] or 9999)
    return [
        PlaylistSongRead.model_validate(song).model_copy(
            update={
                "position": meta[song.id]["position"],
                "cue_note": meta[song.id]["cue_note"],
                "transition_note": meta[song.id]["transition_note"],
                "must_play": bool(meta[song.id]["must_play"]),
                "optional": bool(meta[song.id]["optional"]),
            }
        )
        for song in songs
    ]


@router.post("/{playlist_id}/songs/{song_id}", response_model=PlaylistRead)
def add_song(playlist_id: int, song_id: int, db: Session = Depends(get_db)):
    playlist = playlist_or_404(db, playlist_id)
    if not db.get(Song, song_id):
        raise HTTPException(status_code=404, detail="Song not found")
    exists = db.execute(select(playlist_songs).where(playlist_songs.c.playlist_id == playlist_id, playlist_songs.c.song_id == song_id)).first()
    if not exists:
        count = db.scalar(select(playlist_songs.c.song_id).where(playlist_songs.c.playlist_id == playlist_id).order_by(playlist_songs.c.position.desc()).limit(1))
        db.execute(insert(playlist_songs).values(playlist_id=playlist_id, song_id=song_id, position=(len(playlist.songs) + 1 if count else 1)))
    db.commit()
    db.refresh(playlist)
    return playlist_read(playlist)


@router.patch("/{playlist_id}/songs/{song_id}", response_model=PlaylistSongRead)
def update_playlist_song(playlist_id: int, song_id: int, payload: PlaylistSongUpdate, db: Session = Depends(get_db)):
    playlist_or_404(db, playlist_id)
    db.execute(update(playlist_songs).where(playlist_songs.c.playlist_id == playlist_id, playlist_songs.c.song_id == song_id).values(**payload.model_dump()))
    db.commit()
    song = db.scalars(song_with_relations_query().where(Song.id == song_id)).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    row = db.execute(select(playlist_songs).where(playlist_songs.c.playlist_id == playlist_id, playlist_songs.c.song_id == song_id)).mappings().first()
    return PlaylistSongRead.model_validate(song).model_copy(update=dict(row))


@router.delete("/{playlist_id}/songs/{song_id}", response_model=PlaylistRead)
def remove_song(playlist_id: int, song_id: int, db: Session = Depends(get_db)):
    playlist = playlist_or_404(db, playlist_id)
    db.execute(delete(playlist_songs).where(playlist_songs.c.playlist_id == playlist_id, playlist_songs.c.song_id == song_id))
    db.commit()
    db.refresh(playlist)
    return playlist_read(playlist)
