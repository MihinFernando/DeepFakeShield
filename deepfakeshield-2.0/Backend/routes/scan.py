# routes/scan.py
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from models.detector import detect_image  # your detector
from firebase_admin import auth, firestore as fb_firestore
import firebase_admin

from utils.auth import verify_firebase_id_token

scan_bp = Blueprint('scan', __name__)

def get_uid_from_request(req):
    """Return (uid, error_message). uid is None if not present/invalid."""
    auth_header = req.headers.get("Authorization", "")
    if not auth_header:
        return (None, None)
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return (None, "Invalid Authorization header format")
    id_token = parts[1]
    try:
        decoded = auth.verify_id_token(id_token)
        return (decoded.get("uid"), None)
    except Exception as e:
        return (None, f"Invalid ID token: {e}")

@scan_bp.route('/scan', methods=['POST'])
def scan_image():
    from app import db
    from firebase_admin import firestore

    # Get Authorization header
    auth_header = request.headers.get('Authorization', '')
    id_token = None
    if auth_header.startswith('Bearer '):
        id_token = auth_header.split(' ')[1]

    if id_token:
        user_uid = verify_firebase_id_token(id_token)
        if not user_uid:
            return jsonify({"error": "Invalid or expired token"}), 401
        user_id = user_uid  # use verified user id
    else:
        # fallback for mobile app (anonymous with userId in form)
        user_id = request.form.get('userId')
        if not user_id:
            return jsonify({"error": "Missing userId or Authorization token"}), 400

    if 'file' not in request.files:
        return jsonify({"error": "No image file uploaded"}), 400

    file = request.files['file']
    img_bytes = file.read()

    result = detect_image(img_bytes)
    if not result:
        return jsonify({"error": "Failed to process image"}), 500

    history_ref = db.collection('users').document(user_id).collection('history')
    history_ref.add({
        'filename': secure_filename(file.filename),
        'timestamp': firestore.SERVER_TIMESTAMP,
        'label': result["label"],
        'confidence': result["confidence"]
    })

    return jsonify(result)
