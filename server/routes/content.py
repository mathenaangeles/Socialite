from app import app, db
from flask import request, jsonify

from models.content import Content
from models.organization import Organization
from utils import auth_required

@app.route('/content/create', methods=['POST'])
@auth_required
def create_content():
    data = request.json
    title = data.get('title')
    channel = data.get('channel')
    content_type = data.get('type')
    status = data.get('status', 'draft')
    caption = data.get('caption', None)
    link = data.get('link', None)
    media_url = data.get('media_url', None)

    organization = request.user.organization
    if not organization:
        return jsonify({"error": "User is not part of an organization."}), 403

    new_content = Content(
        title=title,
        channel=channel,
        type=content_type,
        status=status,
        caption=caption,
        link=link,
        media_url=media_url,
        organization_id=organization.id
    )

    db.session.add(new_content)
    db.session.commit()

    return jsonify(new_content.to_dict()), 201


@app.route('/content/<id>', methods=['GET', 'PUT', 'DELETE'])
@auth_required
def content(id):
    content = Content.query.filter_by(id=id).first()
    if not content:
        return jsonify({"error": "Content not found."}), 404

    organization = request.user.organization
    if content.organization_id != organization.id:
        return jsonify({"error": "The user is not authorized to perform this action."}), 403

    if request.method == 'DELETE':
        db.session.delete(content)
        db.session.commit()
        return jsonify({"message": "Content deleted successfully."}), 204

    elif request.method == 'PUT':
        data = request.json
        content.title = data.get('title', content.title)
        content.channel = data.get('channel', content.channel)
        content.type = data.get('type', content.type)
        content.status = data.get('status', content.status)
        content.caption = data.get('caption', content.caption)
        content.link = data.get('link', content.link)
        content.media_url = data.get('media_url', content.media_url)

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
