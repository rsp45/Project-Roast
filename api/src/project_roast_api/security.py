import uuid
from datetime import UTC, datetime, timedelta

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from project_roast_api.config import settings

bearer = HTTPBearer(auto_error=False)


class Principal:
    def __init__(self, *, user_id: uuid.UUID, workspace_id: uuid.UUID, email: str, role: str):
        self.user_id = user_id
        self.workspace_id = workspace_id
        self.email = email
        self.role = role


def create_access_token(*, user_id: uuid.UUID, workspace_id: uuid.UUID, email: str, role: str) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "workspace_id": str(workspace_id),
        "email": email,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=settings.api_jwt_ttl_seconds)).timestamp()),
    }
    return jwt.encode(payload, settings.api_jwt_secret, algorithm="HS256")


def parse_principal(payload: dict) -> Principal:
    try:
        user_id = uuid.UUID(payload["sub"])
        workspace_id = uuid.UUID(payload["workspace_id"])
        email = str(payload["email"])
        role = str(payload["role"])
    except (KeyError, ValueError, TypeError) as e:
        raise HTTPException(status_code=401, detail="Invalid token payload") from e
    return Principal(user_id=user_id, workspace_id=workspace_id, email=email, role=role)


def decode_access_token(token: str) -> Principal:
    try:
        payload = jwt.decode(token, settings.api_jwt_secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError as e:
        raise HTTPException(status_code=401, detail="Token expired") from e
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail="Invalid token") from e
    return parse_principal(payload)


def get_principal(creds: HTTPAuthorizationCredentials | None = Depends(bearer)) -> Principal:
    if not creds or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Missing bearer token")
    return decode_access_token(creds.credentials)
