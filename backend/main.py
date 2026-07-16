from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.routers import auth, bookings, categories, photographers, users
from app.seed import seed_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    Base.metadata.create_all(bind=engine)
    if settings.seed_on_startup:
        seed_database()
    yield


settings = get_settings()

app = FastAPI(
    title="Aureo API",
    description="Backend API for photographers, categories, users, and bookings",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(categories.router)
app.include_router(photographers.router)
app.include_router(bookings.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
