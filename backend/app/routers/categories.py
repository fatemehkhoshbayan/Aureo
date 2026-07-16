from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Category
from app.schemas import CategoryOut

router = APIRouter(prefix="/categories", tags=["categories"])


def _to_category_out(cat: Category) -> CategoryOut:
    return CategoryOut.model_validate(
        {"id": cat.id, "label": cat.label, "image": cat.image, "from": cat.price_from}
    )


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)) -> list[CategoryOut]:
    cats = db.query(Category).order_by(Category.id).all()
    return [_to_category_out(c) for c in cats]


@router.get("/{category_id}", response_model=CategoryOut)
def get_category(category_id: int, db: Session = Depends(get_db)) -> CategoryOut:
    cat = db.get(Category, category_id)
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return _to_category_out(cat)
