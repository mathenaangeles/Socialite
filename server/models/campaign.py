from app import db
from uuid import uuid4
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER

class Campaign(db.Model, SerializerMixin):
    __tablename__ = 'campaigns'

    id = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=lambda: str(uuid4()))
    title = db.Column(db.String(500), nullable=False)
    goal = db.Column(db.Text, nullable=False)
    budget = db.Column(db.Float, nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date =  db.Column(db.Date, nullable=False)
    target_audience = db.Column(db.Text, nullable=False)
    
    organization_id = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('organization.id'), nullable=False)
    organization = db.relationship('Organization', back_populates='campaigns', lazy="joined")

    serialize_rules = ('-organization',)

    def __repr__(self):
        return f'<Campaign {self.title}>'