import uuid
from collections import Counter

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from project_roast_api.db import get_db
from project_roast_api.models import Trade, TradeImport
from project_roast_api.schemas import TradeImportCreateResponse, TradeImportStatusResponse
from project_roast_api.security import Principal, get_principal
from project_roast_api.trade_ingest import parse_float, parse_timestamp, read_csv_dicts

router = APIRouter(prefix="/v1/trade-imports", tags=["trade-imports"])


@router.post("", response_model=TradeImportCreateResponse)
async def create_trade_import(
    file: UploadFile = File(...),
    timezone: str = Form("UTC"),
    currency: str = Form("USD"),
    db: AsyncSession = Depends(get_db),
    principal: Principal = Depends(get_principal),
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are supported")

    raw = await file.read()
    rows = read_csv_dicts(raw)
    if not rows:
        raise HTTPException(status_code=400, detail="CSV is empty")

    import_id = uuid.uuid4()
    trade_import = TradeImport(
        id=import_id,
        workspace_id=principal.workspace_id,
        status="running",
        source="csv",
        original_filename=file.filename,
        mapping={"timezone": timezone, "currency": currency},
    )
    db.add(trade_import)
    await db.flush()

    trades: list[Trade] = []
    symbols: list[str] = []
    pnls: list[float] = []

    for row in rows:
        try:
            executed_at = parse_timestamp(
                row.get("executed_at") or row.get("executedAt") or row.get("time") or ""
            )
        except ValueError:
            continue
        symbol = (row.get("symbol") or "").strip().upper()
        side = (row.get("side") or row.get("action") or "").strip().upper()
        qty = parse_float(row.get("qty") or row.get("quantity"))
        price = parse_float(row.get("price"))
        fees = parse_float(row.get("fees"), default=0.0)
        pnl = row.get("pnl")
        pnl_value = parse_float(pnl, default=0.0) if pnl is not None and pnl.strip() != "" else None
        strategy_tag = (row.get("strategy_tag") or row.get("strategyTag") or "").strip() or None

        if not symbol or not side or qty == 0 or price == 0:
            continue

        t = Trade(
            workspace_id=principal.workspace_id,
            import_id=import_id,
            executed_at=executed_at,
            symbol=symbol,
            side=side,
            qty=qty,
            price=price,
            fees=fees,
            pnl=pnl_value,
            strategy_tag=strategy_tag,
            raw=row,
        )
        trades.append(t)
        symbols.append(symbol)
        if pnl_value is not None:
            pnls.append(float(pnl_value))

    if not trades:
        trade_import.status = "failed"
        trade_import.error = "No valid trades found in CSV"
        await db.commit()
        raise HTTPException(status_code=400, detail="No valid trades found in CSV")

    db.add_all(trades)

    counts = Counter(symbols)
    trade_import.status = "completed"
    trade_import.summary = {
        "trades": len(trades),
        "symbols": len(counts),
        "topSymbols": [s for s, _ in counts.most_common(5)],
        "totalPnl": sum(pnls) if pnls else None,
    }

    await db.commit()

    return TradeImportCreateResponse(importId=import_id, status=trade_import.status)


@router.get("/{import_id}", response_model=TradeImportStatusResponse)
async def get_trade_import(
    import_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    principal: Principal = Depends(get_principal),
):
    trade_import = (
        await db.execute(
            select(TradeImport).where(
                TradeImport.id == import_id,
                TradeImport.workspace_id == principal.workspace_id,
            )
        )
    ).scalar_one_or_none()
    if not trade_import:
        raise HTTPException(status_code=404, detail="Import not found")

    return TradeImportStatusResponse(
        importId=trade_import.id,
        status=trade_import.status,
        summary=trade_import.summary,
        error=trade_import.error,
    )
