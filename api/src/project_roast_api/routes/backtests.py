import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from project_roast_api.db import get_db
from project_roast_api.models import Backtest
from project_roast_api.schemas import BacktestCreateResponse, BacktestRequest, BacktestStatusResponse
from project_roast_api.security import Principal, get_principal

router = APIRouter(prefix="/v1/backtests", tags=["backtests"])


@router.post("", response_model=BacktestCreateResponse)
async def create_backtest(
    req: BacktestRequest,
    db: AsyncSession = Depends(get_db),
    principal: Principal = Depends(get_principal),
):
    backtest_id = uuid.uuid4()
    bt = Backtest(
        id=backtest_id,
        workspace_id=principal.workspace_id,
        template=req.template,
        params=req.params,
        status="completed",
        result={
            "asOf": datetime.now(UTC).isoformat(),
            "template": req.template,
            "summary": {"status": "stub", "note": "Replace with real engine in v2"},
        },
    )
    db.add(bt)
    await db.commit()
    return BacktestCreateResponse(backtestId=backtest_id, status=bt.status)


@router.get("/{backtest_id}", response_model=BacktestStatusResponse)
async def get_backtest(
    backtest_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    principal: Principal = Depends(get_principal),
):
    bt = (
        await db.execute(
            select(Backtest).where(
                Backtest.id == backtest_id,
                Backtest.workspace_id == principal.workspace_id,
            )
        )
    ).scalar_one_or_none()
    if not bt:
        raise HTTPException(status_code=404, detail="Backtest not found")

    return BacktestStatusResponse(
        backtestId=bt.id,
        status=bt.status,
        result=bt.result,
        error=bt.error,
    )
