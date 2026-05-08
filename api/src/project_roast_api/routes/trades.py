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
from pydantic import BaseModel
from typing import List
import json
from openai import AsyncOpenAI

from project_roast_api.config import settings

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


@router.get("/{trade_id}", response_model=TradeOut)
async def get_trade(
    trade_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    principal: Principal = Depends(get_principal),
):
    stmt = select(Trade).where(
        and_(Trade.id == trade_id, Trade.workspace_id == principal.workspace_id)
    )
    trade = (await db.execute(stmt)).scalar_one_or_none()
    
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
        
    return TradeOut(
        id=trade.id,
        executedAt=trade.executed_at,
        symbol=trade.symbol,
        side=trade.side,
        qty=float(trade.qty),
        price=float(trade.price),
        fees=float(trade.fees),
        pnl=float(trade.pnl) if trade.pnl is not None else None,
    )

class InsightOut(BaseModel):
    title: str
    description: str
    details: dict[str, str]

class RoastOut(BaseModel):
    insights: List[InsightOut]

@router.get("/{trade_id}/roast", response_model=RoastOut)
async def roast_trade(
    trade_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    principal: Principal = Depends(get_principal),
):
    # Retrieve the trade to ensure it exists and belongs to the user
    stmt = select(Trade).where(
        and_(Trade.id == trade_id, Trade.workspace_id == principal.workspace_id)
    )
    trade = (await db.execute(stmt)).scalar_one_or_none()
    
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
        
    # If no API key, return mock insights
    if not settings.nvidia_api_key:
        insights = []
        if trade.pnl is not None and trade.pnl < 0:
            insights.append(InsightOut(
                title="STOP-LOSS MISMANAGEMENT",
                description="The hard stop was placed directly at a round number, a known liquidity pool. The algorithm notes you were stopped out by a minor over-shoot before the price reversed.",
                details={"Expected Drawdown": "1.5%", "Actual Drawdown": "4.2%"}
            ))
        else:
            insights.append(InsightOut(
                title="PREMATURE ENTRY",
                description="You initiated the position before a scheduled macroeconomic event. This indicates a high-risk anticipation strategy rather than a reactive, confirmation-based entry.",
                details={"Volatility at Entry": "Elevated (84th percentile)", "RSI (5m)": "42 (Neutral)"}
            ))
        return RoastOut(insights=insights)

    # Call NVIDIA API
    client = AsyncOpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=settings.nvidia_api_key
    )
    prompt = f"""
You are the Interrogator, a brutal, analytical AI that roasts trading performance with zero empathy.
Analyze this trade:
Symbol: {trade.symbol}
Side: {trade.side}
Quantity: {trade.qty}
Price: {trade.price}
Fees: {trade.fees}
PnL: {trade.pnl if trade.pnl is not None else 'Unknown'}
Raw Data: {json.dumps(trade.raw) if trade.raw else 'None'}

Return a JSON array of insights. Each insight must have:
- "title": string (short, brutal, uppercase)
- "description": string (the roast/analysis)
- "details": object mapping string to string (metrics or evidence)

Limit to 2 or 3 insights.
"""
    try:
        response = await client.chat.completions.create(
            model="qwen/qwen3-coder-480b-a35b-instruct",
            messages=[{"role": "system", "content": "You output strictly valid JSON."}, {"role": "user", "content": prompt}],
            temperature=0.7,
            top_p=0.8,
            max_tokens=4096,
        )
        content = response.choices[0].message.content
        if content:
            # Cleanup markdown block if present
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            data = json.loads(content.strip())
            # handle cases where the LLM might return {"insights": [...]} or just a list
            raw_insights = data.get("insights", data) if isinstance(data, dict) else data
            if isinstance(raw_insights, list):
                insights = [InsightOut(**i) for i in raw_insights]
                return RoastOut(insights=insights)
    except Exception as e:
        print("Error calling OpenAI:", e)

    # Fallback to mock on error
    return RoastOut(insights=[InsightOut(title="ANALYSIS FAILED", description="The AI engine could not process this trade.", details={"Error": "OpenAI API failed"})])
