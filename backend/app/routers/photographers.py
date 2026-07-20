from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.orm.attributes import flag_modified

from app.database import get_db
from app.deps import get_current_user, require_roles
from app.models import Package, Photographer, PortfolioItem, Review, User, UserRole
from app.schemas import (
    PackageCreateSelf,
    PackageOut,
    PackageUpdate,
    PhotographerCreate,
    PhotographerCreateSelf,
    PhotographerOut,
    PhotographerUpdate,
    PortfolioItemOut,
)

router = APIRouter(prefix="/photographers", tags=["photographers"])

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads" / "photographers"
ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
MAX_IMAGE_BYTES = 2 * 1024 * 1024  # 2 MB


def _load_options():
    return (
        joinedload(Photographer.portfolio),
        joinedload(Photographer.packages),
        joinedload(Photographer.reviews),
    )


def _to_out(p: Photographer) -> PhotographerOut:
    return PhotographerOut.model_validate(p)


def _generate_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex[:8]}"


def _get_owned_photographer(db: Session, current_user: User) -> Photographer:
    photographer = (
        db.query(Photographer)
        .options(*_load_options())
        .filter(Photographer.user_id == current_user.id)
        .first()
    )
    if not photographer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photographer profile not found",
        )
    return photographer


async def _save_upload(file: UploadFile, filename_stem: str) -> str:
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image must be a JPEG, PNG, WebP, or GIF",
        )

    data = await file.read()
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image must be 2 MB or smaller",
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    ext = ALLOWED_TYPES[content_type]
    filename = f"{filename_stem}{ext}"

    for old in UPLOAD_DIR.glob(f"{filename_stem}.*"):
        old.unlink(missing_ok=True)

    (UPLOAD_DIR / filename).write_bytes(data)
    return f"/uploads/photographers/{filename}"


def _apply_photographer_update(photographer: Photographer, payload: PhotographerUpdate) -> None:
    data = payload.model_dump(exclude_unset=True)
    field_map = {
        "reviewCount": "review_count",
        "startingPrice": "starting_price",
    }
    for key, value in data.items():
        setattr(photographer, field_map.get(key, key), value)


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


@router.get("/me", response_model=PhotographerOut)
def get_my_photographer(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.photographer, UserRole.admin)),
) -> PhotographerOut:
    return _to_out(_get_owned_photographer(db, current_user))


@router.post(
    "/me",
    response_model=PhotographerOut,
    status_code=status.HTTP_201_CREATED,
)
def create_my_photographer(
    payload: PhotographerCreateSelf,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.photographer, UserRole.admin)),
) -> PhotographerOut:
    existing = (
        db.query(Photographer).filter(Photographer.user_id == current_user.id).first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Photographer profile already exists",
        )

    photographer_id = _generate_id("p")
    while db.get(Photographer, photographer_id):
        photographer_id = _generate_id("p")

    photographer = Photographer(
        id=photographer_id,
        name=payload.name,
        avatar=payload.avatar or "/uploads/photographers/placeholder-avatar.jpg",
        cover=payload.cover or "/uploads/photographers/placeholder-cover.jpg",
        specialties=payload.specialties,
        bio=payload.bio,
        experience=payload.experience,
        rating=0.0,
        review_count=0,
        location=payload.location,
        starting_price=payload.startingPrice,
        featured=False,
        user_id=current_user.id,
    )
    db.add(photographer)
    db.commit()

    created = (
        db.query(Photographer)
        .options(*_load_options())
        .filter(Photographer.id == photographer_id)
        .first()
    )
    return _to_out(created)


@router.patch("/me", response_model=PhotographerOut)
def update_my_photographer(
    payload: PhotographerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.photographer, UserRole.admin)),
) -> PhotographerOut:
    photographer = _get_owned_photographer(db, current_user)
    data = payload.model_dump(exclude_unset=True)
    if current_user.role != UserRole.admin.value:
        data.pop("featured", None)
        data.pop("rating", None)
        data.pop("reviewCount", None)
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
        .filter(Photographer.id == photographer.id)
        .first()
    )
    return _to_out(updated)


@router.post("/me/avatar", response_model=PhotographerOut)
async def upload_my_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.photographer, UserRole.admin)),
) -> PhotographerOut:
    photographer = _get_owned_photographer(db, current_user)
    photographer.avatar = await _save_upload(file, f"{photographer.id}_avatar")
    db.commit()
    updated = (
        db.query(Photographer)
        .options(*_load_options())
        .filter(Photographer.id == photographer.id)
        .first()
    )
    return _to_out(updated)


@router.post("/me/cover", response_model=PhotographerOut)
async def upload_my_cover(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.photographer, UserRole.admin)),
) -> PhotographerOut:
    photographer = _get_owned_photographer(db, current_user)
    photographer.cover = await _save_upload(file, f"{photographer.id}_cover")
    db.commit()
    updated = (
        db.query(Photographer)
        .options(*_load_options())
        .filter(Photographer.id == photographer.id)
        .first()
    )
    return _to_out(updated)


@router.post(
    "/me/packages",
    response_model=PackageOut,
    status_code=status.HTTP_201_CREATED,
)
def create_my_package(
    payload: PackageCreateSelf,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.photographer, UserRole.admin)),
) -> PackageOut:
    photographer = _get_owned_photographer(db, current_user)
    package_id = _generate_id("pkg")
    while db.get(Package, (package_id, photographer.id)):
        package_id = _generate_id("pkg")

    package = Package(
        id=package_id,
        photographer_id=photographer.id,
        name=payload.name,
        price=payload.price,
        duration=payload.duration,
        description=payload.description,
        includes=payload.includes,
        sample_images=[],
    )
    db.add(package)

    # Keep starting_price in sync with cheapest package when unset/higher
    if photographer.starting_price == 0 or payload.price < photographer.starting_price:
        photographer.starting_price = payload.price

    db.commit()
    db.refresh(package)
    return PackageOut.model_validate(package)


@router.patch("/me/packages/{package_id}", response_model=PackageOut)
def update_my_package(
    package_id: str,
    payload: PackageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.photographer, UserRole.admin)),
) -> PackageOut:
    photographer = _get_owned_photographer(db, current_user)
    package = db.get(Package, (package_id, photographer.id))
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(package, key, value)

    db.commit()
    db.refresh(package)
    return PackageOut.model_validate(package)


def _unlink_upload(image_path: str) -> None:
    if image_path.startswith("/uploads/photographers/"):
        filename = image_path.rsplit("/", 1)[-1]
        (UPLOAD_DIR / filename).unlink(missing_ok=True)


@router.post(
    "/me/packages/{package_id}/samples",
    response_model=PackageOut,
    status_code=status.HTTP_201_CREATED,
)
async def add_my_package_sample(
    package_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.photographer, UserRole.admin)),
) -> PackageOut:
    photographer = _get_owned_photographer(db, current_user)
    package = db.get(Package, (package_id, photographer.id))
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")

    images = list(package.sample_images or [])
    if len(images) >= 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A service can have at most 8 sample images",
        )

    sample_id = _generate_id("smp")
    image_path = await _save_upload(file, f"{photographer.id}_{package_id}_{sample_id}")
    images.append(image_path)
    package.sample_images = images
    flag_modified(package, "sample_images")

    db.commit()
    db.refresh(package)
    return PackageOut.model_validate(package)


@router.delete(
    "/me/packages/{package_id}/samples",
    response_model=PackageOut,
)
def delete_my_package_sample(
    package_id: str,
    image: str = Query(..., description="Sample image path to remove"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.photographer, UserRole.admin)),
) -> PackageOut:
    photographer = _get_owned_photographer(db, current_user)
    package = db.get(Package, (package_id, photographer.id))
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")

    images = list(package.sample_images or [])
    if image not in images:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sample image not found")

    images.remove(image)
    package.sample_images = images
    flag_modified(package, "sample_images")
    _unlink_upload(image)

    db.commit()
    db.refresh(package)
    return PackageOut.model_validate(package)


@router.delete("/me/packages/{package_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_package(
    package_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.photographer, UserRole.admin)),
) -> None:
    photographer = _get_owned_photographer(db, current_user)
    package = db.get(Package, (package_id, photographer.id))
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")

    for image_path in package.sample_images or []:
        _unlink_upload(image_path)

    db.delete(package)
    db.commit()


@router.post(
    "/me/portfolio",
    response_model=PortfolioItemOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_my_portfolio_item(
    file: UploadFile = File(...),
    category: str = Form("General"),
    alt: str = Form(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.photographer, UserRole.admin)),
) -> PortfolioItemOut:
    photographer = _get_owned_photographer(db, current_user)
    item_id = _generate_id("port")
    while db.get(PortfolioItem, (item_id, photographer.id)):
        item_id = _generate_id("port")

    image_path = await _save_upload(file, f"{photographer.id}_{item_id}")
    item = PortfolioItem(
        id=item_id,
        photographer_id=photographer.id,
        image=image_path,
        category=category or "General",
        alt=alt or photographer.name,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return PortfolioItemOut.model_validate(item)


@router.delete("/me/portfolio/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_portfolio_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.photographer, UserRole.admin)),
) -> None:
    photographer = _get_owned_photographer(db, current_user)
    item = db.get(PortfolioItem, (item_id, photographer.id))
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio item not found",
        )

    _unlink_upload(item.image)

    db.delete(item)
    db.commit()


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

    if current_user.role == UserRole.photographer.value:
        existing = (
            db.query(Photographer).filter(Photographer.user_id == current_user.id).first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Photographer profile already exists",
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

    _apply_photographer_update(photographer, payload)
    db.commit()
    updated = (
        db.query(Photographer)
        .options(*_load_options())
        .filter(Photographer.id == photographer_id)
        .first()
    )
    return _to_out(updated)
