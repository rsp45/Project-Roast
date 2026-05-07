from datetime import UTC, datetime

import pytest

from project_roast_api.trade_ingest import (
    auto_map_row,
    build_column_mapping,
    parse_float,
    parse_timestamp,
    preview_trade_import,
    read_csv_dicts,
)


def test_parse_timestamp_iso():
    dt = parse_timestamp("2026-05-02T10:11:12+00:00")
    assert dt == datetime(2026, 5, 2, 10, 11, 12, tzinfo=UTC)


def test_parse_timestamp_basic():
    dt = parse_timestamp("2026-05-02 10:11")
    assert dt == datetime(2026, 5, 2, 10, 11, tzinfo=UTC)


def test_parse_timestamp_invalid():
    with pytest.raises(ValueError):
        parse_timestamp("not-a-date")


def test_read_csv_dicts():
    rows = read_csv_dicts(b"executed_at,symbol,side,qty,price\n2026-05-02 10:11,AAPL,BUY,1,100\n")
    assert rows[0]["symbol"] == "AAPL"


def test_read_csv_dicts_normalizes_headers():
    rows = read_csv_dicts(
        b"Ticker, Avg Price ,Buy/Sell,Execution Time\nAAPL,100,BUY,2026-05-02 10:11\n"
    )
    assert set(rows[0].keys()) == {"ticker", "avg_price", "buy_sell", "execution_time"}


def test_auto_map_row_handles_aliases_and_missing_pnl():
    rows = read_csv_dicts(
        b"Ticker, Avg Price ,Quantity,Buy/Sell,Execution Time\nAAPL,100,2,BUY,2026-05-02 10:11\n"
    )
    mapping = build_column_mapping(list(rows[0].keys()))
    mapped = auto_map_row(rows[0], mapping)
    assert mapped["symbol"] == "AAPL"
    assert mapped["price"] == "100"
    assert mapped["qty"] == "2"
    assert mapped["side"] == "BUY"
    assert mapped["pnl"] == "0"


def test_parse_float_invalid_defaults():
    assert parse_float("not-a-number", default=0.0) == 0.0


def test_preview_trade_import_suggests_mapping_and_samples():
    data = preview_trade_import(
        b"Ticker, Avg Price ,Quantity,Buy/Sell,Execution Time\nAAPL,100,2,BUY,2026-05-02 10:11\n"
    )
    assert data["headers"] == ["ticker", "avg_price", "quantity", "buy_sell", "execution_time"]
    assert data["suggestedMapping"]["symbol"] == "ticker"
    assert data["suggestedMapping"]["price"] == "avg_price"
    assert data["suggestedMapping"]["qty"] == "quantity"
    assert data["suggestedMapping"]["side"] == "buy_sell"
    assert data["requiredMissing"] == []
    assert data["sampleRows"][0]["ticker"] == "AAPL"
    assert any("pnl" in note.lower() for note in data["notes"])


def test_preview_trade_import_detects_missing_timestamp():
    data = preview_trade_import(b"Symbol,Side,Qty,Price\nAAPL,BUY,1,100\n")
    assert "date" in data["requiredMissing"]
