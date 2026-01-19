import os
from flask import Flask, request, session, g
from flask_babel import Babel, gettext as _

# --- Database Init ---
from . import db
# --- Blueprints ---
from . import routes

def create_app(test_config=None):
    # Determine paths relative to this file (api/index.py)
    # Styles and JS are in /public (standard Vercel static output)
    # Templates are in /template_source
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    static_folder = os.path.join(base_dir, 'public', 'static')
    template_folder = os.path.join(base_dir, 'template_source')

    app = Flask(__name__, 
                instance_relative_config=True,
                static_folder=static_folder,
                template_folder=template_folder)
    
    # Configure database path
    if os.environ.get('VERCEL'):
        db_path = os.path.join('/tmp', 'once_app.sqlite')
    else:
        db_path = os.path.join(app.root_path, 'once_app.sqlite')
    
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=db_path,
        LANGUAGES=['es', 'en', 'gl', 'ca', 'va', 'ca_ES', 'eu', 'fr'],
        BABEL_TRANSLATION_DIRECTORIES=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'translations'),
        SEND_FILE_MAX_AGE_DEFAULT=0
    )

    if test_config:
        app.config.from_mapping(test_config)

    db.init_app(app)

    def get_locale():
        lang = session.get('language')
        if not lang:
            lang = request.accept_languages.best_match(app.config['LANGUAGES'])
        if lang == 'va':
            return 'ca_ES'
        return lang

    babel = Babel(app, locale_selector=get_locale)

    @app.context_processor
    def inject_conf_var():
        return dict(get_locale=get_locale, _=_, gettext=_)

    app.register_blueprint(routes.main)

    return app

# Initialize the app instance for Vercel
app = create_app()
