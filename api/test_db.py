import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from project_roast_api.models import Base, TradeImport, Trade, Workspace, User
from project_roast_api.trade_ingest import read_csv_dicts, resolve_timestamp, parse_float
from collections import Counter

async def test():
    engine = create_async_engine('sqlite+aiosqlite:///:memory:')
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    SessionLocal = async_sessionmaker(engine)
    
    async with SessionLocal() as db:
        user = User(email="test@test.com", name="test")
        db.add(user)
        await db.flush()
        workspace = Workspace(owner_user_id=user.id)
        db.add(workspace)
        await db.flush()
        
        with open('sample_broker_statement.csv', 'rb') as f:
            raw = f.read()
        rows = read_csv_dicts(raw)
        
        import_id = uuid.uuid4()
        trade_import = TradeImport(
            id=import_id,
            workspace_id=workspace.id,
            status="running",
            source="csv",
            original_filename="sample.csv",
            mapping={"timezone": "UTC", "currency": "USD"},
        )
        db.add(trade_import)
        await db.flush()
        
        trades = []
        symbols = []
        pnls = []
        
        for row in rows:
            row = {k.lower(): v for k, v in row.items()}
            try:
                executed_at = resolve_timestamp(row)
            except ValueError:
                continue
            symbol = (row.get("symbol") or "").strip().upper()
            side = (row.get("side") or row.get("action") or "").strip().upper()
            qty = parse_float(row.get("qty") or row.get("quantity"))
            price = parse_float(row.get("price"))
            fees = parse_float(row.get("fees") or row.get("fee") or row.get("commission"), default=0.0)
            pnl = row.get("pnl")
            pnl_value = parse_float(pnl, default=0.0) if pnl is not None and pnl.strip() != "" else None
            strategy_tag = (row.get("strategy_tag") or row.get("strategyTag") or "").strip() or None

            if not symbol or not side or qty == 0 or price == 0:
                continue

            t = Trade(
                workspace_id=workspace.id,
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
        print("Success! Trades inserted:", len(trades))

if __name__ == "__main__":
    asyncio.run(test())
