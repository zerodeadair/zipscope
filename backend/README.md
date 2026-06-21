# ZipScope Property Database Backend

Phase 1 adds the foundation for a statewide North Carolina and Florida property database. It does not replace the current Vercel frontend; it creates the database/API layer that future ingestion connectors will feed.

## Included In Phase 1

- FastAPI application skeleton
- PostgreSQL + PostGIS Docker Compose service
- Redis Docker Compose service for future ingestion queues
- SQLAlchemy model layer for the requested canonical tables
- Alembic setup with an initial schema migration
- Seed script for:
  - `33558` Lutz, FL / Hillsborough County
  - `27030` Mount Airy, NC / Surry County
- Initial API surface for state, county, ZIP, property, owner, ingestion-job, and source-registry reads/writes

## Run Locally

From the repository root:

```bash
docker compose up -d postgres redis
cd backend
copy .env.example .env
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python scripts\seed_phase1.py
uvicorn app.main:app --reload
```

Then open:

```text
http://localhost:8000/health
http://localhost:8000/states
http://localhost:8000/zip/33558/summary
http://localhost:8000/zip/27030/summary
```

## Docker API Service

You can also run the API in Docker:

```bash
docker compose up --build backend
docker compose exec backend alembic upgrade head
docker compose exec backend python scripts/seed_phase1.py
```

## Notes

- Phase 1 is schema and API foundation only.
- County ingestion connectors start in Phase 2.
- Official records and modeled records are intentionally separate. Future ingestion jobs should load raw payloads first, then normalize into canonical tables.
- The schema includes PostGIS geometry fields for parcel boundaries, ZIP boundaries, county boundaries, census tracts, and distance-based comparable ranking.
