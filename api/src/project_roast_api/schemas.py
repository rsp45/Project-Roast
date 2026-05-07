import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class GoogleSessionIn(BaseModel):
    provider: str = Field(pattern="^google$")
    id_token: str = Field(min_length=20, alias="idToken")


class AuthExchangeRequest(BaseModel):
    session: GoogleSessionIn


class AuthExchangeResponse(BaseModel):
    access_token: str = Field(alias="accessToken")
    expires_in: int = Field(alias="expiresIn")


class TradeImportCreateResponse(BaseModel):
    import_id: uuid.UUID = Field(alias="importId")
    status: str


class TradeImportStatusResponse(BaseModel):
    import_id: uuid.UUID = Field(alias="importId")
    status: str
    summary: dict | None = None
    error: str | None = None


class TradeImportPreviewResponse(BaseModel):
    headers: list[str]
    suggested_mapping: dict[str, str | None] = Field(alias="suggestedMapping")
    required_missing: list[str] = Field(alias="requiredMissing")
    sample_rows: list[dict[str, str]] = Field(alias="sampleRows")
    notes: list[str]


class TradeOut(BaseModel):
    id: uuid.UUID
    executed_at: datetime = Field(alias="executedAt")
    symbol: str
    side: str
    qty: float
    price: float
    fees: float
    pnl: float | None = None


class TradesPage(BaseModel):
    items: list[TradeOut]
    next_cursor: str | None = Field(default=None, alias="nextCursor")


class PortfolioMetricsResponse(BaseModel):
    kpis: dict
    equity_curve: list[dict] = Field(alias="equityCurve")
    drawdowns: list[dict]


class AskRequest(BaseModel):
    question: str = Field(min_length=3)
    context: dict | None = None


class AskResponse(BaseModel):
    answer: str
    evidence: dict
    follow_ups: list[str] = Field(alias="followUps")


class BacktestRequest(BaseModel):
    template: str
    params: dict = Field(default_factory=dict)
    date_range: dict | None = Field(default=None, alias="dateRange")


class BacktestCreateResponse(BaseModel):
    backtest_id: uuid.UUID = Field(alias="backtestId")
    status: str


class BacktestStatusResponse(BaseModel):
    backtest_id: uuid.UUID = Field(alias="backtestId")
    status: str
    result: dict | None = None
    error: str | None = None
