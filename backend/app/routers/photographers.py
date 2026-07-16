from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.deps import get_current_user, require_roles
from app.models import Package, Photographer, PortfolioItem, Review, User, UserRole
from app.schemas import PhotographerCreate, PhotographerOut, PhotographerUpdate

router = APIRouter(prefix="/photographers", tags=["photographers"])


def _load_options():
    return (
        joinedload(Photographer.portfolio),
        joinedload(Photographer.packages),
        joinedload(Photographer.reviews),
    )


def _to_out(p: Photographer) -> PhotographerOut:
    return PhotographerOut.model_validate(p)


@router.get("", response_model=list[PhotographerOut])
def list_photographers(
    specialty: str | None = Query(None),
    featured: bool | None = Query(None),
    db: Session = Depends(get_db),
) -> list[PhotographerOut]:
    query = db.query(Photographer).options(*_load_options())
    if featured is not None:
        query = query.filter(Photographer.featured.is_(featured))
    photographers = query.order_by(Photographer.id).all()
    if specialty:
        specialty_lower = specialty.lower()
        photographers = [
            p
            for p in photographers
            if any(s.lower() == specialty_lower for s in (p.specialties or []))
        ]
    return [_to_out(p) for p in photographers]


@router.get("/{photographer_id}", response_model=PhotographerOut)
def get_photographer(photographer_id: str, db: Session = Depends(get_db)) -> PhotographerOut:
    photographer = (
        db.query(Photographer)
        .options(*_load_options())
        .filter(Photographer.id == photographer_id)
        .first()
    )
    if not photographer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photographer not found")
    return _to_out(photographer)


@router.post(
    "",
    response_model=PhotographerOut,
    status_code=status.HTTP_201_CREATED,
)
def create_photographer(
    payload: PhotographerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.photographer)),
) -> PhotographerOut:
    if db.get(Photographer, payload.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Photographer id already exists",
        )

    photographer = Photographer(
        id=payload.id,
        name=payload.name,
        avatar=payload.avatar,
        cover=payload.cover,
        specialties=payload.specialties,
        bio=payload.bio,
        experience=payload.experience,
        rating=payload.rating,
        review_count=payload.reviewCount,
        location=payload.location,
        starting_price=payload.startingPrice,
        featured=payload.featured,
        user_id=current_user.id if current_user.role == UserRole.photographer.value else None,
    )
    db.add(photographer)

    for item in payload.portfolio:
        db.add(
            PortfolioItem(
                id=item.id,
                photographer_id=payload.id,
                image=item.image,
                category=item.category,
                alt=item.alt,
            )
        )
    for pkg in payload.packages:
        db.add(
            Package(
                id=pkg.id,
                photographer_id=payload.id,
                name=pkg.name,
                price=pkg.price,
                duration=pkg.duration,
                description=pkg.description,
                includes=pkg.includes,
            )
        )
    for rev in payload.reviews:
        db.add(
            Review(
                id=rev.id,
                photographer_id=payload.id,
                author=rev.author,
                avatar=rev.avatar,
                rating=rev.rating,
                date=rev.date,
                text=rev.text,
                service=rev.service,
            )
        )

    db.commit()
    created = (
        db.query(Photographer)
        .options(*_load_options())
        .filter(Photographer.id == payload.id)
        .first()
    )
    return _to_out(created)


@router.patch("/{photographer_id}", response_model=PhotographerOut)
def update_photographer(
    photographer_id: str,
    payload: PhotographerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PhotographerOut:
    photographer = db.get(Photographer, photographer_id)
    if not photographer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photographer not found")

    is_admin = current_user.role == UserRole.admin.value
    is_owner = (
        current_user.role == UserRole.photographer.value
        and photographer.user_id == current_user.id
    )
    if not (is_admin or is_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to update this photographer",
        )

    data = payload.model_dump(exclude_unset=True)
    field_map = {
        "reviewCount": "review_count",
        "startingPrice": "starting_price",
    }
    for key, value in data.items():
        setattr(photographer, field_map.get(key, key), value)

    db.commit()
    updated = (
        db.query(Photographer)
        .options(*_load_options())
        .filter(Photographer.id == photographer_id)
        .first()
    )
    return _to_out(updated)
