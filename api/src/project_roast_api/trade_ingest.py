import csv
import io
from datetime import UTC, datetime


def parse_timestamp(value: str) -> datetime:
    v = value.strip()
    for fmt in (
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y/%m/%d %H:%M:%S",
        "%Y/%m/%d %H:%M",
        "%Y-%m-%d",          # date-only fallback
        "%Y/%m/%d",
        "%d/%m/%Y",
        "%m/%d/%Y",
    ):
        try:
            return datetime.strptime(v, fmt).replace(tzinfo=UTC)
        except ValueError:
            pass
    try:
        dt = datetime.fromisoformat(v)
        return dt if dt.tzinfo else dt.replace(tzinfo=UTC)
    except ValueError as e:
        raise ValueError(f"Unparseable timestamp: {value}") from e


def resolve_timestamp(row: dict[str, str]) -> datetime:
    """
    Try to find a timestamp from the row, handling both:
    - Combined column:  executed_at / executedAt / time / date / datetime / timestamp
    - Split columns:    TradeDate + ExecutionTime  (or Date + Time)
    """
    # ── 1. Combined column candidates ──────────────────────────────────────────
    combined_keys = (
        "executed_at", "executedat", "datetime", "timestamp",
    )
    for key in combined_keys:
        val = row.get(key, "").strip()
        if val:
            return parse_timestamp(val)

    # ── 2. Split date + time columns ───────────────────────────────────────────
    date_keys = ("tradedate", "trade_date", "date", "settlementdate")
    time_keys = ("executiontime", "execution_time", "time", "tradetime")

    # normalise row keys to lowercase for matching
    row_lower = {k.lower(): v for k, v in row.items()}

    date_val = next((row_lower[k] for k in date_keys if k in row_lower and row_lower[k].strip()), None)
    time_val = next((row_lower[k] for k in time_keys if k in row_lower and row_lower[k].strip()), None)

    if date_val:
        combined = f"{date_val.strip()} {time_val.strip()}" if time_val else date_val.strip()
        return parse_timestamp(combined)

    raise ValueError(f"No recognisable timestamp column in row: {list(row.keys())}")


def parse_float(value: str | None, *, default: float = 0.0) -> float:
    if value is None:
        return default
    v = value.strip()
    if v == "":
        return default
    return float(v)


def read_csv_dicts(content: bytes) -> list[dict[str, str]]:
    text = content.decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(text))
    return [row for row in reader if any((val or "").strip() for val in row.values())]
