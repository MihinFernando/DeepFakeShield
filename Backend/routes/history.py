# routes/history.py
from flask import Blueprint, request, jsonify
from datetime import datetime
from firebase_admin_init import db
from google.cloud import firestore as gcfs  # for Query.DESCENDING
import traceback

history_bp = Blueprint('history', __name__)

@history_bp.route('/history', methods=['POST'])
def get_user_history():
    try:
        data = request.get_json(silent=True) or {}
        user_id = data.get("userId")
        if not user_id:
            return jsonify({"error": "Missing userId"}), 400

        # Path MUST match where scan.py writes:
        # users/{uid}/scans ordered by timestamp desc
        q = (
            db.collection("users")
              .document(user_id)
              .collection("scans")
              .order_by("timestamp", direction=gcfs.Query.DESCENDING)
              .limit(100)
        )

        items = []
        for snap in q.stream():
            doc = snap.to_dict()
            ts = doc.get("timestamp")
            ts_str = ""
            try:
                if hasattr(ts, "to_datetime"):
                    ts_str = ts.to_datetime().strftime("%Y-%m-%d %H:%M:%S")
            except Exception:
                ts_str = ""

            items.append({
                "filename": doc.get("filename", ""),
                "decision": doc.get("decision", ""),
                "confidence": doc.get("confidence", None),
                "threshold": doc.get("threshold", None),
                "timestamp": ts_str,
            })

        return jsonify(items), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
