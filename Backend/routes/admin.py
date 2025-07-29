from flask import Blueprint, jsonify
from db import reports_collection
from datetime import datetime, timedelta

admin_bp = Blueprint('admin_bp', __name__)


@admin_bp.route('/admin/analytics', methods=['GET'])
def get_admin_analytics():
    total_scans = reports_collection.count_documents({})

    # Calculate average daily scans (past 7 days)
    today = datetime.utcnow()
    one_week_ago = today - timedelta(days=7)

    recent_reports = reports_collection.find({'timestamp': {'$gte': one_week_ago}})
    daily_counts = {}

    for report in recent_reports:
        day = report['timestamp'].strftime('%Y-%m-%d')
        daily_counts[day] = daily_counts.get(day, 0) + 1

    average_daily_scans = (
        sum(daily_counts.values()) / 7 if daily_counts else 0
    )

    analytics = {
        'total_scans': total_scans,
        'average_daily_scans': round(average_daily_scans, 2),
        'daily_breakdown': daily_counts
    }

    return jsonify(analytics)
