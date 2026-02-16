from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
import re


class MessageBase(BaseModel):
    content: str


class MessageCreate(MessageBase):
    level_id: int
    
    @validator('content')
    def validate_spoiler(cls, v):
        """Check if code without spoiler tag"""
        # Kumir keywords that indicate code
        kumir_keywords = ['нц', 'кц', 'вперед', 'налево', 'направо', 'пока', 'если', 'то', 'иначе']
        
        # Check if message contains spoiler tag
        has_spoiler_tag = '[spoiler]' in v.lower()
        
        # Check if message contains kumir keywords
        has_code = any(keyword in v.lower() for keyword in kumir_keywords)
        
        if has_code and not has_spoiler_tag:
            raise ValueError(
                'Код должен быть обёрнут в тег [spoiler]...[/spoiler]. '
                'Не портите удовольствие от решения другим игрокам!'
            )
        
        return v


class MessageUpdate(BaseModel):
    content: Optional[str] = None


class MessageResponse(MessageBase):
    id: int
    level_id: int
    user_id: int
    is_spoiler: bool
    created_at: datetime
    is_deleted: bool
    
    # User info
    username: Optional[str] = None
    has_completed: Optional[bool] = None  # Has user completed this level
    
    class Config:
        from_attributes = True
