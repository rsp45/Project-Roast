import importlib


def _load_db(monkeypatch, database_url: str):
    monkeypatch.setenv("DATABASE_URL", database_url)
    monkeypatch.setenv("DATABASE_URL_SYNC", "postgresql+psycopg://x:x@localhost:5432/x")
    monkeypatch.setenv("API_JWT_SECRET", "test-secret-test-secret-test-secret-32")
    monkeypatch.setenv("API_JWT_TTL_SECONDS", "900")
    monkeypatch.setenv("GOOGLE_CLIENT_ID", "test-google-client-id")
    monkeypatch.setenv("WEB_ORIGIN", "http://localhost:3000")

    config = importlib.import_module("project_roast_api.config")
    importlib.reload(config)

    db = importlib.import_module("project_roast_api.db")
    importlib.reload(db)
    return db


def test_sanitize_async_database_url_strips_neon_params(monkeypatch):
    db = _load_db(
        monkeypatch,
        "postgresql+asyncpg://user:pass@host/db?sslmode=require&channel_binding=require",
    )

    sanitized = db.sanitize_async_database_url(
        "postgresql+asyncpg://user:pass@host/db?sslmode=require&channel_binding=require",
    )

    assert "sslmode=" not in sanitized
    assert "channel_binding=" not in sanitized
    assert "ssl=require" in sanitized


def test_sanitize_async_database_url_keeps_other_params(monkeypatch):
    db = _load_db(
        monkeypatch,
        "postgresql+asyncpg://user:pass@host/db?sslmode=require&channel_binding=require&foo=bar",
    )

    sanitized = db.sanitize_async_database_url(
        "postgresql+asyncpg://user:pass@host/db?sslmode=require&channel_binding=require&foo=bar",
    )

    assert "foo=bar" in sanitized
    assert "ssl=require" in sanitized
