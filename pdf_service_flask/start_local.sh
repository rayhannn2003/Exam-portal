#!/bin/bash

# Start Local PDF Service
echo "Starting Flask PDF Service on localhost:5000..."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "Activated virtual environment"
fi

# Install requirements if needed
if [ ! -f ".deps_installed" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    touch .deps_installed
fi

# Set environment variables
export FLASK_APP=app.py
export FLASK_ENV=development
export FLASK_DEBUG=1
export PDF_SERVICE_PORT=5000

# Start the Flask server
echo "Starting Flask PDF service on port 5000..."
python app.py
