# This file is the entry point for Vercel's deployment.
# It imports the create_app function from our 'app' package
# and creates an instance of the app.
from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)