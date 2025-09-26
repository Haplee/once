import os
from flask import Flask, session, request
from flask_babel import Babel

def create_app(test_config=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__, instance_relative_config=True)

    # --- Configuration ---
    app.config.from_mapping(
        SECRET_KEY='dev',  # Change for production
        DATABASE=os.path.join(app.instance_path, 'app.sqlite'),
        LANGUAGES={
            'es': 'Español', 'en': 'English', 'gl': 'Galego',
            'ca': 'Català', 'va': 'Valencià', 'eu': 'Euskara'
        },
        BABEL_TRANSLATION_DIRECTORIES=os.path.join(app.root_path, 'translations')
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    def get_locale():
        """Determine the user's locale."""
        if 'language' in session:
            return session['language']
        return request.accept_languages.best_match(list(app.config['LANGUAGES'].keys()))

    babel = Babel(app, locale_selector=get_locale)

    @app.context_processor
    def inject_get_locale():
        """Inject get_locale function into all templates."""
        return dict(get_locale=get_locale)

    # --- Database Initialization ---
    from . import db
    db.init_app(app)

    # --- Blueprints ---
    from . import routes
    from . import api
    app.register_blueprint(routes.bp)
    app.register_blueprint(api.bp)

    return app