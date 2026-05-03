set -e

alembic upgrade head
exec uvicorn project_roast_api.main:app --host 0.0.0.0 --port "${PORT:-8000}"
