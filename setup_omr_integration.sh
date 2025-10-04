#!/bin/bash

# OMR Integration Setup Script
# This script helps set up the OMR scanner integration with your exam portal

echo "🚀 Setting up OMR Scanner Integration..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "backend" ] && [ ! -d "frontend" ]; then
    print_error "Please run this script from the exam-portal root directory"
    exit 1
fi

print_info "Current directory: $(pwd)"

# Step 1: Setup OMR Service
echo ""
echo "📦 Setting up OMR Service..."
echo "----------------------------"

if [ ! -d "omr-service" ]; then
    print_error "OMR service directory not found. Please ensure all OMR service files are in place."
    exit 1
fi

cd omr-service

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
    if [ $? -eq 0 ]; then
        print_status "Virtual environment created"
    else
        print_error "Failed to create virtual environment"
        exit 1
    fi
else
    print_status "Virtual environment already exists"
fi

# Activate virtual environment and install dependencies
print_info "Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    print_status "Python dependencies installed successfully"
else
    print_error "Failed to install Python dependencies"
    exit 1
fi

cd ..

# Step 2: Check Backend Integration
echo ""
echo "🔧 Checking Backend Integration..."
echo "---------------------------------"

if [ -f "backend/routes/omr.js" ]; then
    print_status "OMR routes file exists"
else
    print_warning "OMR routes file not found. You may need to add it manually."
fi

# Check if OMR routes are included in main backend
if grep -q "omr" backend/index.js 2>/dev/null; then
    print_status "OMR routes are integrated in backend"
else
    print_warning "OMR routes may not be integrated in backend/index.js"
    print_info "Add this line to backend/index.js: app.use('/api/omr', require('./routes/omr'));"
fi

# Step 3: Check Frontend Integration
echo ""
echo "🎨 Checking Frontend Integration..."
echo "----------------------------------"

if [ -f "frontend/src/components/OMRScanner.jsx" ]; then
    print_status "OMR Scanner component exists"
else
    print_warning "OMR Scanner component not found. You may need to add it manually."
fi

# Step 4: Check Docker Configuration
echo ""
echo "🐳 Checking Docker Configuration..."
echo "----------------------------------"

if [ -f "docker-compose.yml" ]; then
    if grep -q "omr-service" docker-compose.yml; then
        print_status "OMR service is configured in docker-compose.yml"
    else
        print_warning "OMR service not found in docker-compose.yml"
    fi
else
    print_warning "docker-compose.yml not found"
fi

# Step 5: Test OMR Service
echo ""
echo "🧪 Testing OMR Service..."
echo "-------------------------"

cd omr-service
source venv/bin/activate

# Start OMR service in background for testing
print_info "Starting OMR service for testing..."
python test_app.py &
OMR_PID=$!

# Wait for service to start
sleep 5

# Test health endpoint
if curl -s http://localhost:8001/health > /dev/null; then
    print_status "OMR service is running and responding"
else
    print_warning "OMR service may not be responding. Check the logs."
fi

# Kill the test service
kill $OMR_PID 2>/dev/null

cd ..

# Step 6: Summary
echo ""
echo "📋 Setup Summary"
echo "==============="
print_status "OMR service directory: omr-service/"
print_status "Python virtual environment: omr-service/venv/"
print_status "Test service: omr-service/test_app.py"
print_status "Integration guide: OMR_INTEGRATION_GUIDE.md"

echo ""
echo "🚀 Next Steps:"
echo "1. Start the OMR service: cd omr-service && source venv/bin/activate && python test_app.py"
echo "2. Test the service: curl http://localhost:8001/health"
echo "3. Integrate with your frontend by adding the OMRScanner component"
echo "4. Add OMR routes to your backend if not already done"
echo "5. Test the complete workflow with sample OMR sheets"

echo ""
echo "📖 For detailed instructions, see: OMR_INTEGRATION_GUIDE.md"
echo ""
print_status "OMR Integration setup completed! 🎉"
