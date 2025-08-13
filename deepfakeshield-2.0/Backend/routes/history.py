# routes/history.py
from flask import Blueprint, request, jsonify
from firebase_admin import auth
history_bp = Blueprint('history', __name__)

def get_uid_from_request(req):
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

@history_bp.route('/history', methods=['POST'])
def get_user_history():
    from app import db  # avoid circular import

    uid, token_err = get_uid_from_request(request)
    if token_err:
        return jsonify({"error": token_err}), 401

    data = request.get_json() or {}
    user_id = uid or data.get("userId")

    if not user_id:
        return jsonify({"error": "Missing userId (and no valid Firebase token provided)"}), 400

    history_ref = db.collection('users').document(user_id).collection('history')
    docs = history_ref.order_by('timestamp', direction='DESCENDING').stream()

    history_list = []
    for doc in docs:
        doc_data = doc.to_dict()
        ts = doc_data.get('timestamp')
        if ts:
            # Timestamp might be a Firestore Timestamp object
            try:
                doc_data['timestamp'] = ts.strftime('%Y-%m-%d %H:%M:%S')
            except Exception:
                # If it's Firestore Timestamp, it has to_datetime()
                try:
                    doc_data['timestamp'] = ts.to_datetime().strftime('%Y-%m-%d %H:%M:%S')
                except Exception:
                    doc_data['timestamp'] = str(ts)
        history_list.append(doc_data)

    return jsonify(history_list)
