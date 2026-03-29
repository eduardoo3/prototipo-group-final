from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
import uuid

from database import get_db
from routers.auth import get_current_user
import models

router = APIRouter(prefix="/sessions", tags=["sessions"])


class SessionCreate(BaseModel):
    duration: int  # segundos
    group_id: str | None = None


@router.post("/", status_code=201)
def create_session(data: SessionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    session = models.StudySession(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        group_id=data.group_id,
        duration=data.duration,
        date=datetime.utcnow(),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"id": session.id, "duration": session.duration, "date": session.date}


@router.get("/my-stats")
def my_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    all_sessions = db.query(models.StudySession).filter(models.StudySession.user_id == current_user.id).all()
    today = datetime.utcnow().date()
    today_sessions = [s for s in all_sessions if s.date.date() == today]
    return {
        "total_time": sum(s.duration for s in all_sessions),
        "today_time": sum(s.duration for s in today_sessions),
        "sessions_count": len(all_sessions),
    }