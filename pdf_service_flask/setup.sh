#!/bin/bash

# PDF Service Flask Setup Script
# This script sets up the Flask PDF service for the exam portal

echo "🚀 Setting up Flask PDF Service for Exam Portal..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if Python 3.11+ is installed
check_python() {
    print_header "Checking Python Installation"
    
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
        print_status "Python $PYTHON_VERSION found"
        
        # Check if version is 3.11 or higher
        if python3 -c 'import sys; exit(0 if sys.version_info >= (3, 11) else 1)'; then
            print_status "Python version is compatible"
        else
            print_error "Python 3.11 or higher is required"
            exit 1
        fi
    else
        print_error "Python 3 is not installed"
        exit 1
    fi
}

# Create virtual environment
setup_venv() {
    print_header "Setting up Virtual Environment"
    
    if [ ! -d "venv" ]; then
        print_status "Creating virtual environment..."
        python3 -m venv venv
        print_status "Virtual environment created"
    else
        print_status "Virtual environment already exists"
    fi
    
    print_status "Activating virtual environment..."
    source venv/bin/activate
    print_status "Virtual environment activated"
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    print_status "Upgrading pip..."
    pip install --upgrade pip
    
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
    
    print_status "Dependencies installed successfully"
}

# Create necessary directories
create_directories() {
    print_header "Creating Directories"
    
    directories=("templates" "static" "uploads" "logs")
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_status "Created directory: $dir"
        else
            print_status "Directory already exists: $dir"
        fi
    done
}

# Create environment file
create_env_file() {
    print_header "Creating Environment Configuration"
    
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# PDF Service Flask Configuration
PDF_SERVICE_PORT=8000
PDF_SERVICE_HOST=0.0.0.0
TEMPLATE_DIR=/app/templates
UPLOAD_DIR=/app/uploads
MAX_PAPER_SIZE=50MB

# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development
DEBUG=true

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=logs/pdf_service_flask.log

# Security Configuration
ALLOWED_ORIGINS=*
CORS_ENABLED=true

# Performance Configuration
MAX_WORKERS=4
REQUEST_TIMEOUT=30
EOF
        print_status "Created .env file"
    else
        print_status ".env file already exists"
    fi
}

# Test installation
test_installation() {
    print_header "Testing Installation"
    
    print_status "Testing Python imports..."
    python3 -c "
import flask
import reportlab
import jinja2
import pydantic
print('✅ All required packages imported successfully')
"
    
    if [ $? -eq 0 ]; then
        print_status "Installation test passed"
    else
        print_error "Installation test failed"
        exit 1
    fi
}

# Create startup script
create_startup_script() {
    print_header "Creating Startup Scripts"
    
    # Development startup script
    cat > start_dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Flask PDF Service in Development Mode..."
source venv/bin/activate
export FLASK_APP=app.py
export FLASK_ENV=development
export FLASK_DEBUG=1
python app.py
EOF
    chmod +x start_dev.sh
    print_status "Created development startup script"
    
    # Production startup script
    cat > start_prod.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Flask PDF Service in Production Mode..."
source venv/bin/activate
export FLASK_APP=app.py
export FLASK_ENV=production
gunicorn --bind 0.0.0.0:8000 --workers 4 --timeout 120 app:app
EOF
    chmod +x start_prod.sh
    print_status "Created production startup script"
}

# Create models __init__.py
create_init_files() {
    print_header "Creating Init Files"
    
    # Create models __init__.py
    mkdir -p models
    if [ ! -f "models/__init__.py" ]; then
        touch models/__init__.py
        print_status "Created models/__init__.py"
    fi
    
    # Create services __init__.py
    mkdir -p services
    if [ ! -f "services/__init__.py" ]; then
        touch services/__init__.py
        print_status "Created services/__init__.py"
    fi
}

# Main setup function
main() {
    print_header "Flask PDF Service Setup for Exam Portal"
    
    check_python
    setup_venv
    install_dependencies
    create_directories
    create_env_file
    create_init_files
    test_installation
    create_startup_script
    
    print_header "Setup Complete!"
    print_status "Flask PDF Service has been set up successfully"
    echo ""
    print_status "To start the service in development mode:"
    echo -e "${GREEN}  ./start_dev.sh${NC}"
    echo ""
    print_status "To start the service in production mode:"
    echo -e "${GREEN}  ./start_prod.sh${NC}"
    echo ""
    print_status "To test the service:"
    echo -e "${GREEN}  curl http://localhost:8000/health${NC}"
    echo ""
    print_status "To run with Docker:"
    echo -e "${GREEN}  docker-compose up -d${NC}"
    echo ""
    print_warning "Make sure to configure your .env file with the appropriate settings"
    print_warning "The service will be available at http://localhost:8000"
    print_warning "API documentation will be available at http://localhost:8000/"
    print_warning "Note: This Flask version runs on port 8001 in Docker to avoid conflicts"
}

# Run main function
main "$@"
