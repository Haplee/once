from flask import (
    Blueprint, render_template, session, redirect, url_for, current_app
)

# Create a Blueprint for the main routes
main = Blueprint('main', __name__)

@main.route('/')
def index():
    """Render the main calculator page."""
    return render_template('index.html')

@main.route('/history')
def history():
    """Render the transaction history page."""
    return render_template('history.html')

@main.route('/configuracion')
def configuracion():
    """Render the configuration page."""
    return render_template('configuracion.html')

@main.route('/set_language/<lang_code>')
def set_language(lang_code):
    """Set the user's preferred language."""
    if lang_code in current_app.config['LANGUAGES']:
        session['language'] = lang_code
    # Redirect back to the configuration page
    return redirect(url_for('main.configuracion'))