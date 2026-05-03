from datetime import UTC, datetime

import pytest

from project_roast_api.trade_ingest import parse_timestamp, read_csv_dicts


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
