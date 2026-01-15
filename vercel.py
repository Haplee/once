import os
import subprocess

# Compile translations before starting the app
# Compile translations only if .mo files are missing (optimization for serverless)
translations_dir = os.path.join(os.path.dirname(__file__), 'app', 'translations')
if os.path.exists(translations_dir):
    try:
        # Check if we need to compile: naive check if 'es/LC_MESSAGES/messages.mo' exists
        # If not, try to compile.
        es_mo = os.path.join(translations_dir, 'es', 'LC_MESSAGES', 'messages.mo')
        if not os.path.exists(es_mo):
            print("Compiling translations...")
            subprocess.run(['pybabel', 'compile', '-d', translations_dir], check=True)
    except Exception as e:
        print(f"Warning: Could not compile translations: {e}")

# This file is the entry point for Vercel's deployment.
# It imports the Flask app instance from our 'app' package.
from app import app
from app.db import init_db

# Auto-initialize database for serverless/Vercel environments
with app.app_context():
    db_path = app.config['DATABASE']
    if not os.path.exists(db_path):
        # Create directory if it handles a custom path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        init_db()
        print(f"Initialized database at {db_path}")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)