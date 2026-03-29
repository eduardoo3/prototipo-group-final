from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

# Tabela de associação: usuário <-> grupo
group_members = Table(
    "group_members",
    Base.metadata,
    Column("user_id", String, ForeignKey("users.id")),
    Column("group_id", String, ForeignKey("groups.id")),
)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    avatar = Column(String, default="🧑‍🎓")
    created_at = Column(DateTime, default=lambda: datetime.now())

    owned_groups = relationship("Group", back_populates="owner")
    groups = relationship("Group", secondary=group_members, back_populates="members")
    study_sessions = relationship("StudySession", back_populates="user")
    summaries = relationship("Summary", back_populates="author")
    reminders = relationship("Reminder", back_populates="author")


class Group(Base):
    __tablename__ = "groups"

    id = Column(String, primary_key=True, index=True)
    group_name = Column(String, nullable=False)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now())

    owner = relationship("User", back_populates="owned_groups")
    members = relationship("User", secondary=group_members, back_populates="groups")
    study_sessions = relationship("StudySession", back_populates="group")
    summaries = relationship("Summary", back_populates="group")
    reminders = relationship("Reminder", back_populates="group")


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    group_id = Column(String, ForeignKey("groups.id"), nullable=True)
    duration = Column(Integer, nullable=False)  # em segundos
    date = Column(DateTime, default=lambda: datetime.now())

    user = relationship("User", back_populates="study_sessions")
    group = relationship("Group", back_populates="study_sessions")


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(String, primary_key=True, index=True)
    group_id = Column(String, ForeignKey("groups.id"), nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now())

    group = relationship("Group", back_populates="summaries")
    author = relationship("User", back_populates="summaries")
    comments = relationship("Comment", back_populates="summary", cascade="all, delete-orphan")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(String, primary_key=True, index=True)
    summary_id = Column(String, ForeignKey("summaries.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now())

    summary = relationship("Summary", back_populates="comments")
    user = relationship("User")


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(String, primary_key=True, index=True)
    group_id = Column(String, ForeignKey("groups.id"), nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=True)
    datetime = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now())

    group = relationship("Group", back_populates="reminders")
    author = relationship("User", back_populates="reminders")
