#!/bin/bash
echo "🚀 Starting PDF Service in Development Mode..."
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
