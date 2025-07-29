from flask import Blueprint

history_bp = Blueprint("history", __name__)

@history_bp.route("/history", methods=["GET"])
def get_history():
    return {"msg": "History route working!"}
