import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask
from flask_cors import CORS

# Initialize Firebase only once
if not firebase_admin._apps:
    cred = credentials.Certificate("service-account-key.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

app = Flask(__name__)
CORS(app)

from routes.scan import scan_bp
from routes.report import report_bp
from routes.history import history_bp

app.register_blueprint(scan_bp)
app.register_blueprint(report_bp)
app.register_blueprint(history_bp)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
