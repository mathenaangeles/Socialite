"""Added evaluation fields to Content model

Revision ID: 3e0eae0a4557
Revises: b43f9eddd7ec
Create Date: 2025-03-23 22:37:56.066126

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mssql

# revision identifiers, used by Alembic.
revision = '3e0eae0a4557'
down_revision = 'b43f9eddd7ec'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('content', schema=None) as batch_op:
        batch_op.add_column(sa.Column('score', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('analysis', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('recommendations', mssql.JSON(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('content', schema=None) as batch_op:
        batch_op.drop_column('recommendations')
        batch_op.drop_column('analysis')
        batch_op.drop_column('score')

    # ### end Alembic commands ###
