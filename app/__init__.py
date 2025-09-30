import os
from flask import Flask, session, request
from flask_babel import Babel

LANGUAGES = {
    'es': 'Español',
    'en': 'English',
    'gl': 'Galego',
    'ca': 'Català',
    'va': 'Valencià',
    'eu': 'Euskara'
}

def get_locale():
    """Determine the user's locale."""
    if 'language' in session:
        return session['language']
    return request.accept_languages.best_match(list(LANGUAGES.keys()))

# Initialize the app
app = Flask(__name__, instance_relative_config=True)

# --- Configuration ---
app.config.from_mapping(
    SECRET_KEY='dev',  # Change for production
    DATABASE=os.path.join(app.instance_path, 'app.sqlite'),
    LANGUAGES=LANGUAGES,
    BABEL_TRANSLATION_DIRECTORIES=os.path.join(app.root_path, 'translations')
)

@app.context_processor
def inject_get_locale():
    """Inject get_locale function into all templates."""
    return dict(get_locale=get_locale)

# Ensure the instance folder exists
try:
    os.makedirs(app.instance_path)
except OSError:
    pass

# --- Babel for i18n ---
babel = Babel(app, locale_selector=get_locale)

# --- Database Initialization ---
from . import db
db.init_app(app)

# --- Blueprints ---
from . import routes
from . import api
app.register_blueprint(api.api)
