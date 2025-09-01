# app.py
import os
from flask import Flask
from flask_cors import CORS
from firebase_admin_init import db  # noqa: F401

def create_app():
    app = Flask(__name__)

    # Allow your React dev server
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

    # --- NEW: local report storage config ---
    # Where to save reported images (relative or absolute path)
    app.config["REPORT_UPLOAD_DIR"] = os.getenv("REPORT_UPLOAD_DIR", "report_uploads")
    # Secret to sign the file links (set env var in prod!)
    app.config["REPORT_LINK_SECRET"] = os.getenv("REPORT_LINK_SECRET", "CHANGE_ME_TO_A_RANDOM_LONG_SECRET")

    # Import and register routes AFTER app is created
    from routes.scan import scan_bp
    from routes.history import history_bp
    from routes.report import report_bp

    app.register_blueprint(scan_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(report_bp)

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
