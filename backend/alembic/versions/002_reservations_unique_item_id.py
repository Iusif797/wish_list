"""Reservations unique item_id (prevent race: one reservation per item)

Revision ID: 002
Revises: 001
Create Date: 2025-02-11

"""
from typing import Sequence, Union

from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Remove duplicate reservations (keep one per item_id with smallest id)
    op.execute("""
        DELETE FROM reservations a
        USING reservations b
        WHERE a.item_id = b.item_id AND a.id > b.id
    """)
    op.create_unique_constraint("uq_reservations_item_id", "reservations", ["item_id"])


def downgrade() -> None:
    op.drop_constraint("uq_reservations_item_id", "reservations", type_="unique")
