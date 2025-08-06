from flask import Blueprint, request, jsonify
import json
import os
from datetime import datetime

history_bp = Blueprint('history', __name__)

HISTORY_FILE = "history.json"
if not os.path.exists(HISTORY_FILE):
    with open(HISTORY_FILE, "w") as f:
        json.dump({}, f)

@history_bp.route('/history', methods=['POST'])
def get_user_history():
    data = request.get_json()
    user_id = data.get("userId")

    if not user_id:
        return jsonify({"error": "Missing userId"}), 400

    with open(HISTORY_FILE, "r") as f:
        history_data = json.load(f)

    return jsonify(history_data.get(user_id, []))
