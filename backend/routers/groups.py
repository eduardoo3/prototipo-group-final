from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
import uuid

from database import get_db
from routers.auth import get_current_user
import models

router = APIRouter(prefix="/groups", tags=["groups"])


class GroupCreate(BaseModel):
    group_name: str

class GroupOut(BaseModel):
    id: str
    group_name: str
    owner_id: str
    created_at: datetime
    member_count: int

    class Config:
        from_attributes = True

class MemberOut(BaseModel):
    id: str
    name: str
    avatar: str
    today_study_time: int
    total_study_time: int

    class Config:
        from_attributes = True


def get_study_time(user_id: str, db: Session, today_only: bool = False) -> int:
    query = db.query(models.StudySession).filter(models.StudySession.user_id == user_id)
    if today_only:
        today = datetime.utcnow().date()
        query = query.filter(models.StudySession.date >= datetime(today.year, today.month, today.day))
    sessions = query.all()
    return sum(s.duration for s in sessions)


@router.post("/", status_code=201)
def create_group(data: GroupCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    group = models.Group(
        id=str(uuid.uuid4()),
        group_name=data.group_name,
        owner_id=current_user.id,
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    return {"id": group.id, "group_name": group.group_name, "owner_id": group.owner_id, "created_at": group.created_at}


@router.get("/mine")
def my_groups(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    owned = db.query(models.Group).filter(models.Group.owner_id == current_user.id).all()
    member_of = current_user.groups
    all_groups = {g.id: g for g in owned + list(member_of)}
    return [
        {"id": g.id, "group_name": g.group_name, "owner_id": g.owner_id,
         "created_at": g.created_at, "member_count": len(g.members) + 1}
        for g in all_groups.values()
    ]


@router.post("/{group_id}/join")
def join_group(group_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")
    if group.owner_id == current_user.id or current_user in group.members:
        return {"message": "Você já está neste grupo"}
    group.members.append(current_user)
    db.commit()
    return {"message": "Entrou no grupo com sucesso"}


@router.get("/{group_id}/members")
def get_members(group_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")

    all_members = [group.owner] + list(group.members)
    return [
        {
            "id": m.id, "name": m.name, "avatar": m.avatar,
            "today_study_time": get_study_time(m.id, db, today_only=True),
            "total_study_time": get_study_time(m.id, db),
        }
        for m in all_members
    ]


@router.get("/{group_id}/ranking")
def group_ranking(group_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")

    all_members = [group.owner] + list(group.members)
    ranking = sorted(
        [{"id": m.id, "name": m.name, "avatar": m.avatar,
          "today_time": get_study_time(m.id, db, today_only=True),
          "total_time": get_study_time(m.id, db)} for m in all_members],
        key=lambda x: x["today_time"], reverse=True
    )
    return ranking