from app import db
from uuid import uuid4
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER, JSON

class Product(db.Model, SerializerMixin):
    __tablename__ = 'products'

    id = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=lambda: str(uuid4()))
    name = db.Column(db.String(500), nullable=False)
    price = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default="USD", nullable=False) 
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(250), nullable=True)

    images = db.Column(JSON, nullable=True)

    organization_id = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('organization.id'), nullable=False)
    organization = db.relationship('Organization', back_populates='products', lazy="joined")

    serialize_rules = ('-organization',)

    def __repr__(self):
        return f'<Product {self.name}>'
    