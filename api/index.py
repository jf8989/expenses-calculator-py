# api/index.py
# Vercel serverless function entry point

import os
import sys

# Add parent directory to path so we can import app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

# Vercel expects the Flask app to be named 'app' or be in a variable that's exported
# This is the handler that Vercel will call
handler = app

# For Vercel compatibility
if __name__ == "__main__":
    app.run()
