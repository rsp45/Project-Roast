from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.Text(), nullable=False, unique=True),
        sa.Column("name", sa.Text(), nullable=True),
        sa.Column("role", sa.Text(), nullable=False, server_default=sa.text("'trader'")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "workspaces",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "owner_user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("base_currency", sa.Text(), nullable=False, server_default=sa.text("'USD'")),
        sa.Column("timezone", sa.Text(), nullable=False, server_default=sa.text("'UTC'")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("workspaces_owner_user_id_idx", "workspaces", ["owner_user_id"])

    op.create_table(
        "trade_imports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "workspace_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("status", sa.Text(), nullable=False),
        sa.Column("source", sa.Text(), nullable=False, server_default=sa.text("'csv'")),
        sa.Column("original_filename", sa.Text(), nullable=True),
        sa.Column("mapping", postgresql.JSONB(), nullable=True),
        sa.Column("summary", postgresql.JSONB(), nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index(
        "trade_imports_workspace_id_created_at_idx",
        "trade_imports",
        ["workspace_id", sa.text("created_at desc")],
    )

    op.create_table(
        "trades",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "workspace_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "import_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("trade_imports.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("executed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("symbol", sa.Text(), nullable=False),
        sa.Column("side", sa.Text(), nullable=False),
        sa.Column("qty", sa.Numeric(), nullable=False),
        sa.Column("price", sa.Numeric(), nullable=False),
        sa.Column("fees", sa.Numeric(), nullable=False, server_default=sa.text("0")),
        sa.Column("pnl", sa.Numeric(), nullable=True),
        sa.Column("strategy_tag", sa.Text(), nullable=True),
        sa.Column("raw", postgresql.JSONB(), nullable=True),
    )
    op.create_index(
        "trades_workspace_id_executed_at_idx",
        "trades",
        ["workspace_id", sa.text("executed_at desc")],
    )
    op.create_index("trades_workspace_id_symbol_idx", "trades", ["workspace_id", "symbol"])

    op.create_table(
        "metric_snapshots",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "workspace_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("as_of_date", sa.Date(), nullable=False),
        sa.Column("kpis", postgresql.JSONB(), nullable=False),
        sa.Column("series", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_unique_constraint(
        "metric_snapshots_workspace_id_as_of_date_ux",
        "metric_snapshots",
        ["workspace_id", "as_of_date"],
    )

    op.create_table(
        "backtests",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "workspace_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("template", sa.Text(), nullable=False),
        sa.Column("params", postgresql.JSONB(), nullable=False),
        sa.Column("status", sa.Text(), nullable=False),
        sa.Column("result", postgresql.JSONB(), nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index(
        "backtests_workspace_id_created_at_idx",
        "backtests",
        ["workspace_id", sa.text("created_at desc")],
    )

    op.create_table(
        "ai_queries",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "workspace_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("context", postgresql.JSONB(), nullable=True),
        sa.Column("answer", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index(
        "ai_queries_workspace_id_created_at_idx",
        "ai_queries",
        ["workspace_id", sa.text("created_at desc")],
    )


def downgrade() -> None:
    op.drop_index("ai_queries_workspace_id_created_at_idx", table_name="ai_queries")
    op.drop_table("ai_queries")

    op.drop_index("backtests_workspace_id_created_at_idx", table_name="backtests")
    op.drop_table("backtests")

    op.drop_constraint("metric_snapshots_workspace_id_as_of_date_ux", "metric_snapshots", type_="unique")
    op.drop_table("metric_snapshots")

    op.drop_index("trades_workspace_id_symbol_idx", table_name="trades")
    op.drop_index("trades_workspace_id_executed_at_idx", table_name="trades")
    op.drop_table("trades")

    op.drop_index("trade_imports_workspace_id_created_at_idx", table_name="trade_imports")
    op.drop_table("trade_imports")

    op.drop_index("workspaces_owner_user_id_idx", table_name="workspaces")
    op.drop_table("workspaces")

    op.drop_table("users")
