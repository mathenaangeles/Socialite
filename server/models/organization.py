from app import db
from uuid import uuid4
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER

class Organization(db.Model, SerializerMixin):
    __tablename__ = 'organization'
    
    id = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=lambda: str(uuid4()))
    name = db.Column(db.String(250), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    members = db.relationship('User', back_populates='organization', lazy='dynamic')

    serialize_rules = ('-members',)
    
    def __repr__(self):
        return f'<Organization {self.name}>'
