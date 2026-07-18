.PHONY: build up down logs seed fmt migrate revision shell-backend shell-db ps

# Rebuild images and start the stack (attached)
build:
	docker compose up --build

# Start existing images (attached)
up:
	docker compose up

# Stop and remove containers
down:
	docker compose down

# Follow logs for all services
logs:
	docker compose logs -f

# Show running services
ps:
	docker compose ps

# Seed the database (idempotent — skips rows that already exist)
seed:
	docker compose exec backend python -m app.seed

# Format frontend with Prettier
fmt:
	cd frontend && npx prettier --write .

# Apply Alembic migrations inside the backend container
migrate:
	docker compose exec backend alembic upgrade head

# Create a new Alembic revision: make revision msg="add bookings cancel"
revision:
	docker compose exec backend alembic revision --autogenerate -m "$(msg)"

# Open a shell in the backend container
shell-backend:
	docker compose exec backend /bin/sh

# Open a psql shell in the database container
shell-db:
	docker compose exec db psql -U aureo -d aureo
