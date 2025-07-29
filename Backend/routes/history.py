from flask import Blueprint, jsonify
from db import reports_collection

history_bp = Blueprint('history_bp', __name__)

@history_bp.route('/history/<user_id>', methods=['GET'])
def get_history(user_id):
    history = list(reports_collection.find({'user_id': user_id}, {'_id': 0}))
    return jsonify(history)
