from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.db.models import NoteType


class NoteBase(BaseModel):
    content: str
    level_id: Optional[int] = None
    type: NoteType = NoteType.CUSTOM


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    content: Optional[str] = None
    type: Optional[NoteType] = None


class NoteResponse(NoteBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
