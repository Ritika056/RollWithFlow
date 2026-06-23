from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models import Event, EventChecklistItem, EventMusicLink, EventTimelineItem
from app.schemas.common import (
    EventChecklistRead, EventChecklistWrite, EventMusicLinkRead, EventMusicLinkWrite,
    EventRead, EventTimelineRead, EventTimelineWrite, EventWrite,
)

router = APIRouter(prefix="/api/events", tags=["events"])


def event_or_404(db: Session, event_id: int) -> Event:
    item = db.get(Event, event_id)
    if not item:
        raise HTTPException(status_code=404, detail="Event not found")
    return item


def refresh_readiness(event: Event) -> None:
    checklist = event.checklist_items
    checklist_score = (sum(item.is_done for item in checklist) / len(checklist) * 60) if checklist else 0
    timeline_score = min(len(event.timeline_items) * 10, 20)
    music_score = min(len(event.music_links) * 10, 20)
    event.readiness_percent = round(min(100, checklist_score + timeline_score + music_score))


def load_event(db: Session, event_id: int) -> Event:
    item = db.scalar(select(Event).options(selectinload(Event.timeline_items), selectinload(Event.checklist_items), selectinload(Event.music_links)).where(Event.id == event_id))
    if not item:
        raise HTTPException(status_code=404, detail="Event not found")
    refresh_readiness(item)
    return item


@router.get("", response_model=list[EventRead])
def list_events(db: Session = Depends(get_db)) -> list[Event]:
    items = list(db.scalars(select(Event).options(selectinload(Event.timeline_items), selectinload(Event.checklist_items), selectinload(Event.music_links)).order_by(Event.event_date.asc().nulls_last(), Event.created_at.desc())).all())
    for item in items:
        refresh_readiness(item)
    db.commit()
    return items


@router.post("", response_model=EventRead, status_code=201)
def create_event(payload: EventWrite, db: Session = Depends(get_db)) -> Event:
    item = Event(**payload.model_dump())
    db.add(item)
    db.commit()
    return load_event(db, item.id)


@router.get("/{event_id}", response_model=EventRead)
def get_event(event_id: int, db: Session = Depends(get_db)) -> Event:
    return load_event(db, event_id)


@router.patch("/{event_id}", response_model=EventRead)
def update_event(event_id: int, payload: EventWrite, db: Session = Depends(get_db)) -> Event:
    item = event_or_404(db, event_id)
    for field, value in payload.model_dump().items():
        setattr(item, field, value)
    db.commit()
    return load_event(db, event_id)


@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    db.delete(event_or_404(db, event_id))
    db.commit()
    return {"status": "deleted"}


@router.get("/{event_id}/timeline", response_model=list[EventTimelineRead])
def list_timeline(event_id: int, db: Session = Depends(get_db)) -> list[EventTimelineItem]:
    event_or_404(db, event_id)
    return list(db.scalars(select(EventTimelineItem).where(EventTimelineItem.event_id == event_id).order_by(EventTimelineItem.sort_order, EventTimelineItem.id)).all())


@router.post("/{event_id}/timeline", response_model=EventTimelineRead, status_code=201)
def create_timeline(event_id: int, payload: EventTimelineWrite, db: Session = Depends(get_db)) -> EventTimelineItem:
    event_or_404(db, event_id)
    item = EventTimelineItem(event_id=event_id, **payload.model_dump())
    db.add(item); db.commit(); load_event(db, event_id); db.commit()
    return item


@router.patch("/{event_id}/timeline/{item_id}", response_model=EventTimelineRead)
def update_timeline(event_id: int, item_id: int, payload: EventTimelineWrite, db: Session = Depends(get_db)) -> EventTimelineItem:
    item = db.get(EventTimelineItem, item_id)
    if not item or item.event_id != event_id: raise HTTPException(status_code=404, detail="Timeline item not found")
    for field, value in payload.model_dump().items(): setattr(item, field, value)
    db.commit(); load_event(db, event_id); db.commit()
    return item


@router.delete("/{event_id}/timeline/{item_id}")
def delete_timeline(event_id: int, item_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    item = db.get(EventTimelineItem, item_id)
    if not item or item.event_id != event_id: raise HTTPException(status_code=404, detail="Timeline item not found")
    db.delete(item); db.commit(); load_event(db, event_id); db.commit()
    return {"status": "deleted"}


@router.get("/{event_id}/checklist", response_model=list[EventChecklistRead])
def list_checklist(event_id: int, db: Session = Depends(get_db)) -> list[EventChecklistItem]:
    event_or_404(db, event_id)
    return list(db.scalars(select(EventChecklistItem).where(EventChecklistItem.event_id == event_id).order_by(EventChecklistItem.sort_order, EventChecklistItem.id)).all())


@router.post("/{event_id}/checklist", response_model=EventChecklistRead, status_code=201)
def create_checklist(event_id: int, payload: EventChecklistWrite, db: Session = Depends(get_db)) -> EventChecklistItem:
    event_or_404(db, event_id); item = EventChecklistItem(event_id=event_id, **payload.model_dump()); db.add(item); db.commit(); load_event(db, event_id); db.commit(); return item


@router.patch("/{event_id}/checklist/{item_id}", response_model=EventChecklistRead)
def update_checklist(event_id: int, item_id: int, payload: EventChecklistWrite, db: Session = Depends(get_db)) -> EventChecklistItem:
    item = db.get(EventChecklistItem, item_id)
    if not item or item.event_id != event_id: raise HTTPException(status_code=404, detail="Checklist item not found")
    for field, value in payload.model_dump().items(): setattr(item, field, value)
    db.commit(); load_event(db, event_id); db.commit(); return item


@router.delete("/{event_id}/checklist/{item_id}")
def delete_checklist(event_id: int, item_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    item = db.get(EventChecklistItem, item_id)
    if not item or item.event_id != event_id: raise HTTPException(status_code=404, detail="Checklist item not found")
    db.delete(item); db.commit(); load_event(db, event_id); db.commit(); return {"status": "deleted"}


@router.get("/{event_id}/music-links", response_model=list[EventMusicLinkRead])
def list_music_links(event_id: int, db: Session = Depends(get_db)) -> list[EventMusicLink]:
    event_or_404(db, event_id); return list(db.scalars(select(EventMusicLink).where(EventMusicLink.event_id == event_id)).all())


@router.post("/{event_id}/music-links", response_model=EventMusicLinkRead, status_code=201)
def create_music_link(event_id: int, payload: EventMusicLinkWrite, db: Session = Depends(get_db)) -> EventMusicLink:
    if not any([payload.playlist_id, payload.crate_id, payload.mix_id]): raise HTTPException(status_code=422, detail="Select a playlist, crate, or mix")
    event_or_404(db, event_id); item = EventMusicLink(event_id=event_id, **payload.model_dump()); db.add(item); db.commit(); load_event(db, event_id); db.commit(); return item


@router.delete("/{event_id}/music-links/{link_id}")
def delete_music_link(event_id: int, link_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    item = db.get(EventMusicLink, link_id)
    if not item or item.event_id != event_id: raise HTTPException(status_code=404, detail="Music link not found")
    db.delete(item); db.commit(); load_event(db, event_id); db.commit(); return {"status": "deleted"}
