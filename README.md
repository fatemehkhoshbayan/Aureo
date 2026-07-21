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

On startup the backend seeds data when `SEED_ON_STARTUP=true`. Alembic is the sole source of schema truth: in Docker, `alembic upgrade head` runs before Uvicorn starts. `AUTO_CREATE_TABLES` defaults to `false` everywhere; set it to `true` in your local `.env` if you want to run the API bare (no Docker, no manual `alembic upgrade head`) and have tables created automatically via SQLAlchemy on startup instead.

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

3. Apply migrations (required now that `AUTO_CREATE_TABLES` defaults to `false`; set `AUTO_CREATE_TABLES=true` in `.env` instead if you'd rather skip this step), seed, then run:

```bash
alembic upgrade head
python -m app.seed
uvicorn main:app --reload --port 8000
```

#### Writing migrations

Every migration's `upgrade()` must guard each `create_table`/`add_column`/`create_index` with the helpers in [`app/migration_utils.py`](backend/app/migration_utils.py) (`has_table`, `has_column`, `has_index`) before creating the object, e.g.:

```python
def upgrade() -> None:
    bind = op.get_bind()
    if not has_table(bind, "bookings"):
        op.create_table("bookings", ...)
    if not has_column(bind, "bookings", "contact_email"):
        op.add_column("bookings", sa.Column("contact_email", ...))
```

This keeps `alembic upgrade head` safe to re-run against any database state — empty, partially migrated, or one where a table/column was created some other way — so a schema drift never turns into a `DuplicateTable`/`DuplicateColumn` deploy failure again. Verify a new migration by running `alembic upgrade head` twice in a row; the second run should be a no-op.

### Endpoints

| Method | Path                               | Auth                                                                               |
| ------ | ---------------------------------- | ---------------------------------------------------------------------------------- |
| GET    | `/categories`                      | public                                                                             |
| GET    | `/categories/{id}`                 | public                                                                             |
| GET    | `/photographers`                   | public (`?specialty=&featured=`)                                                   |
| GET    | `/photographers/me`                | photographer or admin (own profile)                                                |
| POST   | `/photographers/me`                | photographer or admin (create own profile)                                         |
| PATCH  | `/photographers/me`                | photographer or admin (update own profile)                                         |
| POST   | `/photographers/me/avatar`         | photographer or admin                                                              |
| POST   | `/photographers/me/cover`          | photographer or admin                                                              |
| POST   | `/photographers/me/packages`       | photographer or admin                                                              |
| PATCH  | `/photographers/me/packages/{id}`  | photographer or admin                                                              |
| DELETE | `/photographers/me/packages/{id}`  | photographer or admin                                                              |
| POST   | `/photographers/me/portfolio`      | photographer or admin (multipart)                                                  |
| DELETE | `/photographers/me/portfolio/{id}` | photographer or admin                                                              |
| GET    | `/photographers/{id}`              | public                                                                             |
| POST   | `/photographers`                   | admin or photographer                                                              |
| PATCH  | `/photographers/{id}`              | admin or owning photographer                                                       |
| POST   | `/auth/register`                   | public (rate-limited)                                                              |
| POST   | `/auth/login`                      | public (form: `username`=email, `password`; rate-limited)                          |
| GET    | `/users/me`                        | authenticated                                                                      |
| PATCH  | `/users/me`                        | authenticated (profile: name, email, phone, location, avatar, email notifications) |
| POST   | `/users/me/avatar`                 | authenticated (multipart image upload, max 2 MB)                                   |
| GET    | `/users`                           | admin                                                                              |
| GET    | `/users/{id}`                      | admin or self                                                                      |
| GET    | `/bookings`                        | authenticated (own; admin sees all). `?status=`                                    |
| POST   | `/bookings`                        | authenticated (create upcoming booking)                                            |
| GET    | `/bookings/{id}`                   | owner or admin                                                                     |
| PATCH  | `/bookings/{id}/cancel`            | owner or admin (upcoming only)                                                     |
| GET    | `/favorites`                       | authenticated (list of photographer ids)                                           |
| PUT    | `/favorites/{photographer_id}`     | authenticated                                                                      |
| DELETE | `/favorites/{photographer_id}`     | authenticated                                                                      |
| POST   | `/contact`                         | public (rate-limited); emails the message via SMTP                                 |

### Demo users (seeded)

| Email                      | Password      | Role                          |
| -------------------------- | ------------- | ----------------------------- |
| `admin@example.com`        | `admin123`    | admin                         |
| `customer@example.com`     | `customer123` | customer (4 sample bookings)  |
| `photographer@example.com` | `photo123`    | photographer (linked to `p7`) |

Seed includes 8 categories, photographers `p1`–`p10`, and for **Casey Customer**:

| Booking | Photographer             | Package           | When       | Status    |
| ------- | ------------------------ | ----------------- | ---------- | --------- |
| `b1`    | Isabelle Fontaine (`p1`) | Portrait Session  | 2025-11-12 | completed |
| `b2`    | Aiko Nakamura (`p3`)     | Family Session    | 2026-02-08 | completed |
| `b3`    | Marcus Webb (`p2`)       | Headshot Session  | 2026-04-20 | completed |
| `b4`    | Valentina Cruz (`p5`)    | Creative Portrait | 2026-08-15 | upcoming  |

### Environment

For Docker Compose secrets, copy the root template and edit locally (never commit `.env`):

```bash
cp .env.example .env
```

- Root [`.env.example`](.env.example): `JWT_SECRET`, `SMTP_*` (used by `docker compose`)
- Backend [`backend/.env.example`](backend/.env.example): same plus `DATABASE_URL` / `CORS_ORIGINS` when running the API outside Docker

SMTP notes: if `SMTP_HOST` is empty, booking emails are logged instead of sent.

To send booking emails to **any** recipient (Gmail, Gmail `+alias`, Yahoo, etc.) without owning/verifying a domain, use your own Gmail account as the SMTP relay:

1. Enable **2-Step Verification** on your Google account (required for App Passwords)
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) and create an App Password for "Mail"
3. Set in `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-address@gmail.com
   SMTP_PASSWORD=<the 16-char app password>
   SMTP_FROM=Aureo <your-address@gmail.com>
   SMTP_TLS=true
   ```
4. Restart: `docker compose up -d --force-recreate backend`

Note: providers like [Resend](https://resend.com) only allow sending to your own signup email until you verify a domain you own — they won't work for arbitrary recipients without that step.

### Deploy backend on Render + Neon

**1. Neon database**

1. Create a project at [https://console.neon.tech](https://console.neon.tech).
2. Open **Dashboard → Connection details**.
3. Copy the connection string (include `?sslmode=require`), e.g.  
   `postgresql://user:pass@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require`

**2. Render web service**

1. [Render Dashboard](https://dashboard.render.com) → **New → Web Service** → connect this repo.
2. Settings:

   | Setting           | Value      |
   | ----------------- | ---------- |
   | Root Directory    | `backend`  |
   | Runtime           | **Docker** |
   | Health Check Path | `/health`  |
   | Plan              | Free       |

3. Environment variables:

   | Key                  | Value                                               |
   | -------------------- | --------------------------------------------------- |
   | `DATABASE_URL`       | Neon connection string from step 1                  |
   | `JWT_SECRET`         | long random string                                  |
   | `SEED_ON_STARTUP`    | `true`                                              |
   | `AUTO_CREATE_TABLES` | `false` (Alembic runs in the Docker entrypoint)     |
   | `CORS_ORIGINS`       | `http://localhost:4200,https://your-app.vercel.app` |

4. Deploy → open `https://YOUR-SERVICE.onrender.com/docs`.

(`postgres://` / `postgresql://` URLs are normalized for SQLAlchemy automatically.)

Free Render web services **spin down** after idle; the first request can take ~30–60s.

## Frontend

Angular app under `frontend/`. See [`frontend/README.md`](frontend/README.md) for structure, routes, and feature details.

**Pages**

| Path                      | Description                                                              |
| ------------------------- | ------------------------------------------------------------------------ |
| `/`                       | Browse & filter photographers                                            |
| `/photographer/:id`       | Photographer profile, portfolio, packages                                |
| `/book/:id`               | 3-step booking form (package, details, confirmation)                     |
| `/my-bookings`            | Booking stats, upcoming/past list, cancel, favorites                     |
| `/my-profile`             | Login / customer sign-up, edit profile/avatar, theme & email preferences |
| `/become-a-photographer`  | Photographer sign-up                                                     |
| `/photographer/dashboard` | Photographer self-service: profile, services, portfolio (auth + role)    |
| `/contact`                | Contact form — emails the Aureo inbox via `POST /contact`               |
| `/terms`                  | Terms of Service (static)                                                |
| `/privacy`                | Privacy Policy (static)                                                  |

Photographers, categories, auth, bookings, favorites, and profile updates load from the API. Toasts use a shared host in the main layout.

Set the backend URL in [`frontend/src/environment.ts`](frontend/src/environment.ts):

```ts
apiBase: "/api"; // Docker Compose (nginx → backend)
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
