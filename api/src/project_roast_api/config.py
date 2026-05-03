from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    database_url_sync: str

    api_jwt_secret: str = Field(min_length=32)
    api_jwt_ttl_seconds: int = 900

    google_client_id: str
    web_origin: str = "http://localhost:3000"


settings = Settings()
