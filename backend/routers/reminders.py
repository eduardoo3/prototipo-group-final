from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
import uuid

from database import get_db
from routers.auth import get_current_user
import models

router = APIRouter(prefix="/reminders", tags=["reminders"])


class ReminderCreate(BaseModel):
    group_id: str
    title: str
    message: str | None = None
    datetime: datetime


@router.get("/group/{group_id}")
def list_reminders(group_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    reminders = db.query(models.Reminder).filter(models.Reminder.group_id == group_id).order_by(models.Reminder.datetime).all()
    return [
        {
            "id": r.id, "title": r.title, "message": r.message,
            "datetime": r.datetime, "created_at": r.created_at,
            "author": {"id": r.author.id, "name": r.author.name, "avatar": r.author.avatar},
        }
        for r in reminders
    ]


@router.post("/", status_code=201)
def create_reminder(data: ReminderCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    reminder = models.Reminder(
        id=str(uuid.uuid4()),
        group_id=data.group_id,
        author_id=current_user.id,
        title=data.title,
        message=data.message,
        datetime=data.datetime,
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return {"id": reminder.id, "title": reminder.title}


@router.delete("/{reminder_id}", status_code=204)
def delete_reminder(reminder_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    reminder = db.query(models.Reminder).filter(models.Reminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Lembrete não encontrado")
    if reminder.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sem permissão")
    db.delete(reminder)
    db.commit()