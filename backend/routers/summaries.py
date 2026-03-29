from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
import uuid

from database import get_db
from routers.auth import get_current_user
import models

router = APIRouter(prefix="/summaries", tags=["summaries"])


class SummaryCreate(BaseModel):
    group_id: str
    title: str
    content: str

class CommentCreate(BaseModel):
    text: str


@router.get("/group/{group_id}")
def list_summaries(group_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    summaries = db.query(models.Summary).filter(models.Summary.group_id == group_id).order_by(models.Summary.created_at.desc()).all()
    return [
        {
            "id": s.id, "title": s.title, "content": s.content,
            "created_at": s.created_at,
            "author": {"id": s.author.id, "name": s.author.name, "avatar": s.author.avatar},
            "comments": [
                {"id": c.id, "text": c.text, "created_at": c.created_at,
                 "user": {"id": c.user.id, "name": c.user.name, "avatar": c.user.avatar}}
                for c in s.comments
            ]
        }
        for s in summaries
    ]


@router.post("/", status_code=201)
def create_summary(data: SummaryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    summary = models.Summary(
        id=str(uuid.uuid4()),
        group_id=data.group_id,
        author_id=current_user.id,
        title=data.title,
        content=data.content,
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)
    return {"id": summary.id, "title": summary.title}


@router.post("/{summary_id}/comments", status_code=201)
def add_comment(summary_id: str, data: CommentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    summary = db.query(models.Summary).filter(models.Summary.id == summary_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="Resumo não encontrado")

    comment = models.Comment(
        id=str(uuid.uuid4()),
        summary_id=summary_id,
        user_id=current_user.id,
        text=data.text,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return {"id": comment.id, "text": comment.text}