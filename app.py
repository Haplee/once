from flask import Flask, render_template, request, jsonify
import json
from datetime import datetime

# Initialize Flask App
app = Flask(__name__)

# In-memory data store for the transaction history.
# For a production application, this should be replaced with a database.
history = []

# --- Page Routes ---

@app.route('/')
def index():
    """Renders the main calculator page."""
    return render_template('index.html')

@app.route('/history')
def history_page():
    """Renders the history page with all recorded transactions."""
    return render_template('history.html', history=history)

# --- API Routes ---

@app.route('/api/history', methods=['POST'])
def add_to_history():
    """API endpoint to add a new transaction to the history."""
    data = request.json
    # Add a server-side timestamp
    data['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    # Insert at the beginning to have the most recent first
    history.insert(0, data)
    return jsonify(success=True)

@app.route('/api/arduino', methods=['GET', 'POST'])
def arduino_mock():
    """
    Mock API endpoint to simulate communication with an Arduino device.
    - POST: Simulates receiving data from the Arduino.
    - GET: Simulates sending a command to the Arduino.
    """
    if request.method == 'POST':
        data_received = request.json
        print(f"Data received from Arduino (mock): {data_received}")
        return jsonify({"status": "success", "message": "Data received", "data": data_received})
    else: # GET request
        return jsonify({"command": "getStatus", "param": "all"})

# --- Main Execution ---

if __name__ == '__main__':
    # Runs the Flask application in debug mode.
    app.run(debug=True)
