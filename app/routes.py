import os
import json
from flask import Blueprint, render_template, send_from_directory, session, redirect, url_for, current_app, request
from flask_babel import gettext

bp = Blueprint('main', __name__)

def get_frontend_translations():
    """Gathers all translations needed by the frontend and returns them as a dictionary."""
    keys = [
        'invalidInputText', 'serverCommunicationError', 'changeResultText',
        'genericError', 'speechChangeToReturn', 'speechZero', 'speechEuroPlural',
        'speechOneEuro', 'speechOneCent', 'speechCentPlural', 'speechWith',
        'historyEmpty', 'historyError', 'serialNotSupported', 'serialConfigSent',
        'serialConfigError', 'serialConnected', 'serialDisconnect',
        'serialConnectError', 'serialDisconnected', 'serialDisconnectError',
        'serialConnect', 'serialReceived', 'serialReadError', 'serialSent',
        'serialSendError', 'speechRecognitionNotAvailable',
        'speechRecognitionInitError', 'speechProcessing', 'speechRecognized',
        'speechNotInterpreted', 'speechError', 'speechStartError',
        'amountReceivedLowText', 'speechKeywords', 'smallWords'
    ]
    return {key: gettext(key) for key in keys}

@bp.route('/')
def index():
    return render_template('index.html', translations=json.dumps(get_frontend_translations()))

@bp.route('/history')
def history():
    return render_template('history.html', translations=json.dumps(get_frontend_translations()))

@bp.route('/configuracion')
def configuracion():
    return render_template('configuracion.html', translations=json.dumps(get_frontend_translations()))

@bp.route('/set_language/<lang_code>')
def set_language(lang_code):
    if lang_code in current_app.config['LANGUAGES']:
        session['language'] = lang_code
    return redirect(request.referrer or url_for('main.configuracion'))

# This route is a workaround for serving static files from the `docs` directory,
# which is not a standard Flask practice but is part of the original project structure.
@bp.route('/docs/<path:path>')
def send_docs(path):
    docs_dir = os.path.join(current_app.root_path, '..', 'docs')
    return send_from_directory(os.path.abspath(docs_dir), path)

@bp.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(current_app.root_path, '..', 'docs', 'assets', 'img'),
                               'logo.png', mimetype='image/png')