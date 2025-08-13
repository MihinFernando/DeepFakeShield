# routes/scan.py
import os
from datetime import datetime
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from models.detector import detect_image

from firebase_admin_init import db
from firebase_admin import firestore
import traceback

scan_bp = Blueprint('scan', __name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

CONF_THRESHOLD = 0.80  # 80%

@scan_bp.route('/scan', methods=['POST'])
def scan_image():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No image file uploaded"}), 400

        file = request.files['file']
        user_id = request.form.get('userId')  # None for guests

        filename = secure_filename(file.filename or "image")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # detect_image returns {"label": "fake"/"real", "confidence": 0..1}
        result = detect_image(filepath)

        # Clean up temp file
        try:
            os.remove(filepath)
        except Exception:
            pass

        conf = float(result.get("confidence", 0.0))
        raw_label = (result.get("label", "unknown") or "").lower()

        # Decision policy
        decision = "fake" if (raw_label == "fake" and conf >= CONF_THRESHOLD) else "real"
        is_confident = (raw_label == "fake" and conf >= CONF_THRESHOLD)

        # Save to Firestore if user is logged in
        if user_id:
            doc = {
                "filename": filename,
                "raw_label": raw_label,   # for auditing
                "decision": decision,     # final decision shown in UI
                "confidence": conf,       # 0..1
                "threshold": CONF_THRESHOLD,
                "timestamp": firestore.SERVER_TIMESTAMP,
            }
            # Path MUST match history route:
            db.collection("users").document(user_id).collection("scans").add(doc)

        # Return enriched payload to the client
        # Note: SERVER_TIMESTAMP resolves asynchronously; we include a human time for immediate UI display.
        return jsonify({
            "label": raw_label,
            "confidence": conf,
            "decision": decision,
            "is_confident": is_confident,
            "threshold": CONF_THRESHOLD,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
