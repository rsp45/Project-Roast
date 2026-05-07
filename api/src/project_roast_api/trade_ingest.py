import csv
import io
import re
from datetime import UTC, datetime


_non_alnum = re.compile(r"[^a-z0-9]+")


def normalize_header(value: str | None) -> str:
    if value is None:
        return ""
    v = value.strip().lower()
    v = _non_alnum.sub("_", v)
    return v.strip("_")


_COLUMN_ALIASES: dict[str, tuple[str, ...]] = {
    "symbol": ("symbol", "ticker", "asset", "instrument"),
    "price": ("price", "avg_price", "avgprice", "cost", "execution_price", "fill_price", "fillprice"),
    "qty": ("qty", "quantity", "size", "shares", "amount", "units"),
    "side": ("side", "action", "type", "buy_sell", "buysell"),
    "executed_at": (
        "executed_at",
        "executedat",
        "execution_time",
        "executiontime",
        "timestamp",
        "datetime",
        "date",
        "time",
        "trade_date",
        "tradedate",
    ),
    "pnl": ("pnl", "profit", "realized_pnl", "return", "profit_loss", "profitloss"),
    "fees": ("fees", "fee", "commission", "commissions"),
    "strategy_tag": ("strategy_tag", "strategytag", "strategy", "tag", "setup"),
}


def build_column_mapping(headers: list[str]) -> dict[str, str | None]:
    normalized = [normalize_header(h) for h in headers]
    normalized_set = set(normalized)
    out: dict[str, str | None] = {}
    for canonical, aliases in _COLUMN_ALIASES.items():
        alias_set = {normalize_header(a) for a in aliases}
        found = next((h for h in normalized if h in alias_set), None)
        if not found and canonical in normalized_set:
            found = canonical
        out[canonical] = found
    return out


def auto_map_row(row: dict[str, str], mapping: dict[str, str | None]) -> dict[str, str]:
    out: dict[str, str] = {}
    for canonical, source in mapping.items():
        if source and source in row:
            out[canonical] = row.get(source) or ""
    if "pnl" not in out or out["pnl"].strip() == "":
        out["pnl"] = "0"
    if "fees" not in out or out["fees"].strip() == "":
        out["fees"] = "0"
    return out


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
    combined_keys = (
        "executed_at",
        "executedat",
        "execution_time",
        "executiontime",
        "datetime",
        "timestamp",
        "date",
        "time",
    )
    for key in combined_keys:
        val = row.get(key, "").strip()
        if val:
            return parse_timestamp(val)

    date_keys = ("tradedate", "trade_date", "date", "settlementdate")
    time_keys = ("executiontime", "execution_time", "time", "tradetime")

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
    v = v.replace(",", "")
    try:
        return float(v)
    except ValueError:
        return default


def read_csv_dicts(content: bytes) -> list[dict[str, str]]:
    text = content.decode("utf-8-sig", errors="replace")
    buffer = io.StringIO(text)
    header_reader = csv.reader(buffer)
    raw_headers = next(header_reader, None)
    if not raw_headers:
        return []

    counts: dict[str, int] = {}
    fieldnames: list[str] = []
    for h in raw_headers:
        key = normalize_header(h)
        if not key:
            key = "column"
        counts[key] = counts.get(key, 0) + 1
        fieldnames.append(key if counts[key] == 1 else f"{key}_{counts[key]}")

    reader = csv.DictReader(buffer, fieldnames=fieldnames)
    return [row for row in reader if any((val or "").strip() for val in row.values())]
