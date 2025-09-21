import os
from flask import render_template, send_from_directory, session, redirect, url_for, current_app
from app import app

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/history')
def history():
    return render_template('history.html')

@app.route('/configuracion')
def configuracion():
    return render_template('configuracion.html')

@app.route('/set_language/<lang_code>')
def set_language(lang_code):
    if lang_code in app.config['LANGUAGES']:
        session['language'] = lang_code
    return redirect(url_for('configuracion'))

# Workaround for not being able to move asset files.
# Serve files from the 'docs' directory directly.
@app.route('/docs/<path:path>')
def send_docs(path):
    # Correctly construct the path to the 'docs' directory, which is one level above the app's root path.
    docs_dir = os.path.join(current_app.root_path, '..', 'docs')
    return send_from_directory(os.path.abspath(docs_dir), path)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, '..', 'docs', 'assets', 'img'),
                               'logo.png', mimetype='image/png')
