from app import app, db
from flask import request, jsonify
from models.campaign import Campaign
from models.organization import Organization
from utils import auth_required

@app.route('/campaign/create', methods=['POST'])
@auth_required
def create_campaign():
    data = request.json
    name = data.get('name')
    description = data.get('description', None)
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    budget = data.get('budget', 0)

    organization = request.user.organization
    if not organization:
        return jsonify({"error": "User is not part of an organization."}), 403

    new_campaign = Campaign(
        name=name,
        description=description,
        start_date=start_date,
        end_date=end_date,
        budget=budget,
        organization_id=organization.id
    )

    db.session.add(new_campaign)
    db.session.commit()

    return jsonify(new_campaign.to_dict()), 201


@app.route('/campaign/<id>', methods=['GET', 'PUT', 'DELETE'])
@auth_required
def campaign(id):
    campaign = Campaign.query.filter_by(id=id).first()
    if not campaign:
        return jsonify({"error": "Campaign could not be found."}), 404

    organization = request.user.organization
    if campaign.organization_id != organization.id:
        return jsonify({"error": "User is not authorized to perform this action."}), 403

    if request.method == 'DELETE':
        db.session.delete(campaign)
        db.session.commit()
        return jsonify({"message": "Campaign deleted successfully."}), 204

    elif request.method == 'PUT':
        data = request.json
        campaign.name = data.get('name', campaign.name)
        campaign.description = data.get('description', campaign.description)
        campaign.start_date = data.get('start_date', campaign.start_date)
        campaign.end_date = data.get('end_date', campaign.end_date)
        campaign.budget = data.get('budget', campaign.budget)

        db.session.commit()

    return jsonify(campaign.to_dict()), 200


@app.route('/campaigns', methods=['GET'])
@auth_required
def campaigns():
    organization = request.user.organization
    if not organization:
        return jsonify({"error": "User is not part of an organization."}), 403

    campaigns = Campaign.query.filter_by(organization_id=organization.id).all()
    return jsonify([campaign.to_dict() for campaign in campaigns]), 200
