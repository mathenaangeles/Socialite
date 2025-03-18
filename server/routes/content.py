from app import app, db
from flask import request, jsonify

from models.content import Content
from utils import auth_required, upload_image_to_azure, delete_image_from_azure

@app.route('/content/create', methods=['POST'])
@auth_required
def create_content():
    data = request.form
    title = data.get('title')
    channel = data.get('channel')
    type = data.get('type')
    status = data.get('status', 'Draft')
    caption = data.get('caption', None)
    link = data.get('link', None)

    user = request.user
    if not user.organization_id:
        return jsonify({"error": "User is not part of any organization."}), 403
    
    media_files = request.files.getlist('media')
    media = [upload_image_to_azure(img, "content") for img in media_files if img.filename]  # Ensure valid files

    new_content = Content(
        title=title,
        channel=channel,
        type=type,
        status=status,
        caption=caption,
        link=link,
        media=media,
        organization_id=user.organization_id
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
        content.status = data.get('status', content.status)
        content.caption = data.get('caption', content.caption)
        content.link = data.get('link', content.link)
        
        new_media = request.files.getlist('media')
        existing_media = data.get('existing_media', []) 
        removed_media = [med for med in (content.media or []) if med not in existing_media]
        for med in removed_media:
            delete_image_from_azure(med)
        uploaded_media = [upload_image_to_azure(med, "content") for med in new_media if med]
        content.media = existing_media + uploaded_media if existing_media else uploaded_media

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
