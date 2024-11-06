from app import db
from uuid import uuid4
from models.association import user_organization
from sqlalchemy_serializer import SerializerMixin


class Organization(db.Model, SerializerMixin):
    __tablename__ = 'organization'
    id = db.Column(db.String(250), unique=True, primary_key=True, default=lambda: uuid4().hex)
    name = db.Column(db.String(250), unique=True, nullable=False)
    members = db.relationship('User', secondary=user_organization, back_populates = 'organizations', lazy='dynamic')

    serialize_rules = ('-members',)
    
    def __repr__(self):
        return f'<Organization {self.name}>'