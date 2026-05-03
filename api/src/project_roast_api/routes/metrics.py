from collections import defaultdict
from datetime import UTC, date, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from project_roast_api.db import get_db
from project_roast_api.models import Trade
from project_roast_api.schemas import PortfolioMetricsResponse
from project_roast_api.security import Principal, get_principal

router = APIRouter(prefix="/v1/metrics", tags=["metrics"])


def compute_max_drawdown(equity: list[float]) -> float:
    peak = float("-inf")
    max_dd = 0.0
    for v in equity:
        peak = max(peak, v)
        dd = v - peak
        max_dd = min(max_dd, dd)
    return max_dd


@router.get("/portfolio", response_model=PortfolioMetricsResponse)
async def portfolio_metrics(
    db: AsyncSession = Depends(get_db),
    principal: Principal = Depends(get_principal),
):
    trades = (
        await db.execute(
            select(Trade)
            .where(Trade.workspace_id == principal.workspace_id)
            .order_by(Trade.executed_at.asc())
        )
    ).scalars().all()

    pnls: list[float] = []
    by_day: dict[date, list[float]] = defaultdict(list)

    for t in trades:
        if t.pnl is None:
            continue
        pnl = float(t.pnl)
        pnls.append(pnl)
        by_day[t.executed_at.date()].append(pnl)

    equity_curve: list[dict] = []
    running = 0.0
    for d in sorted(by_day.keys()):
        running += sum(by_day[d])
        equity_curve.append({"date": d.isoformat(), "equity": running})

    equity_values = [p["equity"] for p in equity_curve]
    max_dd = compute_max_drawdown(equity_values) if equity_values else 0.0

    wins = [p for p in pnls if p > 0]
    losses = [p for p in pnls if p < 0]
    win_rate = (len(wins) / len(pnls)) * 100 if pnls else None
    profit_factor = (sum(wins) / abs(sum(losses))) if losses else None

    now = datetime.now(UTC)
    kpis = {
        "asOf": now.isoformat(),
        "trades": len(trades),
        "pnl": sum(pnls) if pnls else None,
        "winRate": win_rate,
        "profitFactor": profit_factor,
        "maxDrawdown": max_dd if pnls else None,
    }

    drawdowns = [{"maxDrawdown": max_dd}] if pnls else []

    return PortfolioMetricsResponse(kpis=kpis, equityCurve=equity_curve, drawdowns=drawdowns)
