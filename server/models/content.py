from app import db
from uuid import uuid4
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER, JSON

class Content(db.Model, SerializerMixin):
    __tablename__ = 'content'

    id = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=lambda: str(uuid4()))
    channel = db.Column(db.String(250), nullable=False)
    type = db.Column(db.String(250), nullable=False)
    objective = db.Column (db.Text, nullable=True)
    audience = db.Column(db.Text, nullable=True)

    status = db.Column(db.String(250), nullable=False)
    
    title = db.Column(db.String(500), nullable=False)
    link = db.Column(db.String(500), nullable=True,)
    text = db.Column(db.Text, nullable=True)
    media = db.Column(JSON, nullable=True, default=list)
    tags = db.Column(JSON, nullable=True, default=list)

    likes = db.Column(db.Integer, default=0)
    shares = db.Column(db.Integer, default=0)
    clicks = db.Column(db.Integer, default=0)
    comments = db.Column(db.Integer, default=0)
    impressions = db.Column(db.Integer, default=0)

    scheduled_at = db.Column(db.DateTime, nullable=True)
    published_at = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    organization_id = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('organization.id'), nullable=False)
    organization = db.relationship('Organization', back_populates='contents', lazy="joined")

    product_id = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('product.id'), nullable=True)
    product = db.relationship('Product', back_populates='contents', lazy="joined")

    serialize_rules = ('-organization', '-product')

    def __repr__(self):
        return f'<Content {self.title}>'