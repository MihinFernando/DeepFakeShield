from flask import Blueprint

report_bp = Blueprint("report", __name__)

# Add your routes here
@report_bp.route('/report', methods=['POST'])
def report():
    return {"msg": "report received"}
