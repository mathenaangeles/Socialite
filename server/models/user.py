from app import db
from uuid import uuid4
from models.association import user_organization
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER


class User(db.Model, SerializerMixin):
    __tablename__ = 'user'
    id = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=lambda: str(uuid4()))
    type = db.Column(db.String(50), nullable=False, default='regular')
    email = db.Column(db.String(250), unique=True, nullable=False, index=True)
    password = db.Column(db.String(250), nullable=False)
    first_name = db.Column(db.String(250), nullable=True)
    last_name = db.Column(db.String(250), nullable=True)

    organizations = db.relationship('Organization', secondary=user_organization, back_populates = 'members', lazy='dynamic')
    serialize_rules = ('-organizations',)

    def __repr__(self):
        return f'<User {self.email}>'



    