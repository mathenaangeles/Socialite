from app import db

user_organization = db.Table(
    'user_organization',
    db.Column('user_id', db.String(250), db.ForeignKey('user.id'), primary_key=True),
    db.Column('organization_id', db.String(250), db.ForeignKey('organization.id'), primary_key=True),
    extend_existing=True
)