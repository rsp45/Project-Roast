# Project Roast

AI Trade Interrogator: a production-grade web app (Next.js) + analytics API (FastAPI) for importing trades, computing metrics, and interrogating performance with evidence.

## Repo layout
- `web/` Next.js dashboard (Vercel-ready)
- `api/` FastAPI backend (Postgres + Alembic)
- `.trae/documents/` PRD + technical architecture

## Local development

### Web
1. `cp web/.env.example web/.env.local`
2. `cd web && pnpm install --no-frozen-lockfile`
3. `cd web && pnpm dev`

### API
1. `cp api/.env.example api/.env`
2. Set `DATABASE_URL` / `DATABASE_URL_SYNC` to a running Postgres instance
3. `cd api && uv sync`
4. `cd api && uv run alembic upgrade head`
5. `cd api && uv run uvicorn project_roast_api.main:app --reload --host 0.0.0.0 --port 8000`

## Deployment
- Follow [DEPLOYMENT.md](file:///workspace/DEPLOYMENT.md)
