#!/bin/bash

echo "🚀 Starting backend server and testing login activity..."

cd /home/rayhan/Documents/UTCKS/Exam-portal/backend

# Kill any existing node processes
pkill -f "node index.js" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true

# Start the server in background
echo "Starting backend server..."
node index.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Run the test
echo "Running login tracking test..."
node test_login_tracking.js

# Keep server running
echo "Backend server is running (PID: $SERVER_PID)"
echo "You can now test the Activity tab in your browser"
echo "To stop the server, run: kill $SERVER_PID"