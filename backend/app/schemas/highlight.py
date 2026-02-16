from pydantic import BaseModel
from datetime import datetime
from app.db.models import HighlightColor


class HighlightBase(BaseModel):
    level_id: int
    text_fragment: str
    color: HighlightColor
    char_start: int
    char_end: int


class HighlightCreate(HighlightBase):
    pass


class HighlightResponse(HighlightBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
