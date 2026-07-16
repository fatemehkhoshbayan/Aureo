from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# --- Auth / Users ---

UserRole = Literal["customer", "photographer", "admin"]


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=1)
    role: UserRole = "customer"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str  # plain str — EmailStr rejects reserved TLDs like .local
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int | None = None


# --- Categories ---

class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    label: str
    image: str
    from_: int = Field(alias="from", serialization_alias="from")


# --- Photographer nested ---

class PortfolioItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    image: str
    category: str
    alt: str


class PackageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    price: int
    duration: str
    description: str
    includes: list[str]


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    author: str
    avatar: str
    rating: int
    date: str
    text: str
    service: str


class PortfolioItemCreate(BaseModel):
    id: str
    image: str
    category: str
    alt: str


class PackageCreate(BaseModel):
    id: str
    name: str
    price: int
    duration: str
    description: str
    includes: list[str]


class ReviewCreate(BaseModel):
    id: str
    author: str
    avatar: str
    rating: int
    date: str
    text: str
    service: str


class PhotographerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    name: str
    avatar: str
    cover: str
    specialties: list[str]
    bio: str
    experience: int
    rating: float
    reviewCount: int = Field(validation_alias="review_count")
    location: str
    startingPrice: int = Field(validation_alias="starting_price")
    featured: bool
    portfolio: list[PortfolioItemOut] = []
    packages: list[PackageOut] = []
    reviews: list[ReviewOut] = []


class PhotographerCreate(BaseModel):
    id: str
    name: str
    avatar: str
    cover: str
    specialties: list[str]
    bio: str
    experience: int
    rating: float = 0.0
    reviewCount: int = 0
    location: str
    startingPrice: int
    featured: bool = False
    portfolio: list[PortfolioItemCreate] = []
    packages: list[PackageCreate] = []
    reviews: list[ReviewCreate] = []


class PhotographerUpdate(BaseModel):
    name: str | None = None
    avatar: str | None = None
    cover: str | None = None
    specialties: list[str] | None = None
    bio: str | None = None
    experience: int | None = None
    rating: float | None = None
    reviewCount: int | None = None
    location: str | None = None
    startingPrice: int | None = None
    featured: bool | None = None


# --- Bookings ---

BookingStatus = Literal["completed", "upcoming", "cancelled"]


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    userId: int = Field(validation_alias="user_id")
    photographerId: str = Field(validation_alias="photographer_id")
    packageId: str = Field(validation_alias="package_id")
    packageName: str = Field(validation_alias="package_name")
    price: int
    duration: str
    scheduledAt: datetime = Field(validation_alias="scheduled_at")
    status: BookingStatus
    notes: str | None = None
    createdAt: datetime = Field(validation_alias="created_at")
