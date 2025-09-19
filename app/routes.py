from flask import render_template, send_from_directory, session, redirect, url_for
from app import app

@app.route('/')
def index():
    # This will eventually render the main calculator page
    return render_template('index.html')

@app.route('/history')
def history():
    # This will render the history page
    return render_template('history.html')

@app.route('/configuracion')
def configuracion():
    # This will render the settings page
    return render_template('configuracion.html')

@app.route('/set_language/<lang_code>')
def set_language(lang_code):
    if lang_code in app.config['LANGUAGES']:
        session['language'] = lang_code
    # Redirect to the settings page, which is where the language switcher is
    return redirect(url_for('configuracion'))


# Workaround for not being able to move asset files.
# Serve files from the 'docs' directory directly.
@app.route('/docs/<path:path>')
def send_docs(path):
    return send_from_directory('docs', path)
