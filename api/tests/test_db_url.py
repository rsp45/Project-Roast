import importlib
import sys
from pathlib import Path
from urllib.parse import parse_qsl, urlsplit


API_ROOT = Path(__file__).resolve().parents[1]
SRC_PATH = API_ROOT / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))


def load_config(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://x:x@localhost:5432/x")
    monkeypatch.setenv("DATABASE_URL_SYNC", "postgresql+psycopg://x:x@localhost:5432/x")
    monkeypatch.setenv("API_JWT_SECRET", "test-secret-test-secret-test-secret-32")
    monkeypatch.setenv("API_JWT_TTL_SECONDS", "900")
    monkeypatch.setenv("GOOGLE_CLIENT_ID", "test-google-client-id")
    monkeypatch.setenv("WEB_ORIGIN", "http://localhost:3000")
    config = importlib.import_module("project_roast_api.config")
    return importlib.reload(config)


def test_sanitize_async_database_url_strips_neon_params(monkeypatch):
    config = load_config(monkeypatch)
    raw = (
        "postgresql+asyncpg://user:pass@localhost:5432/db"
        "?sslmode=require&channel_binding=require&application_name=roast"
    )

    sanitized = config.sanitize_async_database_url(raw)
    params = dict(parse_qsl(urlsplit(sanitized).query))

    assert params["ssl"] == "require"
    assert "sslmode" not in params
    assert "channel_binding" not in params
    assert params["application_name"] == "roast"
