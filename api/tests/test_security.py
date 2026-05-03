import importlib
import uuid


def test_token_roundtrip(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://x:x@localhost:5432/x")
    monkeypatch.setenv("DATABASE_URL_SYNC", "postgresql+psycopg://x:x@localhost:5432/x")
    monkeypatch.setenv("API_JWT_SECRET", "test-secret-test-secret-test-secret-32")
    monkeypatch.setenv("API_JWT_TTL_SECONDS", "900")
    monkeypatch.setenv("GOOGLE_CLIENT_ID", "test-google-client-id")
    monkeypatch.setenv("WEB_ORIGIN", "http://localhost:3000")

    config = importlib.import_module("project_roast_api.config")
    importlib.reload(config)

    security = importlib.import_module("project_roast_api.security")
    importlib.reload(security)

    user_id = uuid.uuid4()
    workspace_id = uuid.uuid4()

    token = security.create_access_token(
        user_id=user_id,
        workspace_id=workspace_id,
        email="test@example.com",
        role="trader",
    )
    principal = security.decode_access_token(token)
    assert principal.user_id == user_id
    assert principal.workspace_id == workspace_id
    assert principal.email == "test@example.com"
