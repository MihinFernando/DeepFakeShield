import os
import sys

from flask import Flask
from flask_cors import CORS
# Use relative import
from firebase_admin_init import db
from routes.scan import bp as scan_bp   # 👈 rename to avoid clash
from routes.history import history_bp
from routes.report import report_bp

# ----------------- NEW IMPORTS & CONFIG -----------------
import cloudinary
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
# --------------------------------------------------------


def create_app():
    app = Flask(__name__)

    # Allow your React dev server
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

    # --- CLOUDINARY CONFIGURATION (using variables loaded from .env) ---
    cloudinary.config(
        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
        api_key=os.getenv('CLOUDINARY_API_KEY'),
        api_secret=os.getenv('CLOUDINARY_API_SECRET'),
        secure=True
    )
    
    if not cloudinary.config().cloud_name:
        print("⚠️ WARNING: Cloudinary credentials not found. Image uploads will fail.")

    # --- REMOVED OLD LOCAL STORAGE CONFIG ---
    # These lines are removed because we no longer save files locally:
    # app.config["REPORT_UPLOAD_DIR"] = os.getenv("REPORT_UPLOAD_DIR", "report_uploads")
    # app.config["REPORT_LINK_SECRET"] = os.getenv("REPORT_LINK_SECRET", "CHANGE_ME_TO_A_RANDOM_LONG_SECRET")
    # ---------------------------------------

    # Register blueprints
    app.register_blueprint(scan_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(report_bp)

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
