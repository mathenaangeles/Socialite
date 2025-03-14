"""Added description to organization model

Revision ID: 763122c31c2b
Revises: a89b1fabc311
Create Date: 2025-03-15 04:45:07.867111

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '763122c31c2b'
down_revision = 'a89b1fabc311'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('organization', schema=None) as batch_op:
        batch_op.add_column(sa.Column('description', sa.Text(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('organization', schema=None) as batch_op:
        batch_op.drop_column('description')

    # ### end Alembic commands ###
