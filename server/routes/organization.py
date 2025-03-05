from app import app, db
from flask import request, jsonify, session

from models.user import User
from models.organization import Organization
from utils import auth_required, admin_required

@app.route('/organization/create', methods=['POST'])
@auth_required
def create_organization():
    name = request.json['name']
    existing_organization = Organization.query.filter_by(name=name).first()
    if existing_organization:
        return jsonify({
            "error": "An organization with this name already exists."
        }), 409
    user = request.user
    new_organization = Organization(
        name=name,
        members=[]
    )
    new_organization.members.append(user)
    db.session.add(new_organization)
    user.organizations.append(new_organization)
    db.session.commit()
    return jsonify({
        "id": new_organization.id,
        "name": new_organization.name,
        "members": [member.to_dict() for member in new_organization.members]
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
        for user in organization.members:
            user.organizations.remove(organization)
        db.session.delete(organization)
        db.session.commit()
        return {"id": organization_id}, 204
    elif request.method == 'PUT':
        name = request.json['name']
        if name:
            organization.name = name
        db.session.commit()
    return jsonify({
        "id": organization.id,
        "name": organization.name,
        "members": [member.to_dict() for member in organization.members]
    }), 200

@app.route('/organization/members/<id>', methods=['PUT', 'DELETE'])
@auth_required
def members(id):
    organization = Organization.query.filter_by(id=id).first()
    if not organization:
        return jsonify({
            "error": "Organization could not be found."
        }), 404
    emails = request.json['emails']
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
            if user in organization.members:
                organization.members.remove(user)
                user.organizations.remove(organization)
    elif request.method == 'PUT':
        for user in users:
            if user not in organization.members:
                organization.members.append(user)
                user.organizations.append(organization)
    db.session.commit()
    return jsonify({
        "id": organization.id,
        "name": organization.name,
        "members": [member.to_dict() for member in organization.members]
    }), 200

@app.route('/organizations', methods=['GET'])
@admin_required
def organizations():
    organizations = Organization.query.all()
    return jsonify([
        organization.to_dict() for organization in organizations
    ]), 200

