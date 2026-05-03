import uuid

from fastapi import APIRouter, Depends, HTTPException
from google.auth.transport import requests as grequests
from google.oauth2 import id_token as google_id_token
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from project_roast_api.config import settings
from project_roast_api.db import get_db
from project_roast_api.models import User, Workspace
from project_roast_api.schemas import AuthExchangeRequest, AuthExchangeResponse
from project_roast_api.security import create_access_token

router = APIRouter(prefix="/v1/auth", tags=["auth"])


@router.post("/exchange", response_model=AuthExchangeResponse)
async def exchange(req: AuthExchangeRequest, db: AsyncSession = Depends(get_db)):
    if req.session.provider != "google":
        raise HTTPException(status_code=400, detail="Unsupported provider")

    try:
        claims = google_id_token.verify_oauth2_token(
            req.session.id_token,
            grequests.Request(),
            settings.google_client_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail="Invalid Google token") from e

    email = claims.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Missing email claim")

    name = claims.get("name")

    user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if not user:
        user = User(id=uuid.uuid4(), email=email, name=name, role="trader")
        db.add(user)
        await db.flush()

    workspace = (
        await db.execute(select(Workspace).where(Workspace.owner_user_id == user.id).limit(1))
    ).scalar_one_or_none()
    if not workspace:
        workspace = Workspace(id=uuid.uuid4(), owner_user_id=user.id, base_currency="USD", timezone="UTC")
        db.add(workspace)
        await db.flush()

    await db.commit()

    token = create_access_token(
        user_id=user.id,
        workspace_id=workspace.id,
        email=user.email,
        role=user.role,
    )

    return AuthExchangeResponse(accessToken=token, expiresIn=settings.api_jwt_ttl_seconds)
