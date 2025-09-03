# Backend/routes/history.py
from flask import Blueprint, request, jsonify
from Backend.firebase_admin_init import db
from google.cloud import firestore as gcfs  # Query.DESCENDING, SERVER_TIMESTAMP
import datetime
import traceback

history_bp = Blueprint('history', __name__)

@history_bp.route('/history', methods=['POST'])
def get_user_history():
    try:
        data = request.get_json(silent=True) or {}
        user_id = data.get("userId")
        if not user_id:
            return jsonify({"error": "Missing userId"}), 400

        # Primary query: order by 'timestamp' (server timestamp)
        q = (
            db.collection("users")
              .document(user_id)
              .collection("scans")
              .order_by("timestamp", direction=gcfs.Query.DESCENDING)
              .limit(100)
        )

        items = []
        for snap in q.stream():
            doc = snap.to_dict() or {}
            ts = doc.get("timestamp")
            ts_str = ""

            # Prefer Firestore Timestamp
            try:
                if ts is not None:
                    # Firestore Timestamp -> python datetime
                    if hasattr(ts, "to_datetime"):
                        dt = ts.to_datetime()
                    else:
                        dt = ts  # already datetime?
                    if isinstance(dt, datetime.datetime):
                        ts_str = dt.strftime("%Y-%m-%d %H:%M:%S")
                else:
                    # Fallback to old float 'createdAt'
                    created_at = doc.get("createdAt")
                    if isinstance(created_at, (int, float)):
                        dt = datetime.datetime.fromtimestamp(created_at)
                        ts_str = dt.strftime("%Y-%m-%d %H:%M:%S")
            except Exception:
                ts_str = ""

            items.append({
                "filename": doc.get("filename", ""),
                "decision": doc.get("decision", ""),
                "confidence": doc.get("confidence"),
                "threshold": doc.get("threshold"),
                "timestamp": ts_str,
            })

        return jsonify(items), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
