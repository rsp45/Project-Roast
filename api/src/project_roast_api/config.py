from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def sanitize_async_database_url(url: str) -> str:
    parts = urlsplit(url)
    query_items = parse_qsl(parts.query, keep_blank_values=True)
    filtered_items = []

    for key, value in query_items:
        key_lower = key.lower()
        if key_lower in {"sslmode", "channel_binding", "ssl"}:
            continue
        filtered_items.append((key, value))

    filtered_items.append(("ssl", "require"))
    sanitized_query = urlencode(filtered_items, doseq=True)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, sanitized_query, parts.fragment))


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    database_url_sync: str

    api_jwt_secret: str = Field(min_length=32)
    api_jwt_ttl_seconds: int = 900

    google_client_id: str
    web_origin: str = "http://localhost:3000"


settings = Settings()
