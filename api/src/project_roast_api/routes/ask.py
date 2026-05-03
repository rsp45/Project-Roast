import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from project_roast_api.db import get_db
from project_roast_api.models import AiQuery, Trade
from project_roast_api.schemas import AskRequest, AskResponse
from project_roast_api.security import Principal, get_principal

router = APIRouter(prefix="/v1", tags=["ask"])


def basic_answer(question: str, pnls: list[float]) -> str:
    q = question.lower()
    if "win rate" in q:
        if not pnls:
            return "Win rate needs per-trade PnL. Import a CSV that includes a pnl column."
        wins = sum(1 for p in pnls if p > 0)
        return f"Win rate is {wins}/{len(pnls)} trades ({(wins/len(pnls))*100:.1f}%)."
    if "profit factor" in q:
        if not pnls:
            return "Profit factor needs per-trade PnL. Import a CSV that includes a pnl column."
        wins = sum(p for p in pnls if p > 0)
        losses = sum(p for p in pnls if p < 0)
        if losses == 0:
            return "No losing trades detected in the imported PnL series."
        return f"Profit factor is {wins/abs(losses):.2f} (gross wins / gross losses)."
    if "drawdown" in q or "dd" in q:
        return "Drawdown analysis is available on the Portfolio page once PnL series is imported."
    return "I can answer questions once trades are imported. Ask about PnL, win rate, fees, symbols, or clustering."


@router.post("/ask", response_model=AskResponse)
async def ask(
    req: AskRequest,
    db: AsyncSession = Depends(get_db),
    principal: Principal = Depends(get_principal),
):
    trades = (
        await db.execute(
            select(Trade)
            .where(Trade.workspace_id == principal.workspace_id)
            .order_by(Trade.executed_at.desc())
            .limit(50)
        )
    ).scalars().all()

    pnls = [float(t.pnl) for t in trades if t.pnl is not None]
    answer = basic_answer(req.question, pnls)

    evidence_trades = [
        {
            "id": str(t.id),
            "executedAt": t.executed_at.isoformat(),
            "symbol": t.symbol,
            "side": t.side,
            "qty": float(t.qty),
            "price": float(t.price),
            "fees": float(t.fees),
            "pnl": float(t.pnl) if t.pnl is not None else None,
        }
        for t in trades[:10]
    ]

    query = AiQuery(
        id=uuid.uuid4(),
        user_id=principal.user_id,
        workspace_id=principal.workspace_id,
        question=req.question,
        context=req.context,
        answer={"answer": answer, "evidence": {"trades": evidence_trades}},
        created_at=datetime.now(UTC),
    )
    db.add(query)
    await db.commit()

    return AskResponse(
        answer=answer,
        evidence={"trades": evidence_trades},
        followUps=[
            "Show me PnL by symbol.",
            "Which trades contributed most to drawdown?",
            "Compare last 30 days vs previous 30 days.",
        ],
    )
