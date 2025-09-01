# routes/report.py
import os, uuid, datetime, traceback
from flask import Blueprint, request, jsonify, current_app, send_file, abort
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from firebase_admin_init import db

report_bp = Blueprint("report", __name__)

def _ts():
    return URLSafeTimedSerializer(current_app.config["REPORT_LINK_SECRET"])

def _ensure_dir(p):
    os.makedirs(p, exist_ok=True)

@report_bp.route("/report", methods=["POST"])
def create_report():
    """
    Two modes:
      A) With image (multipart/form-data):
         fields: userId, decision, confidence, threshold, filename?
         file field: "file"
      B) Without image (application/json):
         { userId, decision, confidence, threshold, filename? }
    Saves a Firestore doc in 'reports'. For (A), saves the image locally and stores a 7-day signed link.
    """
    try:
        ct = (request.headers.get("Content-Type") or "").lower()
        with_image = ct.startswith("multipart/form-data")

        image_relpath = None
        public_link = None
        expires_at = None

        if with_image:
            user_id = request.form.get("userId")
            decision = request.form.get("decision")
            confidence = float(request.form.get("confidence") or 0.0)
            threshold = float(request.form.get("threshold") or 0.0)
            filename = (request.form.get("filename") or "").strip()
            f = request.files.get("file")
            if not user_id or not f:
                return jsonify({"error": "userId and file required"}), 400

            base = current_app.config["REPORT_UPLOAD_DIR"]
            rid = uuid.uuid4().hex
            safe_name = filename or (getattr(f, "filename", None) or "image")
            user_dir = os.path.join(base, user_id)
            _ensure_dir(user_dir)
            disk_path = os.path.join(user_dir, f"{rid}_{safe_name}")
            f.save(disk_path)

            # Build a signed, time-limited link (valid 7 days)
            token_payload = {"path": disk_path}
            token = _ts().dumps(token_payload)
            public_link = f"/report/file/{rid}?token={token}"
            expires_at = (datetime.datetime.utcnow() + datetime.timedelta(days=7)).isoformat() + "Z"

        else:
            data = request.get_json(silent=True) or {}
            user_id = data.get("userId")
            decision = data.get("decision")
            confidence = float(data.get("confidence") or 0.0)
            threshold = float(data.get("threshold") or 0.0)
            filename = (data.get("filename") or "").strip()
            if not user_id:
                return jsonify({"error": "userId required"}), 400

        doc = {
            "userId": user_id,
            "decision": decision,
            "confidence": confidence,
            "threshold": threshold,
            "filename": filename,
            "imageUrl": public_link,          # None if not saved
            "imageUrlExpiresAt": expires_at,  # None if not saved
            "status": "open",
            "createdAt": datetime.datetime.utcnow().isoformat() + "Z",
        }
        ref = db.collection("reports").add(doc)[1]
        return jsonify({"ok": True, "reportId": ref.id, "imageUrl": public_link, "expiresAt": expires_at}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@report_bp.route("/report/file/<rid>", methods=["GET"])
def serve_report_file(rid):
    """Serve file only if token is valid and not expired (7 days)."""
    token = request.args.get("token")
    if not token:
        return abort(403)
    try:
        data = _ts().loads(token, max_age=7*24*3600)  # 7 days
        disk_path = data.get("path")
        if not disk_path or not os.path.exists(disk_path):
            return abort(404)
        # TODO: add admin auth check here if you have JWT/session
        return send_file(disk_path)
    except SignatureExpired:
        return abort(410)  # Gone: expired
    except BadSignature:
        return abort(403)
