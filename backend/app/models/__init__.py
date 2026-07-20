from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    ForeignKeyConstraint,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, Enum):
    customer = "customer"
    photographer = "photographer"
    admin = "admin"


class BookingStatus(str, Enum):
    completed = "completed"
    upcoming = "upcoming"
    cancelled = "cancelled"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    avatar: Mapped[str | None] = mapped_column(String(500), nullable=True)
    email_notifications: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default=UserRole.customer.value)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    photographer: Mapped["Photographer | None"] = relationship(
        back_populates="user", uselist=False
    )
    bookings: Mapped[list["Booking"]] = relationship(back_populates="user")
    favorites: Mapped[list["Favorite"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    label: Mapped[str] = mapped_column(String(100), nullable=False)
    image: Mapped[str] = mapped_column(String(255), nullable=False)
    price_from: Mapped[int] = mapped_column(Integer, nullable=False)


class Photographer(Base):
    __tablename__ = "photographers"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar: Mapped[str] = mapped_column(String(255), nullable=False)
    cover: Mapped[str] = mapped_column(String(255), nullable=False)
    specialties: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    bio: Mapped[str] = mapped_column(Text, nullable=False)
    experience: Mapped[int] = mapped_column(Integer, nullable=False)
    rating: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    review_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    starting_price: Mapped[int] = mapped_column(Integer, nullable=False)
    featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), unique=True, nullable=True)

    user: Mapped["User | None"] = relationship(back_populates="photographer")
    portfolio: Mapped[list["PortfolioItem"]] = relationship(
        back_populates="photographer", cascade="all, delete-orphan"
    )
    packages: Mapped[list["Package"]] = relationship(
        back_populates="photographer", cascade="all, delete-orphan"
    )
    reviews: Mapped[list["Review"]] = relationship(
        back_populates="photographer", cascade="all, delete-orphan"
    )
    bookings: Mapped[list["Booking"]] = relationship(back_populates="photographer")
    favorited_by: Mapped[list["Favorite"]] = relationship(
        back_populates="photographer", cascade="all, delete-orphan"
    )


class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    photographer_id: Mapped[str] = mapped_column(
        ForeignKey("photographers.id"), primary_key=True, nullable=False
    )
    image: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    alt: Mapped[str] = mapped_column(String(255), nullable=False)

    photographer: Mapped["Photographer"] = relationship(back_populates="portfolio")


class Package(Base):
    __tablename__ = "packages"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    photographer_id: Mapped[str] = mapped_column(
        ForeignKey("photographers.id"), primary_key=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    duration: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    includes: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    sample_images: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    photographer: Mapped["Photographer"] = relationship(back_populates="packages")
    bookings: Mapped[list["Booking"]] = relationship(back_populates="package")


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    photographer_id: Mapped[str] = mapped_column(
        ForeignKey("photographers.id"), primary_key=True, nullable=False
    )
    author: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar: Mapped[str] = mapped_column(String(255), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    service: Mapped[str] = mapped_column(String(255), nullable=False)

    photographer: Mapped["Photographer"] = relationship(back_populates="reviews")


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (
        ForeignKeyConstraint(
            ["package_id", "photographer_id"],
            ["packages.id", "packages.photographer_id"],
        ),
    )

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    photographer_id: Mapped[str] = mapped_column(ForeignKey("photographers.id"), nullable=False)
    package_id: Mapped[str] = mapped_column(String(50), nullable=False)
    package_name: Mapped[str] = mapped_column(String(255), nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    duration: Mapped[str] = mapped_column(String(100), nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=BookingStatus.upcoming.value
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Set when the booking form email differs from the account email.
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="bookings")
    photographer: Mapped["Photographer"] = relationship(back_populates="bookings")
    package: Mapped["Package"] = relationship(back_populates="bookings")


class Favorite(Base):
    __tablename__ = "favorites"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    photographer_id: Mapped[str] = mapped_column(
        ForeignKey("photographers.id"), primary_key=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="favorites")
    photographer: Mapped["Photographer"] = relationship(back_populates="favorited_by")
