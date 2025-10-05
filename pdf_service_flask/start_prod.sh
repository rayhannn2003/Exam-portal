#!/bin/bash
echo "🚀 Starting Flask PDF Service in Production Mode..."
source venv/bin/activate
export FLASK_APP=app.py
export FLASK_ENV=production
gunicorn --bind 0.0.0.0:8000 --workers 4 --timeout 120 app:app
