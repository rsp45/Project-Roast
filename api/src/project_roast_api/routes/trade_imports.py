import json
import uuid
from collections import Counter

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from project_roast_api.db import get_db
from project_roast_api.models import Trade, TradeImport
from project_roast_api.schemas import (
    TradeImportCreateResponse,
    TradeImportPreviewResponse,
    TradeImportStatusResponse,
)
from project_roast_api.security import Principal, get_principal
from project_roast_api.trade_ingest import (
    auto_map_row,
    build_column_mapping,
    normalize_header,
    parse_float,
    preview_trade_import,
    read_csv_dicts,
    resolve_timestamp,
)

router = APIRouter(prefix="/v1/trade-imports", tags=["trade-imports"])


@router.post("/preview", response_model=TradeImportPreviewResponse)
async def preview_import(
    file: UploadFile = File(...),
    _principal: Principal = Depends(get_principal),
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are supported")

    raw = await file.read()
    return preview_trade_import(raw)


@router.post("", response_model=TradeImportCreateResponse)
async def create_trade_import(
    file: UploadFile = File(...),
    timezone: str = Form("UTC"),
    currency: str = Form("USD"),
    mapping: str | None = Form(default=None),
    db: AsyncSession = Depends(get_db),
    principal: Principal = Depends(get_principal),
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are supported")

    raw = await file.read()
    rows = read_csv_dicts(raw)
    if not rows:
        raise HTTPException(status_code=400, detail="CSV is empty")

    headers = list(rows[0].keys())
    active_mapping = build_column_mapping(headers)

    if mapping:
        try:
            override = json.loads(mapping)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=400, detail="Invalid mapping JSON") from e

        if not isinstance(override, dict):
            raise HTTPException(status_code=400, detail="Invalid mapping JSON")

        unknown: list[str] = []
        for canonical, source in override.items():
            if not isinstance(canonical, str) or not isinstance(source, str):
                continue
            canonical = canonical.strip()
            source = normalize_header(source)
            if not canonical or not source:
                continue
            if source not in headers:
                unknown.append(f"{canonical}={source}")
                continue
            active_mapping[canonical] = source

        if unknown:
            raise HTTPException(
                status_code=400,
                detail=f"Mapping references unknown headers: {', '.join(sorted(unknown))}",
            )

    missing: list[str] = []
    for required in ("symbol", "side", "qty", "price"):
        if not active_mapping.get(required):
            missing.append(required)
    timestamp_headers = {
        "executed_at",
        "executedat",
        "execution_time",
        "executiontime",
        "datetime",
        "timestamp",
        "date",
        "time",
        "trade_date",
        "tradedate",
    }
    if not any(h in headers for h in timestamp_headers) and not active_mapping.get("executed_at"):
        missing.append("date")
    if missing:
        found = ", ".join(sorted(headers))
        raise HTTPException(
            status_code=400,
            detail=f"CSV missing required columns: {', '.join(sorted(set(missing)))}. Found: {found}",
        )

    import_id = uuid.uuid4()
    trade_import = TradeImport(
        id=import_id,
        workspace_id=principal.workspace_id,
        status="running",
        source="csv",
        original_filename=file.filename,
        mapping={"timezone": timezone, "currency": currency, "columns": active_mapping},
    )
    db.add(trade_import)
    await db.flush()

    trades: list[Trade] = []
    symbols: list[str] = []
    pnls: list[float] = []

    for row in rows:
        raw_row = row
        mapped_row = auto_map_row(raw_row, active_mapping)
        row_for_timestamp = {**raw_row, **mapped_row}
        try:
            executed_at = resolve_timestamp(row_for_timestamp)
        except ValueError:
            continue
        symbol = (mapped_row.get("symbol") or "").strip().upper()
        side = (mapped_row.get("side") or "").strip().upper()
        qty = parse_float(mapped_row.get("qty"))
        price = parse_float(mapped_row.get("price"))
        fees = parse_float(mapped_row.get("fees"), default=0.0)
        pnl_value = parse_float(mapped_row.get("pnl"), default=0.0)
        strategy_tag = (mapped_row.get("strategy_tag") or "").strip() or None

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
            raw=raw_row,
        )
        trades.append(t)
        symbols.append(symbol)
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
