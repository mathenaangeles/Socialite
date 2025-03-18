from app import app, db
from flask import request, jsonify

from models.product import Product
from utils import auth_required, upload_image_to_azure, delete_image_from_azure

@app.route('/product/create', methods=['POST'])
@auth_required
def create_product():
    data = request.form
    print(data)
    name = data.get('name')
    price = data.get('price')
    currency = data.get('currency', 'USD')
    description = data.get('description')
    category = data.get('category')
    
    user = request.user
    if not user.organization_id:
        return jsonify({"error": "User is not part of any organization."}), 403

    image_files = request.files.getlist('images')
    uploaded_images = [upload_image_to_azure(img, "products") for img in image_files if img]

    new_product = Product(
        name=name,
        price=float(price) if price else None  ,
        currency=currency,
        description=description,
        category=category,
        images=uploaded_images,
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
        for img in product.images:
            delete_image_from_azure(img)
        db.session.delete(product)
        db.session.commit()
        return {"id": id}, 204

    elif request.method == 'PUT':
        data = request.form
        product.name = data.get('name', product.name)
        product.price = float(data.get('price', product.price)) if data.get('price') else product.price
        product.currency = data.get('currency', product.currency)
        product.description = data.get('description', product.description)
        product.category = data.get('category', product.category)

        new_images = request.files.getlist('images')
        existing_images = request.form.getlist('existing_images') 
        removed_images = set(product.images) - set(existing_images)
        for img in removed_images:
            delete_image_from_azure(img)
        uploaded_images = [upload_image_to_azure(img, "products") for img in new_images if img]
        product.images = existing_images + uploaded_images

        db.session.commit()

    return jsonify(product.to_dict()), 200

@app.route('/products', methods=['GET'])
@auth_required
def products():
    user = request.user
    if not user.organization_id:
        return jsonify({"error": "User is not part of any organization."}), 403

    products = Product.query.filter_by(organization_id=user.organization_id).all()
    return jsonify([product.to_dict() for product in products]), 200
