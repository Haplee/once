import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

from app import create_app, db

print("Initializing database...")
try:
    app = create_app()
    with app.app_context():
        db.init_db()
    print("SUCCESS: Database initialized.")
except Exception as e:
    print(f"FAILURE: {e}")
