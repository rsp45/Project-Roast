# Project Roast API

FastAPI backend for Project Roast (AI Trade Interrogator).

## Local dev

1. Copy env
   - `cp .env.example .env`
2. Install deps
   - `uv sync`
3. Run
   - `uv run uvicorn project_roast_api.main:app --reload --host 0.0.0.0 --port 8000`
