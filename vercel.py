from app import create_app, db

app = create_app()

# Initialize DB in serverless environment
with app.app_context():
    db.init_db()

if __name__ == '__main__':
    app.run()