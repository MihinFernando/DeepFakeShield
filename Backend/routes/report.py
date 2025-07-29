from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from datetime import datetime

report_bp = Blueprint('report', __name__)  # ✅ This defines the Blueprint

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client['deepfake_db']
reports_collection = db['reports']

@report_bp.route('/report', methods=['POST'])
def report_image():
    data = request.json
    user_email = data.get('email')
    image_url = data.get('image_url')
    result = data.get('result')

    if not user_email or not image_url or not result:
        return jsonify({"error": "Missing fields"}), 400

    report_entry = {
        "email": user_email,
        "image_url": image_url,
        "result": result,
        "timestamp": datetime.utcnow()
    }

    reports_collection.insert_one(report_entry)

    return jsonify({"message": "Image reported successfully"}), 200
