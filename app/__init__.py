import os
from flask import Flask, request, session, g
from flask_babel import Babel, gettext as _

def create_app(test_config=None):
    # Create and configure the app
    app = Flask(__name__, instance_relative_config=True, static_folder='static', static_url_path='/static')
    
    # Configure path to be in the app directory for safety
    db_path = os.path.join(app.root_path, 'once_app.sqlite')
    
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=db_path,
        LANGUAGES=['es', 'en', 'gl', 'ca', 'va', 'eu'],
        # Explicitly set translations directory
        BABEL_TRANSLATION_DIRECTORIES=os.path.join(app.root_path, 'translations')
    )

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    # --- Database Init ---
    from . import db
    db.init_app(app)

    # --- I18N ---
    def get_locale():
        if 'language' in session:
            return session['language']
        return request.accept_languages.best_match(app.config['LANGUAGES'])

    babel = Babel(app, locale_selector=get_locale)

    # Explicitly inject into templates to prevent 500 errors
    @app.context_processor
    def inject_conf_var():
        return dict(
            get_locale=get_locale,
            _=_,
            gettext=_
        )

    # --- Blueprints ---
    from . import routes
    app.register_blueprint(routes.main)

    return app
