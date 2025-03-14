from app import app, db
from flask import request, jsonify

from models.user import User
from models.organization import Organization
from utils import auth_required, admin_required

@app.route('/organization/create', methods=['POST'])
@auth_required
def create_organization():
    data = request.json
    name = data.get('name')
    description = data.get('description', None)

    existing_organization = Organization.query.filter_by(name=name).first()
    if existing_organization:
        return jsonify({
            "error": "An organization with this name already exists."
        }), 409
    
    user = request.user
    if user.organization_id:
        return jsonify({"error": "The authenticated user is already a member of an organization."}), 400
    
    new_organization = Organization(name=name, description=description)
    db.session.add(new_organization)
    db.session.commit()

    user.organization_id = new_organization.id
    db.session.commit()

    return jsonify({
        "id": new_organization.id,
        "name": new_organization.name,
        "description": new_organization.description,
        "members": [{"id": u.id, "email": u.email} for u in User.query.filter_by(organization_id=organization.id).all()]
    }), 200

@app.route('/organization/<id>', methods=['GET', 'PUT', 'DELETE'])
@auth_required
def organization(id):
    organization = Organization.query.filter_by(id=id).first()
    if not organization:
        return jsonify({
            "error": "Organization could not be found."
        }), 404
    if request.method == 'DELETE':
        organization_id = organization.id
        for user in User.query.filter_by(organization_id=organization.id).all():
            user.organization_id = None
        db.session.delete(organization)
        db.session.commit()
        return { "id" : organization_id }, 204
    elif request.method == 'PUT':
        data = request.json
        organization.name = data.get('name', organization.name)
        organization.description = data.get('description', organization.description)
        db.session.commit()
    return jsonify({
        "id": organization.id,
        "name": organization.name,
        "members": [{"id": u.id, "email": u.email} for u in User.query.filter_by(organization_id=organization.id).all()]
    }), 200

@app.route('/organization/members/<id>', methods=['PUT', 'DELETE'])
@auth_required
def members(id):
    organization = Organization.query.filter_by(id=id).first()
    if not organization:
        return jsonify({
            "error": "Organization could not be found."
        }), 404
    emails = request.json.get('emails', [])
    if not emails:
        return jsonify({
            "error": "No emails were provided."
        }), 400
    users = User.query.filter(User.email.in_(emails)).all()
    if len(users) != len(emails):
        return jsonify({
            "error": "One or more users could not be found."
        }), 404 
    if request.method == 'DELETE':
        for user in users:
            if user.organization_id == organization.id:
                user.organization_id = None
    elif request.method == 'PUT':
        for user in users:
            if user.organization_id and user.organization_id != organization.id:
                return jsonify({"error": f"{user.email} is already a member of another organization."}), 400
            user.organization_id = organization.id
    db.session.commit()
    return jsonify({
        "id": organization.id,
        "name": organization.name,
        "members": [{"id": u.id, "email": u.email} for u in User.query.filter_by(organization_id=organization.id).all()]
    }), 200

@app.route('/organizations', methods=['GET'])
@admin_required
def organizations():
    organizations = Organization.query.all()
    return jsonify([
        organization.to_dict() for organization in organizations
    ]), 200

