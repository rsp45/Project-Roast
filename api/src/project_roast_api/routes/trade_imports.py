import uuid
from collections import Counter

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from project_roast_api.db import get_db
from project_roast_api.models import Trade, TradeImport
from project_roast_api.schemas import TradeImportCreateResponse, TradeImportStatusResponse
from project_roast_api.security import Principal, get_principal
from project_roast_api.trade_ingest import auto_map_row, build_column_mapping, parse_float, read_csv_dicts, resolve_timestamp

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
        raise HTTPException(status_code=400, detail={
            "error_code": "INVALID_FILE_TYPE",
            "message": "Only .csv files are supported",
            "hint": "Make sure your file has a .csv extension. Excel files (.xlsx) must be saved as CSV first.",
        })

    raw = await file.read()
    rows = read_csv_dicts(raw)
    if not rows:
        raise HTTPException(status_code=400, detail={
            "error_code": "EMPTY_FILE",
            "message": "The CSV file appears to be empty",
            "hint": "Check that your file has at least a header row and one data row.",
        })

    mapping = build_column_mapping(list(rows[0].keys()))
    missing: list[str] = []
    is_ohlcv = not mapping.get("symbol") and not mapping.get("side")
    for required in ("qty", "price"):
        if not mapping.get(required):
            missing.append(required)
    timestamp_headers = {
        "executed_at", "executedat", "execution_time", "executiontime",
        "datetime", "timestamp", "date", "time", "trade_date", "tradedate",
    }
    if not any(h in rows[0] for h in timestamp_headers):
        missing.append("date")
    if missing:
        found_cols = sorted(rows[0].keys())
        raise HTTPException(
            status_code=400,
            detail={
                "error_code": "MISSING_COLUMNS",
                "message": f"CSV is missing required columns: {', '.join(sorted(set(missing)))}",
                "hint": "Your CSV needs at minimum: a date/time column, a price column, and a quantity/volume column. "
                        "Check the Settings → CSV Mapping page to configure your broker's column names.",
                "found_columns": found_cols,
                "missing_columns": sorted(set(missing)),
            },
        )

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
        raw_row = {k.lower(): v for k, v in row.items()}
        mapped_row = auto_map_row(raw_row, mapping)
        row_for_timestamp = {**raw_row, **mapped_row}
        try:
            executed_at = resolve_timestamp(row_for_timestamp)
        except ValueError:
            continue

        # OHLCV mode: infer symbol from filename, default side to BUY
        if is_ohlcv:
            base_name = (file.filename or "UNKNOWN").upper()
            # Strip common extensions and path separators
            inferred_symbol = base_name.replace(".CSV", "").replace(".TXT", "").split("/")[-1].split("\\")[-1]
            # Remove trailing "data" or "stockdata" suffixes
            import re as _re
            inferred_symbol = _re.sub(r'(?i)(stock)?data$', '', inferred_symbol).strip() or "UNKNOWN"
            mapped_row["symbol"] = inferred_symbol
            mapped_row["side"] = "BUY"
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
        raise HTTPException(status_code=400, detail={
            "error_code": "NO_VALID_TRADES",
            "message": "No valid trade rows could be parsed from your CSV",
            "hint": "Rows are skipped if symbol, side, price, or quantity are missing or zero. "
                    "Check that your CSV has data rows and that the column mapping in Settings matches your broker's format.",
        })

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
