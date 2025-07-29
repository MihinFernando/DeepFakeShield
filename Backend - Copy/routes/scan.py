from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
from models.detector import detect_image

scan_bp = Blueprint('scan', __name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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

    return jsonify(result)
