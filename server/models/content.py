from app import db
from uuid import uuid4
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER, JSON

class Content(db.Model, SerializerMixin):
    __tablename__ = 'content'

    id = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=lambda: str(uuid4()))
    title = db.Column(db.String(500), nullable=False)
    channel = db.Column(db.String(250), nullable=False)
    type = db.Column(db.String(250), nullable=False)
    status = db.Column(db.String(250), nullable=False)
    caption = db.Column(db.Text, nullable=True)
    link = db.Column(db.String(500), nullable=True)

    media_url = db.Column(JSON, nullable=True)

    likes = db.Column(db.Integer, default=0)
    shares = db.Column(db.Integer, default=0)
    comments = db.Column(db.Integer, default=0)
    clicks = db.Column(db.Integer, default=0)
    impressions = db.Column(db.Integer, default=0)

    scheduled_at = db.Column(db.DateTime, nullable=True)
    published_at = db.Column(db.DateTime, nullable=True)

    organization_id = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('organization.id'), nullable=False)
    organization = db.relationship('Organization', back_populates='contents', lazy="joined")

    serialize_rules = ('-organization',)

    def __repr__(self):
        return f'<Content {self.title}>'