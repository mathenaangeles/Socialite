from app import db
from uuid import uuid4
from models.association import user_organization
from sqlalchemy_serializer import SerializerMixin

class User(db.Model, SerializerMixin):
    __tablename__ = 'user'
    id = db.Column(db.String(250), unique=True, primary_key=True, default=lambda: uuid4().hex)
    type = db.Column(db.String(50), nullable=False, default='regular')
    email = db.Column(db.String(250), unique=True, nullable=False)
    password = db.Column(db.String(250), nullable=False)
    first_name = db.Column(db.String(250), unique=False, default='')
    last_name = db.Column(db.String(250), unique=False, default='')

    organizations = db.relationship('Organization', secondary=user_organization, back_populates = 'members', lazy='dynamic')
    serialize_rules = ('-organizations',)

    def __repr__(self):
        return f'<User {self.email}>'



    