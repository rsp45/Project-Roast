from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from project_roast_api.config import settings
from project_roast_api.routes.ask import router as ask_router
from project_roast_api.routes.auth import router as auth_router
from project_roast_api.routes.backtests import router as backtests_router
from project_roast_api.routes.metrics import router as metrics_router
from project_roast_api.routes.trade_imports import router as trade_imports_router
from project_roast_api.routes.trades import router as trades_router

app = FastAPI(title="Project Roast API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.web_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(trade_imports_router)
app.include_router(trades_router)
app.include_router(metrics_router)
app.include_router(ask_router)
app.include_router(backtests_router)


@app.get("/healthz")
async def healthz():
    return {"ok": True}
