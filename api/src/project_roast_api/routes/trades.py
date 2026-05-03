import base64
import binascii
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from project_roast_api.db import get_db
from project_roast_api.models import Trade
from project_roast_api.schemas import TradeOut, TradesPage
from project_roast_api.security import Principal, get_principal

router = APIRouter(prefix="/v1/trades", tags=["trades"])


def encode_cursor(executed_at: datetime, trade_id: uuid.UUID) -> str:
    raw = f"{executed_at.isoformat()}|{trade_id}"
    return base64.urlsafe_b64encode(raw.encode("utf-8")).decode("utf-8")


def decode_cursor(cursor: str) -> tuple[datetime, uuid.UUID]:
    try:
        raw = base64.urlsafe_b64decode(cursor.encode("utf-8")).decode("utf-8")
        ts, tid = raw.split("|", maxsplit=1)
        dt = datetime.fromisoformat(ts)
        if not dt.tzinfo:
            dt = dt.replace(tzinfo=UTC)
        return dt, uuid.UUID(tid)
    except (ValueError, UnicodeDecodeError, binascii.Error) as e:
        raise HTTPException(status_code=400, detail="Invalid cursor") from e


@router.get("", response_model=TradesPage)
async def list_trades(
    db: AsyncSession = Depends(get_db),
    principal: Principal = Depends(get_principal),
    symbol: str | None = None,
    side: str | None = None,
    date_from: str | None = Query(default=None, alias="dateFrom"),
    date_to: str | None = Query(default=None, alias="dateTo"),
    limit: int = Query(default=200, ge=1, le=500),
    cursor: str | None = None,
):
    filters = [Trade.workspace_id == principal.workspace_id]

    if symbol:
        filters.append(Trade.symbol == symbol.strip().upper())
    if side:
        filters.append(Trade.side == side.strip().upper())
    if date_from:
        dt = datetime.fromisoformat(date_from)
        if not dt.tzinfo:
            dt = dt.replace(tzinfo=UTC)
        filters.append(Trade.executed_at >= dt)
    if date_to:
        dt = datetime.fromisoformat(date_to)
        if not dt.tzinfo:
            dt = dt.replace(tzinfo=UTC)
        filters.append(Trade.executed_at <= dt)

    stmt = select(Trade).where(and_(*filters)).order_by(Trade.executed_at.desc(), Trade.id.desc()).limit(
        limit + 1
    )

    if cursor:
        c_ts, c_id = decode_cursor(cursor)
        stmt = stmt.where(
            or_(
                Trade.executed_at < c_ts,
                and_(Trade.executed_at == c_ts, Trade.id < c_id),
            )
        )

    rows = (await db.execute(stmt)).scalars().all()
    next_cursor = None
    if len(rows) > limit:
        last = rows[limit - 1]
        next_cursor = encode_cursor(last.executed_at, last.id)
        rows = rows[:limit]

    items = [
        TradeOut(
            id=t.id,
            executedAt=t.executed_at,
            symbol=t.symbol,
            side=t.side,
            qty=float(t.qty),
            price=float(t.price),
            fees=float(t.fees),
            pnl=float(t.pnl) if t.pnl is not None else None,
        )
        for t in rows
    ]

    return TradesPage(items=items, nextCursor=next_cursor)
