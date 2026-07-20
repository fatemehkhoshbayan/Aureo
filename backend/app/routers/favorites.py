from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Favorite, Photographer, User

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("", response_model=list[str])
def list_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[str]:
    rows = db.query(Favorite.photographer_id).filter(Favorite.user_id == current_user.id).all()
    return [row[0] for row in rows]


@router.put("/{photographer_id}", status_code=status.HTTP_204_NO_CONTENT)
def add_favorite(
    photographer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    if not db.get(Photographer, photographer_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photographer not found")
    if not db.get(Favorite, (current_user.id, photographer_id)):
        db.add(Favorite(user_id=current_user.id, photographer_id=photographer_id))
        db.commit()


@router.delete("/{photographer_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(
    photographer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    favorite = db.get(Favorite, (current_user.id, photographer_id))
    if favorite:
        db.delete(favorite)
        db.commit()
