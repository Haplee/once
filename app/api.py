import datetime
from flask import Blueprint, request, jsonify
from flask_babel import gettext
from .db import get_db

bp = Blueprint('api', __name__, url_prefix='/api')

@bp.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    if not data or 'total' not in data or 'received' not in data:
        return jsonify({'error': gettext('Missing required fields')}), 400

    try:
        total = float(data['total'])
        received = float(data['received'])
    except (ValueError, TypeError):
        return jsonify({'error': gettext('Invalid number format')}), 400

    if received < total:
        return jsonify({'error': gettext('amountReceivedLowText')}), 400

    change = received - total
    return jsonify({'change': round(change, 2)})

@bp.route('/history', methods=['GET'])
def get_history():
    db = get_db()
    transactions = db.execute(
        'SELECT id, timestamp, total, received, change FROM transaction_history ORDER BY timestamp DESC'
    ).fetchall()
    history_list = [dict(row) for row in transactions]
    return jsonify(history_list)

@bp.route('/history', methods=['POST'])
def add_history():
    data = request.get_json()
    if not data or 'total' not in data or 'received' not in data or 'change' not in data:
        return jsonify({'error': gettext('Missing required fields')}), 400

    try:
        total = float(data['total'])
        received = float(data['received'])
        change = float(data['change'])
    except (ValueError, TypeError):
        return jsonify({'error': gettext('Invalid number format')}), 400

    db = get_db()
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    db.execute(
        'INSERT INTO transaction_history (timestamp, total, received, change) VALUES (?, ?, ?, ?)',
        (timestamp, total, received, change)
    )
    db.commit()

    return jsonify({'status': 'success'}), 201