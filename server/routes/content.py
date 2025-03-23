from app import app, db
from flask import request, jsonify

from models.content import Content
from services.content import content_graph_executor, ContentState
from utils import auth_required, upload_image_to_azure, delete_image_from_azure

@app.route('/content/create', methods=['POST'])
@auth_required
def create_content():
    data = request.form
    title = data.get('title')
    channel = data.get('channel')
    type = data.get('type')
    objective = data.get('objective')
    audience = data.get('audience')
    status = data.get('status', 'Draft')

    instructions = data.get('instructions')

    user = request.user
    if not user.organization_id:
        return jsonify({"error": "User is not part of any organization."}), 403
    
    state = ContentState(title, channel, type, objective, audience, instructions)
    final_state = content_graph_executor.invoke(state)
    
    media_files = final_state.generated_media
    media = [upload_image_to_azure(img, "content") for img in media_files if img]

    new_content = Content(
        title=title,
        channel=channel,
        type=type,
        status=status,
        text=final_state.generated_text,
        tags=final_state.generated_tags,
        media=media,
        organization_id=user.organization_id
    )
    
    db.session.add(new_content)
    db.session.commit()
    return jsonify({
        "content": new_content.to_dict(),
        "evaluation": final_state.evaluation
    }), 201


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
        regenerate = data.get('regenerate')
        instructions = data.get('instructions')

        content.title = data.get('title', content.title)
        content.channel = data.get('channel', content.channel)
        content.type = data.get('type', content.type)
        content.objective = data.get('objective', content.objective)
        content.audience = data.get('audience', content.audience)
        content.status = data.get('status', content.status)
        content.link = data.get('link', content.link)
        content.text = data.get('caption', content.text)
        content.tags = data.get('tags', content.tags)

        if regenerate:
            
            state = ContentState(content.title, content.channel, content.type, content.objective, content.audience, instructions)
            final_state = content_graph_executor.invoke(state)

            content.text = final_state.generated_text
            content.tags = final_state.generated_tags

            db.session.commit()

            return jsonify({
                "content": content.to_dict(),
                "evaluation": final_state.evaluation
            }), 200
        
        else:
            new_media = request.files.getlist('media')
            existing_media = data.get('existing_media') 
            removed_media = set(content.media) - set(existing_media)
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
