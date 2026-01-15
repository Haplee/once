import os
from app import create_app, db

app = create_app()

# Auto-initialize database if it doesn't exist
with app.app_context():
    db_path = app.config['DATABASE']
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}. Initializing...")
        db.init_db()
        print("Database initialized successfully.")

if __name__ == '__main__':
    # host='0.0.0.0' allows external access (required for Raspberry Pi)
    app.run(host='0.0.0.0', port=5000, debug=True)
