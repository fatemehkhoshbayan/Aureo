# Aureo

Photography booking platform — Angular frontend + FastAPI backend.

## Backend (FastAPI)

### Stack

- FastAPI + Uvicorn
- PostgreSQL 16
- SQLAlchemy 2 + Alembic
- JWT auth (`customer` | `photographer` | `admin`)

### Quick start (Docker)

```bash
docker compose up --build db backend
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

Health check: `GET http://localhost:8000/health`

On startup the backend creates tables and seeds data when `SEED_ON_STARTUP=true`.

### Local run (without Docker for the API)

1. Start Postgres (or use Compose for DB only):

```bash
docker compose up -d db
```

2. Copy env and install deps:

```bash
cd backend
cp .env.example .env
# set DATABASE_URL=postgresql+psycopg2://ticketnest:ticketnest@localhost:5432/ticketnest
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

3. Create tables + seed, then run:

```bash
python -m app.seed
uvicorn main:app --reload --port 8000
```

Optional Alembic migration (schema already matches `create_all`):

```bash
alembic upgrade head
```

### Endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/categories` | public |
| GET | `/categories/{id}` | public |
| GET | `/photographers` | public (`?specialty=&featured=`) |
| GET | `/photographers/{id}` | public |
| POST | `/photographers` | admin or photographer |
| PATCH | `/photographers/{id}` | admin or owning photographer |
| POST | `/auth/register` | public |
| POST | `/auth/login` | public (form: `username`=email, `password`) |
| GET | `/users/me` | authenticated |
| GET | `/users` | admin |
| GET | `/users/{id}` | admin or self |
| GET | `/bookings` | authenticated (own; admin sees all). `?status=` |
| GET | `/bookings/{id}` | owner or admin |

### Demo users (seeded)

| Email | Password | Role |
|-------|----------|------|
| `admin@example.com` | `admin123` | admin |
| `customer@example.com` | `customer123` | customer (4 sample bookings) |
| `photographer@example.com` | `photo123` | photographer (linked to `p7`) |

Seed includes 8 categories, photographers `p1`–`p10`, and for **Casey Customer**:

| Booking | Photographer | Package | When | Status |
|---------|--------------|---------|------|--------|
| `b1` | Isabelle Fontaine (`p1`) | Portrait Session | 2025-11-12 | completed |
| `b2` | Aiko Nakamura (`p3`) | Family Session | 2026-02-08 | completed |
| `b3` | Marcus Webb (`p2`) | Headshot Session | 2026-04-20 | completed |
| `b4` | Valentina Cruz (`p5`) | Creative Portrait | 2026-08-15 | upcoming |

### Environment

See [`backend/.env.example`](backend/.env.example):

- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGINS`
- `SEED_ON_STARTUP`

## Frontend

Angular app under `frontend/`. Not wired to this API yet — still uses local mock constants.
