from app import app, db
from flask import request, jsonify

from models.product import Product
from models.organization import Organization
from utils import auth_required

@app.route('/product/create', methods=['POST'])
@auth_required
def create_product():
    data = request.json
    name = data.get('name')
    price = data.get('price')
    currency = data.get('currency', 'USD')
    description = data.get('description')
    category = data.get('category')
    images = data.get('images', [])
    
    user = request.user
    if not user.organization_id:
        return jsonify({"error": "User is not part of any organization."}), 403

    new_product = Product(
        name=name,
        price=price,
        currency=currency,
        description=description,
        category=category,
        images=images,
        organization_id=user.organization_id
    )
    db.session.add(new_product)
    db.session.commit()

    return jsonify(new_product.to_dict()), 201

@app.route('/product/<id>', methods=['GET', 'PUT', 'DELETE'])
@auth_required
def product(id):
    product = Product.query.filter_by(id=id).first()
    if not product:
        return jsonify({"error": "Product could not be found."}), 404

    user = request.user
    if product.organization_id != user.organization_id:
        return jsonify({"error": "User is not authorized to perform this action."}), 403

    if request.method == 'DELETE':
        db.session.delete(product)
        db.session.commit()
        return {"id": id}, 204
    
    elif request.method == 'PUT':
        data = request.json
        product.name = data.get('name', product.name)
        product.price = data.get('price', product.price)
        product.currency = data.get('currency', product.currency)
        product.description = data.get('description', product.description)
        product.category = data.get('category', product.category)
        product.images = data.get('images', product.images)
        db.session.commit()
    
    return jsonify(product.to_dict()), 200

@app.route('/products', methods=['GET'])
@auth_required
def products():
    print("HELLO")
    user = request.user
    if not user.organization_id:
        return jsonify({"error": "User is not part of any organization."}), 403

    products = Product.query.filter_by(organization_id=user.organization_id).all()
    return jsonify([product.to_dict() for product in products]), 200
