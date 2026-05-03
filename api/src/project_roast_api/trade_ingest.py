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
