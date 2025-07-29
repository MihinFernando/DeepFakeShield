from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Register routes
from routes.scan import scan_bp
from routes.report import report_bp
from routes.history import history_bp

app.register_blueprint(scan_bp)
app.register_blueprint(report_bp)
app.register_blueprint(history_bp)

if __name__ == "__main__":
    app.run(debug=True)
