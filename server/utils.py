import os
import uuid
from functools import wraps
from flask import request, jsonify, session
from azure.storage.blob import BlobServiceClient

from models.user import User

AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME")
AZURE_STORAGE_ACCOUNT_NAME = os.getenv("AZURE_STORAGE_ACCOUNT_NAME")

blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)

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

def upload_image_to_azure(image, directory, isGenerated=False):
    try:
        blob_name = f"{directory}/{uuid.uuid4()}.png" if isGenerated else f"{directory}/{uuid.uuid4()}-{image.filename}"
        blob_client = blob_service_client.get_blob_client(container=AZURE_CONTAINER_NAME, blob=blob_name)
        blob_client.upload_blob(image, overwrite=True)
        image_url = f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/{AZURE_CONTAINER_NAME}/{blob_name}"
        return image_url
    except Exception as e:
        print(f"Error uploading image to Azure: {e}")
        return None
    
def delete_image_from_azure(image_url):
    try:
        base_url = f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/{AZURE_CONTAINER_NAME}/"
        if not image_url.startswith(base_url):
            print("Invalid image URL format")
            return None
        blob_name = image_url[len(base_url):] 
        blob_client = blob_service_client.get_blob_client(container=AZURE_CONTAINER_NAME, blob=blob_name)
        blob_client.delete_blob()
        print(f"Deleted: {blob_name}")
        return True
    except Exception as e:
        print(f"Error deleting image from Azure: {e}")
        return False

