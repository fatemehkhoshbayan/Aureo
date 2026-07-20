from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.deps import get_current_user
from app.email import send_booking_cancelled_email, send_booking_confirmed_email
from app.models import Booking, BookingStatus, Package, User, UserRole
from app.schemas import BookingCreate, BookingOut

router = APIRouter(prefix="/bookings", tags=["bookings"])


def _get_owned_booking(booking_id: str, db: Session, current_user: User) -> Booking:
    booking = (
        db.query(Booking)
        .options(joinedload(Booking.photographer), joinedload(Booking.user))
        .filter(Booking.id == booking_id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if current_user.role != UserRole.admin.value and booking.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return booking


def _contact_email_override(account_email: str, contact_email: str | None) -> str | None:
    """Return a contact email only when it differs from the account email."""
    if not contact_email:
        return None
    normalized = str(contact_email).strip().lower()
    if not normalized or normalized == account_email.strip().lower():
        return None
    return normalized


def _queue_booking_email(
    background_tasks: BackgroundTasks,
    *,
    recipient: User,
    booking: Booking,
    kind: str,
) -> None:
    if not recipient.email_notifications:
        return

    photographer_name = booking.photographer.name if booking.photographer else "your photographer"
    payload = {
        "to": booking.contact_email or recipient.email,
        "user_name": recipient.full_name,
        "photographer_name": photographer_name,
        "package_name": booking.package_name,
        "scheduled_at": booking.scheduled_at,
        "price": booking.price,
        "booking_id": booking.id,
    }
    if kind == "confirmed":
        background_tasks.add_task(send_booking_confirmed_email, **payload)
    else:
        background_tasks.add_task(send_booking_cancelled_email, **payload)


@router.get("", response_model=list[BookingOut])
def list_bookings(
    status_filter: str | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[BookingOut]:
    query = db.query(Booking)
    if current_user.role != UserRole.admin.value:
        query = query.filter(Booking.user_id == current_user.id)
    if status_filter:
        query = query.filter(Booking.status == status_filter)
    bookings = query.order_by(Booking.scheduled_at.desc()).all()
    return [BookingOut.model_validate(b) for b in bookings]


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BookingOut:
    package = db.get(Package, (payload.packageId, payload.photographerId))
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")

    contact_email = _contact_email_override(current_user.email, payload.contactEmail)

    booking = Booking(
        id=f"b-{uuid4().hex[:10]}",
        user_id=current_user.id,
        photographer_id=payload.photographerId,
        package_id=package.id,
        package_name=package.name,
        price=package.price,
        duration=package.duration,
        scheduled_at=payload.scheduledAt,
        status=BookingStatus.upcoming.value,
        notes=payload.notes,
        contact_email=contact_email,
    )
    db.add(booking)
    db.commit()
    booking = (
        db.query(Booking)
        .options(joinedload(Booking.photographer), joinedload(Booking.user))
        .filter(Booking.id == booking.id)
        .one()
    )
    _queue_booking_email(
        background_tasks,
        recipient=current_user,
        booking=booking,
        kind="confirmed",
    )
    return BookingOut.model_validate(booking)


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BookingOut:
    booking = _get_owned_booking(booking_id, db, current_user)
    return BookingOut.model_validate(booking)


@router.patch("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(
    booking_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BookingOut:
    booking = _get_owned_booking(booking_id, db, current_user)
    if booking.status == BookingStatus.cancelled.value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already cancelled")
    if booking.status != BookingStatus.upcoming.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only upcoming bookings can be cancelled",
        )
    booking.status = BookingStatus.cancelled.value
    db.commit()
    db.refresh(booking)
    recipient = booking.user or current_user
    _queue_booking_email(
        background_tasks,
        recipient=recipient,
        booking=booking,
        kind="cancelled",
    )
    return BookingOut.model_validate(booking)
