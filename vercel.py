# This file is the entry point for Vercel's deployment.
# It imports the Flask app instance from our 'app' package.
from app import app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
