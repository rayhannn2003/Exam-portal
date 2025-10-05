#!/bin/bash
echo "🚀 Starting Flask PDF Service in Development Mode..."
source venv/bin/activate
export FLASK_APP=app.py
export FLASK_ENV=development
export FLASK_DEBUG=1
python app.py
