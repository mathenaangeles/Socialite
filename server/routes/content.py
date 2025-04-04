import io
from app import app, db
from flask import request, jsonify
from urllib.request import urlopen

from models.content import Content
from models.product import Product
from services.content import init_workflow, ContentState
from utils import auth_required, upload_image_to_azure, delete_image_from_azure

@app.route('/content/create', methods=['POST'])
@auth_required
def create_content():
    data = request.form
    title = data.get('title')
    channel = data.get('channel')
    type = data.get('type')
    objective = data.get('objective', None)
    audience = data.get('audience', None)
    status = data.get('status', 'Draft')
    scheduled_at = data.get('scheduled_at', None)
    link = data.get('link', None)

    instructions = data.get('instructions', None)
    style = data.get('style', None)
    dimensions = data.get('dimensions', None)
    key_elements = data.get('key_elements', None)
    number_of_images = data.get('number_of_images', 1)

    mode = data.get('mode', '')

    product_id = data.get('productId', None)
    if product_id:
        product = Product.query.filter_by(id=product_id).first()
        product_data = {"name": product.name, "description": product.description} if product else None

    user = request.user
    if not user.organization_id:
        return jsonify({"error": "User is not part of any organization."}), 403
    
    state = ContentState(
        title=title, 
        channel=channel, 
        type=type, 
        objective=objective, 
        audience=audience, 
        product=product_data,
        instructions=instructions,
        style=style, 
        dimensions=dimensions, 
        key_elements=key_elements, 
        number_of_images=number_of_images)
    
    workflow = init_workflow(mode)
    final_state = workflow.invoke(state)
    
    media_files = request.files.getlist('newMedia')
    media = [upload_image_to_azure(img, "contents") for img in media_files if img]
    generated_media_files = final_state.generated_media
    for url in generated_media_files:
        try:
            image_data = urlopen(url).read()
            image_file = io.BytesIO(image_data)
            media.append(upload_image_to_azure(image_file, "content", True))
        except Exception as e:
            print(f"ERROR: {e}")

    new_content = Content(
        title=title,
        channel=channel,
        type=type,
        objective=objective,
        audience=audience,
        status=status,
        link=link,
        text=final_state.generated_text,
        tags=final_state.generated_tags,
        media=media,
        score=final_state.generated_score,
        analysis=final_state.generated_analysis,
        recommendations=final_state.generated_recommendations,
        scheduled_at=scheduled_at,
        organization_id=user.organization_id,
        product_id=product_id
    )
    
    db.session.add(new_content)
    db.session.commit()
    return jsonify(new_content.to_dict()), 201


@app.route('/content/<id>', methods=['GET', 'PUT', 'DELETE'])
@auth_required
def content(id):
    content = Content.query.filter_by(id=id).first()
    if not content:
        return jsonify({"error": "Content could not be found."}), 404

    user = request.user
    if content.organization_id != user.organization_id:
        return jsonify({"error": "User is not authorized to perform this action."}), 403

    if request.method == 'DELETE':
        for med in content.media:
            delete_image_from_azure(med)
        db.session.delete(content)
        db.session.commit()
        return {"id": id}, 204

    elif request.method == 'PUT':
        data = request.form

        content.title = data.get('title', content.title)
        content.channel = data.get('channel', content.channel)
        content.type = data.get('type', content.type)
        content.objective = data.get('objective', content.objective)
        content.audience = data.get('audience', content.audience)
        content.status = data.get('status', content.status)
        content.link = data.get('link', content.link)
        content.text = data.get('caption', content.text)
        content.tags = data.get('tags', content.tags)
        content.likes = data.get('likes', content.likes)
        content.shares = data.get('shares', content.shares)
        content.clicks = data.get('clicks', content.clicks)
        content.impressions = data.get('impressions', content.impressions)
        content.scheduled_at = data.get('scheduled_at', content.scheduled_at)
        content.published_at = data.get('published_at', content.published_at)

        content.product_id = data.get('productId', content.product_id)
        if content.product_id:
            product = Product.query.filter_by(id=content.product_id).first()
            product_data = {"name": product.name, "description": product.description} if product else None

        mode = data.get('mode')

        deleted_media_str = request.form.get('deletedMedia')
        if deleted_media_str:
            try:
                deleted_media_list = json.loads(deleted_media_str)
                if isinstance(deleted_media_list, str):
                    deleted_media = json.loads(deleted_media_list)
                else:
                    deleted_media = deleted_media_list
            except json.JSONDecodeError:
                return jsonify({"ERROR": "Invalid image URL format"}), 400
        else:
            deleted_media = []
        content.media = [med for med in content.media if med not in deleted_media]
        for med in deleted_media:
            delete_image_from_azure(med)
        db.session.commit()

        new_media = request.files.getlist('newMedia')
        uploaded_media = [upload_image_to_azure(med, "content") for med in new_media if med]
        content.media = content.media + uploaded_media
        db.session.commit()

        if mode:
            instructions = data.get('instructions', None)
            style = data.get('style', None)
            dimensions = data.get('dimensions', None)
            key_elements = data.get('key_elements', None)
            number_of_images = data.get('number_of_images', 1)

            state = ContentState(
                title=content.title, 
                channel=content.channel, 
                type=content.type, 
                objective=content.objective, 
                audience=content.audience, 
                product=product_data,
                instructions=instructions,
                style=style, 
                dimensions=dimensions, 
                key_elements=key_elements, 
                number_of_images=number_of_images,
                text=content.text,
                tags=content.tags)
        
            workflow = init_workflow(mode)
            final_state = workflow.invoke(state)

            if mode=="text_only" or mode=="full":
                content.text = final_state.generated_text
                content.tags = final_state.generated_tags
                db.session.commit()

            content.score = final_state.generated_score
            content.analysis = final_state.generated_analysis
            content.recommendations = final_state.generated_recommendations

            generated_media = []
            if mode=="media_only" or mode=="full":
                for url in final_state.generated_media:
                    try:
                        image_data = urlopen(url).read()
                        image_file = io.BytesIO(image_data) 
                        image_file.seek(0)
                        generated_media.append(image_file)
                    except Exception as e:
                        print(f"ERROR: {e}")
            uploaded_generated_media = [upload_image_to_azure(med, "content", True) for med in generated_media if med]
            content.media = content.media + uploaded_generated_media
            db.session.commit()
    return jsonify(content.to_dict()), 200

@app.route('/contents', methods=['GET'])
@auth_required
def contents():
    organization = request.user.organization
    if not organization:
        return jsonify({"error": "User is not part of an organization."}), 403

    contents = Content.query.filter_by(organization_id=organization.id).all()
    return jsonify([content.to_dict() for content in contents]), 200
