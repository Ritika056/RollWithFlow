import csv, io, json
from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models import Crate, DiscoveryItem, Event, Folder, Mix, Playlist, Song

router = APIRouter(prefix="/api/export", tags=["export"])

def song_data(song): return {"id": song.id, "title": song.title, "artist": song.artist.name if song.artist else None, "album": song.album.title if song.album else None, "genre": song.genre.name if song.genre else None, "duration_seconds": song.duration_seconds, "bpm": song.bpm, "musical_key": song.musical_key, "energy_level": song.energy_level, "rating": song.rating, "is_liked": song.is_liked, "sources": [{"type": source.type.value, "name": source.name, "url": source.url} for source in song.sources]}
def json_file(data, name): return Response(json.dumps(data, default=str, indent=2), media_type="application/json", headers={"Content-Disposition": f'attachment; filename="{name}"'})
def songs(db): return list(db.scalars(select(Song).options(selectinload(Song.artist), selectinload(Song.album), selectinload(Song.genre), selectinload(Song.sources), selectinload(Song.folders))).unique().all())

@router.get("/library.csv")
def library_csv(db: Session = Depends(get_db)):
    out = io.StringIO(); writer = csv.DictWriter(out, fieldnames=["id","title","artist","album","genre","duration_seconds","bpm","musical_key","energy_level","rating","is_liked"]); writer.writeheader()
    for song in songs(db): writer.writerow({key: value for key, value in song_data(song).items() if key in writer.fieldnames})
    return Response(out.getvalue(), media_type="text/csv", headers={"Content-Disposition": 'attachment; filename="rollwithflow-library.csv"'})
@router.get("/library.json")
def library_json(db: Session = Depends(get_db)): return json_file({"songs": [song_data(song) for song in songs(db)]}, "rollwithflow-library.json")
@router.get("/playlists.json")
def playlists_json(db: Session = Depends(get_db)): return json_file({"playlists": [{"id": item.id, "name": item.name, "description": item.description, "song_ids": [song.id for song in item.songs]} for item in db.scalars(select(Playlist).options(selectinload(Playlist.songs))).all()]}, "rollwithflow-playlists.json")
@router.get("/full-backup.json")
def full_backup(db: Session = Depends(get_db)):
    data = {"schema_version": 1, "songs": [song_data(song) for song in songs(db)], "folders": [{"id": item.id,"name":item.name,"description":item.description} for item in db.scalars(select(Folder)).all()], "playlists": [{"id":item.id,"name":item.name,"song_ids":[song.id for song in item.songs]} for item in db.scalars(select(Playlist).options(selectinload(Playlist.songs))).all()], "crates": [{"id":item.id,"name":item.name,"song_ids":[song.id for song in item.songs]} for item in db.scalars(select(Crate).options(selectinload(Crate.songs))).all()], "mixes": [{"id":item.id,"title":item.title,"notes":item.notes,"tracklist_text":item.tracklist_text} for item in db.scalars(select(Mix)).all()], "events": [{"id":item.id,"name":item.name,"event_type":item.event_type,"event_date":item.event_date,"notes":item.notes} for item in db.scalars(select(Event)).all()], "discovery_items": [{"id":item.id,"title":item.title,"artist_name":item.artist_name,"platform":item.platform,"source_url":item.source_url} for item in db.scalars(select(DiscoveryItem)).all()]}
    return json_file(data, "rollwithflow-full-backup.json")
