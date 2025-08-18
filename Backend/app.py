# app.py
from flask import Flask
from flask_cors import CORS

# ✅ Initialize Firebase Admin BEFORE routes are imported
# (this reads Backend/firebase/serviceAccountKey.json via firebase_admin_init.py)
from firebase_admin_init import db  # noqa: F401  (ensures init)

def create_app():
    app = Flask(__name__)

    # Allow your React dev server
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

    # Import and register blueprints AFTER init
    from routes.scan import scan_bp
    from routes.report import report_bp
    from routes.history import history_bp

    app.register_blueprint(scan_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(history_bp)

    return app

app = create_app()

if __name__ == "__main__":
    # Run from the Backend folder:
    #   cd Backend
    #   python app.py
    app.run(debug=True)
