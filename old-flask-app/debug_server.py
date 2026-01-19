import sys
import traceback
from app import create_app

try:
    print("Attempting to create app...")
    app = create_app()
    print("App created successfully.")
    
    print("Attempting to create test client...")
    client = app.test_client()
    
    print("Making request to / ...")
    response = client.get('/')
    
    print(f"Response Status Code: {response.status_code}")
    if response.status_code == 500:
        print("Got 500 Error. Unfortunately client.get() captures the exception internally.")
        print("Trying simpler way to invoke rendering...")
        with app.test_request_context('/'):
            from flask import render_template
            try:
                render_template('index.html')
                print("Render success!")
            except Exception:
                traceback.print_exc()
    else:
        print("Request successful!")
        
except Exception:
    print("CRITICAL FAILURE DURING STARTUP:")
    traceback.print_exc()
