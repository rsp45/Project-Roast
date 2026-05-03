# Deployment

Recommended stack:
- Web: Vercel
- API: Render (Docker)
- DB: Neon Postgres

## 1) Database (Neon)
1. Create a Neon project + database.
2. Copy the connection strings:
   - `DATABASE_URL` (async): `postgresql+asyncpg://...`
   - `DATABASE_URL_SYNC` (sync): `postgresql+psycopg://...`

## 2) API (Render)
1. Create a new Render service from this repo (Blueprint).
2. Render will detect [render.yaml](file:///workspace/render.yaml) and create `project-roast-api`.
3. Set env vars:
   - `DATABASE_URL`
   - `DATABASE_URL_SYNC`
   - `API_JWT_SECRET` (at least 32 chars)
   - `API_JWT_TTL_SECONDS` (default 900)
   - `GOOGLE_CLIENT_ID` (same as web)
   - `WEB_ORIGIN` (your Vercel URL, e.g. `https://project-roast.vercel.app`)
4. Deploy and confirm `/healthz` returns `{ "ok": true }`.

## 3) Web (Vercel)
1. Import the `web/` project in Vercel.
2. Configure env vars:
   - `NEXTAUTH_URL` (your Vercel URL)
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXT_PUBLIC_API_BASE_URL` (your Render API base URL, e.g. `https://project-roast-api.onrender.com`)
   - `API_BASE_URL` (same as above)
3. Deploy.

## 4) Smoke test
1. Sign in with Google.
2. Go to Upload and import a CSV.
3. Check Portfolio KPIs update and Trades table loads.
4. Ask: “What is my win rate?” (requires `pnl` column in CSV).
