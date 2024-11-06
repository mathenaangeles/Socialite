from functools import wraps
from flask import request, jsonify, session

from models.user import User

def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "UNAUTHORIZED"}), 401
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({"error": "UNAUTHORIZED"}), 401
        request.user = user
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @auth_required
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.user.type != 'admin':
            return jsonify({"error": "FORBIDDEN: Admin access is required."}), 403
        return f(*args, **kwargs)
    return decorated_function