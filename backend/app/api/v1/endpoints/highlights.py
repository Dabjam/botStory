from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.db.models import Highlight, User
from app.schemas.highlight import HighlightCreate, HighlightResponse
from app.core.deps import get_current_user

router = APIRouter()


@router.get("/level/{level_id}", response_model=List[HighlightResponse])
async def get_level_highlights(
    level_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all highlights for a level (current user)"""
    highlights = db.query(Highlight).filter(
        Highlight.level_id == level_id,
        Highlight.user_id == current_user.id
    ).order_by(Highlight.char_start).all()
    
    return highlights


@router.post("/", response_model=HighlightResponse, status_code=status.HTTP_201_CREATED)
async def create_highlight(
    highlight_data: HighlightCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new highlight"""
    db_highlight = Highlight(
        user_id=current_user.id,
        **highlight_data.dict()
    )
    
    db.add(db_highlight)
    db.commit()
    db.refresh(db_highlight)
    
    return db_highlight


@router.delete("/{highlight_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_highlight(
    highlight_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a highlight"""
    highlight = db.query(Highlight).filter(
        Highlight.id == highlight_id,
        Highlight.user_id == current_user.id
    ).first()
    
    if not highlight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Highlight not found"
        )
    
    db.delete(highlight)
    db.commit()
    
    return None
