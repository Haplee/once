from flask import (
    Blueprint, render_template, request, jsonify, session, redirect, url_for, current_app
)
from app.db import get_db

main = Blueprint('main', __name__)

# --- VIEWS ---

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/history')
def history():
    return render_template('history.html')

@main.route('/configuracion')
def configuracion():
    return render_template('configuracion.html')

@main.route('/set_language/<lang_code>')
def set_language(lang_code):
    if lang_code in current_app.config['LANGUAGES']:
        session['language'] = lang_code
    return redirect(request.referrer or url_for('main.index'))

# --- API ENDPOINTS ---

@main.route('/api/calculate', methods=['POST'])
def calculate():
    """Internal API to calculate change safely."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        total = float(data.get('total', 0))
        received = float(data.get('received', 0))
        
        if total <= 0:
            return jsonify({'error': 'Total amount must be greater than zero'}), 400
            
        if received < total:
            return jsonify({'error': 'Insufficient amount received'}), 400
            
        change = round(received - total, 2)
        
        return jsonify({
            'success': True,
            'total': total,
            'received': received,
            'change': change
        })
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid input data (must be numbers)'}), 400
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

@main.route('/api/history', methods=['GET', 'POST'])
def api_history():
    db = get_db()
    
    if request.method == 'POST':
        # Save a new transaction
        data = request.get_json()
        if not data:
             return jsonify({'error': 'No data provided'}), 400
             
        try:
            total = float(data.get('total'))
            received = float(data.get('received'))
            change = float(data.get('change'))
            
            db.execute(
                'INSERT INTO history (total_amount, amount_received, change_returned) VALUES (?, ?, ?)',
                (total, received, change)
            )
            db.commit()
            return jsonify({'success': True})
        except (ValueError, TypeError, KeyError) as e:
            return jsonify({'error': f'Invalid or missing data: {str(e)}'}), 400
        except Exception as e:
            return jsonify({'error': f'Database error: {str(e)}'}), 500
            
    elif request.method == 'GET':
        # Retrieve transactions (limit 50 by default)
        cursor = db.execute(
            'SELECT id, timestamp, total_amount, amount_received, change_returned, currency FROM history ORDER BY timestamp DESC LIMIT 50'
        )
        rows = cursor.fetchall()
        
        results = []
        for row in rows:
            results.append({
                'id': row['id'],
                'timestamp': row['timestamp'],
                'total_amount': row['total_amount'],
                'amount_received': row['amount_received'],
                'change_returned': row['change_returned'],
                'currency': row['currency']
            })
            
        return jsonify(results)