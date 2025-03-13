from flask_bcrypt import Bcrypt
from flask_session import Session
from flask import request, jsonify, session

from app import app, db
from models.user import User
from utils import auth_required, admin_required

bcrypt = Bcrypt(app)
server_session = Session(app)

@app.route('/register', methods=['POST'])
def register():
    email = request.json['email']
    password = request.json['password']
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({
            "error": "This email has already been registered to an existing account."
        }), 409
    new_user = User(
        email=email, 
        password=bcrypt.generate_password_hash(password),
    )
    db.session.add(new_user)
    db.session.commit()
    session['user_id'] = new_user.id
    return jsonify({
        "id": new_user.id,
        "type": new_user.type,
        "email": new_user.email,
        "first_name": new_user.first_name,
        "last_name": new_user.last_name,
        "organization": new_user.organization.to_dict() if new_user.organization else None,
    }), 201

@app.route('/login', methods=['POST'])
def login():
    email = request.json['email']
    password = request.json['password']
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({
            "error": "The email is not registered to an existing account."
        }), 401
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({
            "error": "The password entered is incorrect."
        }), 401
    session['user_id'] = user.id
    return jsonify({
        "id": user.id,
        "type": user.type,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "organization": user.organization.to_dict() if user.organization else None,
    }), 200

@app.route('/profile', methods=['GET', 'PUT'])
@auth_required
def profile():
    user = request.user 
    if request.method == 'PUT':
        user.first_name = request.json.get('first_name', user.first_name)
        user.last_name = request.json.get('last_name', user.last_name)
        db.session.commit()
    return jsonify({
            "id": user.id,
            "type": user.type,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "organization": user.organization.to_dict() if user.organization else None
        }), 200

@app.route('/logout', methods=['POST'])
@auth_required
def logout():
    session.pop('user_id')
    return '', 200

@app.route('/delete_account', methods=['DELETE'])
@auth_required
def delete_account():
    user = request.user
    db.session.delete(user)
    db.session.commit()
    session.pop('user_id')
    return '', 200

@app.route('/users', methods=['GET'])
@admin_required
def users():
    users = User.query.all()
    return jsonify([
        user.to_dict() for user in users
    ]), 200

