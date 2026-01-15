import os
from flask import Flask, request, session
from flask_babel import Babel

def create_app(test_config=None):
    # Create and configure the app
    # static_folder and static_url_path are set explicitly to ensure assets load correctly
    app = Flask(__name__, instance_relative_config=True, static_folder='static', static_url_path='/static')
    
    # Simple configuration
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'once_app.sqlite'),
        LANGUAGES=['es', 'en', 'gl', 'ca', 'va', 'eu']
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # --- Database Init ---
    from . import db
    db.init_app(app)

    # --- I18N ---
    def get_locale():
        if 'language' in session:
            return session['language']
        # Try to match the best language from the request
        return request.accept_languages.best_match(app.config['LANGUAGES'])

    babel = Babel(app, locale_selector=get_locale)

    # --- Blueprints ---
    from . import routes
    app.register_blueprint(routes.main)

    return app
