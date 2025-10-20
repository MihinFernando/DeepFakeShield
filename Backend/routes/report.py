import os, uuid, datetime, traceback
from flask import Blueprint, request, jsonify, abort
# Import the Cloudinary uploader
import cloudinary.uploader 
from firebase_admin_init import db

report_bp = Blueprint("report", __name__)

# --- Cloudinary Storage Logic ---
def upload_image_to_cloudinary(file_storage, report_id, original_filename):
    """
    Uploads the file object to Cloudinary and returns the permanent public URL.
    """
    try:
        # Use the report_id to create a unique file ID in the Cloudinary folder.
        upload_result = cloudinary.uploader.upload(
            file_storage,
            folder="deepfakeshield_reports", # All files go into this folder in Cloudinary
            public_id=f"{report_id}_{os.path.splitext(original_filename)[0]}",
            resource_type="image",
            # FIX: The access control type must be 'anonymous' to signal public readability
            access_control=[{"access_type": "anonymous"}] 
        )
        
        # The secure_url is the HTTPS link to the uploaded image
        return upload_result.get("secure_url")
        
    except cloudinary.exceptions.Error as e:
        print(f"Cloudinary Upload Error: {e}")
        # Re-raise as a RuntimeError to catch it in the main route handler
        raise RuntimeError(f"Cloudinary upload failed: {e}") 
    except Exception as e:
        print(f"General Upload Error: {e}")
        raise RuntimeError(f"Image upload failed: {e}")

# --- END Cloudinary Storage Logic ---


@report_bp.route("/report", methods=["POST"])
def create_report():
    """
    Two modes:
      A) With image (multipart/form-data): Uploads to Cloudinary.
      B) Without image (application/json).
    Saves a Firestore doc in 'reports' with the image URL.
    """
    try:
        ct = (request.headers.get("Content-Type") or "").lower()
        with_image = ct.startswith("multipart/form-data")

        public_link = None
        
        # Generate the report ID before upload
        final_report_id = str(uuid.uuid4())

        if with_image:
            user_id = request.form.get("userId")
            decision = request.form.get("decision")
            confidence = float(request.form.get("confidence", 0))
            threshold = float(request.form.get("threshold", 0))
            
            # 1. Get the file from the request
            if 'file' not in request.files:
                return jsonify({"error": "No file part in request"}), 400
            file = request.files['file']
            if file.filename == '':
                return jsonify({"error": "No selected file"}), 400
                
            filename = file.filename 
            
            # 2. Upload file to Cloudinary
            public_link = upload_image_to_cloudinary(file, final_report_id, file.filename)

        else: # Without image (application/json)
            data = request.get_json()
            user_id = data.get("userId")
            decision = data.get("decision")
            confidence = data.get("confidence", 0)
            threshold = data.get("threshold", 0)
            filename = data.get("filename")

        # Validation (for both modes)
        if not decision or not decision.strip():
            return jsonify({"error": "decision required"}), 400
        if not user_id or not user_id.strip():
            return jsonify({"error": "userId required"}), 400

        doc = {
            "userId": user_id.strip(),
            "decision": decision.strip(),
            "confidence": confidence,
            "threshold": threshold,
            "filename": filename,
            "imageUrl": public_link,          # Cloudinary permanent URL (or None)
            "status": "open",
            "createdAt": datetime.datetime.utcnow().isoformat() + "Z",
        }
        
        # 3. Save to Firestore
        ref = db.collection("reports").add(doc)[1]
        
        return jsonify({"ok": True, "reportId": ref.id, "imageUrl": public_link}), 200

    except RuntimeError as e:
        # Catch custom error from upload_image_to_cloudinary
        # This will return the specific Cloudinary error message to the client (for debugging)
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Internal server error: " + str(e)}), 500

# The old local file serving route is removed as it's now obsolete.
@report_bp.route("/report/file/<rid>", methods=["GET"])
def serve_report_file(rid):
    """This route is obsolete. Images are served directly from Cloudinary."""
    return abort(404, description="File serving is disabled. Images are served from Cloudinary.")
