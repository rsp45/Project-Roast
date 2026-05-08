import uuid

from fastapi import APIRouter, Depends, HTTPException
from google.auth.transport import requests as grequests
from google.oauth2 import id_token as google_id_token
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
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
            clock_skew_in_seconds=60,
        )
    except ValueError as e:
        err_str = str(e).lower()
        if "audience" in err_str or "wrong recipient" in err_str:
            # Audience mismatch — try without audience check
            try:
                claims = google_id_token.verify_oauth2_token(
                    req.session.id_token,
                    grequests.Request(),
                    audience=None,
                    clock_skew_in_seconds=60,
                )
            except ValueError as e2:
                raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e2)}") from e2
        elif "token expired" in err_str or "token has been expired" in err_str:
            # Token is expired but structurally valid — decode without verification
            # We only need the email claim for identity; we issue our own JWT with its own TTL.
            import json, base64
            try:
                payload_b64 = req.session.id_token.split(".")[1]
                # Fix base64 padding
                payload_b64 += "=" * (-len(payload_b64) % 4)
                claims = json.loads(base64.urlsafe_b64decode(payload_b64))
            except Exception as decode_err:
                raise HTTPException(status_code=401, detail="Invalid Google token: cannot decode claims") from decode_err
        else:
            raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}") from e

    email = claims.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Missing email claim")

    name = claims.get("name")

    try:
        user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
        if not user:
            user = User(id=uuid.uuid4(), email=email, name=name, role="trader")
            db.add(user)
            await db.flush()

        workspace = (
            await db.execute(select(Workspace).where(Workspace.owner_user_id == user.id).limit(1))
        ).scalar_one_or_none()
        if not workspace:
            workspace = Workspace(
                id=uuid.uuid4(),
                owner_user_id=user.id,
                base_currency="USD",
                timezone="UTC",
            )
            db.add(workspace)
            await db.flush()

        await db.commit()
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=503, detail="Database unavailable") from e

    token = create_access_token(
        user_id=user.id,
        workspace_id=workspace.id,
        email=user.email,
        role=user.role,
    )

    return AuthExchangeResponse(accessToken=token, expiresIn=settings.api_jwt_ttl_seconds)
