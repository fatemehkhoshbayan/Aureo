from fastapi import APIRouter, Request, status

from app.email import send_contact_message_email
from app.rate_limit import limiter
from app.schemas import ContactMessageCreate

router = APIRouter(prefix="/contact", tags=["contact"])

CONTACT_INBOX = "f.khoshbayan@gmail.com"


@router.post("", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("3/minute")
def send_contact_message(request: Request, payload: ContactMessageCreate) -> None:
    send_contact_message_email(
        to=CONTACT_INBOX,
        full_name=payload.fullName,
        reply_to=payload.email,
        message=payload.message,
    )
