import os
import sys

from flask import Flask
from flask_cors import CORS
# Use relative import
from firebase_admin_init import db
from routes.scan import bp as scan_bp   # 👈 rename to avoid clash
from routes.history import history_bp
from routes.report import report_bp


def create_app():
    app = Flask(__name__)

    # Allow your React dev server
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

    # --- NEW: local report storage config ---
    app.config["REPORT_UPLOAD_DIR"] = os.getenv("REPORT_UPLOAD_DIR", "report_uploads")
    app.config["REPORT_LINK_SECRET"] = os.getenv("REPORT_LINK_SECRET", "CHANGE_ME_TO_A_RANDOM_LONG_SECRET")

    # Register blueprints
    app.register_blueprint(scan_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(report_bp)

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)