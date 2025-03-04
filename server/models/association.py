from app import db
from uuid import uuid4
from datetime import datetime, timezone
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER

user_organization = db.Table(
    'user_organization',
    db.Column('id', UNIQUEIDENTIFIER, primary_key=True, default=lambda: str(uuid4())),
    db.Column('user_id', UNIQUEIDENTIFIER, db.ForeignKey('user.id'), nullable=False),
    db.Column('organization_id', UNIQUEIDENTIFIER, db.ForeignKey('organization.id'), nullable=False),
    db.Column('created_at', db.DateTime, default=lambda: datetime.now(timezone.utc)),
    extend_existing=True
)