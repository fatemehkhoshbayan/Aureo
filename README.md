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
# set DATABASE_URL=postgresql+psycopg2://aureo:aureo@localhost:5432/aureo
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
| PATCH | `/users/me` | authenticated (profile: name, email, phone, location, avatar, email notifications) |
| POST | `/users/me/avatar` | authenticated (multipart image upload, max 2 MB) |
| GET | `/users` | admin |
| GET | `/users/{id}` | admin or self |
| GET | `/bookings` | authenticated (own; admin sees all). `?status=` |
| GET | `/bookings/{id}` | owner or admin |
| PATCH | `/bookings/{id}/cancel` | owner or admin (upcoming only) |

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

### Deploy backend on Render + Neon

**1. Neon database**

1. Create a project at [https://console.neon.tech](https://console.neon.tech).
2. Open **Dashboard → Connection details**.
3. Copy the connection string (include `?sslmode=require`), e.g.  
   `postgresql://user:pass@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require`

**2. Render web service**

1. [Render Dashboard](https://dashboard.render.com) → **New → Web Service** → connect this repo.
2. Settings:

   | Setting | Value |
   |---------|--------|
   | Root Directory | `backend` |
   | Runtime | **Docker** |
   | Health Check Path | `/health` |
   | Plan | Free |

3. Environment variables:

   | Key | Value |
   |-----|--------|
   | `DATABASE_URL` | Neon connection string from step 1 |
   | `JWT_SECRET` | long random string |
   | `SEED_ON_STARTUP` | `true` |
   | `CORS_ORIGINS` | `http://localhost:4200,https://your-app.vercel.app` |

4. Deploy → open `https://YOUR-SERVICE.onrender.com/docs`.

(`postgres://` / `postgresql://` URLs are normalized for SQLAlchemy automatically.)

Free Render web services **spin down** after idle; the first request can take ~30–60s.

## Frontend

Angular app under `frontend/`. See [`frontend/README.md`](frontend/README.md) for structure, routes, and feature details.

**Pages**

| Path | Description |
|------|-------------|
| `/` | Browse & filter photographers |
| `/photographer/:id` | Photographer profile, portfolio, packages |
| `/my-bookings` | Booking stats, upcoming/past list, cancel, favorites |
| `/my-profile` | Login, edit profile/avatar, theme & email preferences |

Photographers, categories, auth, bookings, and profile updates load from the API. Favorites are stored client-side.

Set the backend URL in [`frontend/src/environment.ts`](frontend/src/environment.ts):

```ts
apiBase: '/api'                               // Docker Compose (nginx → backend)
// apiBase: 'http://localhost:8000'           // ng serve talking to local API
// apiBase: 'https://YOUR-SERVICE.onrender.com' // Vercel → Render
```

### Makefile helpers

From the repo root (Docker stack running):

```bash
make up        # start stack
make migrate   # alembic upgrade head
make seed      # re-seed demo data
make fmt       # prettier on frontend
```

### Deploy on Vercel

1. Set `apiBase` to your Render URL in `src/environment.ts`.
2. Vercel → **Settings → General → Root Directory** → `frontend`.
3. **Node.js Version** → `22.x`.
4. Build: `npm run build` → Output: `dist/aureo/browser`.
5. On Render, set `CORS_ORIGINS` to your Vercel URL.
