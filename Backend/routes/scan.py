from flask import Blueprint, request, jsonify
import os
import json
from datetime import datetime
from werkzeug.utils import secure_filename
from models.detector import detect_image

scan_bp = Blueprint('scan', __name__)

UPLOAD_FOLDER = "uploads"
HISTORY_FILE = "history.json"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Ensure history.json exists
if not os.path.exists(HISTORY_FILE):
    with open(HISTORY_FILE, "w") as f:
        json.dump({}, f)

@scan_bp.route('/scan', methods=['POST'])
def scan_image():
    if 'file' not in request.files:
        return jsonify({"error": "No image file uploaded"}), 400

    file = request.files['file']
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    result = detect_image(filepath)
    os.remove(filepath)

    # ✅ Get userId from frontend (if logged in)
    user_id = request.form.get('userId')

    if user_id:
        try:
            with open(HISTORY_FILE, "r") as f:
                history_data = json.load(f)
        except:
            history_data = {}

        if user_id not in history_data:
            history_data[user_id] = []

        history_data[user_id].append({
            "filename": filename,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "label": result["label"],
            "confidence": result["confidence"]
        })

        with open(HISTORY_FILE, "w") as f:
            json.dump(history_data, f, indent=2)

    return jsonify(result)
