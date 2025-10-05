# 📝 Flask PDF Service for Exam Portal

A Flask-based microservice for generating high-quality PDF question papers for the Exam Portal system. This is an alternative to the FastAPI version, providing the same functionality with Flask framework.

## 🌟 Features

- **Professional PDF Generation**: Create high-quality, print-ready question papers using ReportLab
- **Flask Framework**: Lightweight and easy to deploy Flask-based service
- **Bengali Language Support**: Full Unicode support for Bengali text with custom fonts
- **Multiple Question Types**: Support for MCQ, short answer, and long answer questions
- **Customizable Templates**: Flexible HTML templates with Jinja2 templating
- **Paper Customization**: Adjustable paper sizes, fonts, margins, and styling
- **Organization Branding**: Support for logos, custom headers, and organizational branding
- **Answer Spaces**: Configurable answer spaces for student responses
- **Preview Mode**: HTML preview before PDF generation
- **Docker Support**: Containerized deployment with Docker and Docker Compose
- **Health Monitoring**: Built-in health checks and monitoring endpoints

## 🏗️ Architecture

```
pdf_service_flask/
├── app.py                    # Flask application entry point
├── requirements.txt           # Python dependencies
├── Dockerfile                # Docker container configuration
├── docker-compose.yml        # Docker Compose configuration
├── setup.sh                  # Setup script for local development
├── models/
│   ├── __init__.py
│   └── question_models.py    # Pydantic data models
├── services/
│   ├── __init__.py
│   ├── pdf_generator.py      # PDF generation service (ReportLab)
│   └── template_engine.py    # Template rendering engine
├── templates/                # HTML templates
├── static/                   # Static assets (logos, images)
└── uploads/                  # Temporary file storage
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- Docker (optional, for containerized deployment)

### Local Development Setup

1. **Clone and Navigate**
   ```bash
   cd /path/to/exam-portal/pdf_service_flask
   ```

2. **Run Setup Script**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Start Development Server**
   ```bash
   ./start_dev.sh
   ```

4. **Verify Installation**
   ```bash
   curl http://localhost:8000/health
   ```

### Docker Deployment

1. **Build and Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Check Service Status**
   ```bash
   docker-compose ps
   ```

3. **View Logs**
   ```bash
   docker-compose logs -f pdf-service-flask
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:8000  (Development)
http://localhost:8001  (Docker - to avoid conflicts with FastAPI version)
```

### Core Endpoints

#### Generate Question Paper PDF
```http
POST /generate-question-paper/download
Content-Type: application/json

{
  "exam": {
    "title": "Mathematics Final Exam",
    "class_name": "Class 10",
    "year": 2024,
    "question_count": 50
  },
  "exam_set": {
    "set_name": "Set A",
    "questions": [
      {
        "qno": 1,
        "question": "What is 2 + 2?",
        "question_type": "mcq",
        "marks": 1,
        "options": {
          "A": "3",
          "B": "4",
          "C": "5",
          "D": "6"
        }
      }
    ],
    "answer_key": {
      "1": "B"
    }
  },
  "template_type": "default",
  "customization": {
    "paper_size": "A4",
    "orientation": "portrait",
    "font_size": "12pt"
  }
}
```

#### Generate HTML Preview
```http
POST /preview-question-paper
Content-Type: application/json

{
  // Same payload as above
}
```

#### Get Available Templates
```http
GET /templates
```

#### Get Customization Options
```http
GET /customization-options
```

#### Health Check
```http
GET /health
```

## 🔧 Backend Integration

### Update Backend Environment

Add to your backend `.env` file:
```bash
# Flask PDF Service Configuration
PDF_SERVICE_URL=http://localhost:8000
PDF_SERVICE_TIMEOUT=30000

# For Docker deployment:
# PDF_SERVICE_URL=http://localhost:8001
```

### Backend Controller Integration

The existing backend controller (`backend/controllers/pdfController.js`) will work with both FastAPI and Flask versions without modification, as they use the same API endpoints.

### Test Integration

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test PDF generation
curl -X POST http://localhost:4000/api/pdf/generate/EXAM_ID/CLASS_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"templateType": "default"}'
```

## 🎨 Customization Options

### Paper Configuration
- **Paper Sizes**: A4, A3, Legal, Letter
- **Orientations**: Portrait, Landscape
- **Font Sizes**: 9pt, 10pt, 11pt, 12pt, 14pt, 16pt
- **Margins**: Narrow, Normal, Wide

### Template Types
- **default**: Standard question paper template
- **compact_bengali**: Compact Bengali template optimized for printing

### Header Customization
- Organization logo and name
- Exam title and class information
- Date and duration display
- Total marks and set information
- Custom instructions

## 🐳 Docker Configuration

### Docker Compose Features
- Service orchestration
- Volume mounting for templates
- Network configuration
- Health monitoring
- Restart policies
- Different port (8001) to avoid conflicts with FastAPI version

### Environment Variables
```bash
PDF_SERVICE_PORT=8000
PDF_SERVICE_HOST=0.0.0.0
TEMPLATE_DIR=/app/templates
UPLOAD_DIR=/app/uploads
MAX_PAPER_SIZE=50MB
FLASK_APP=app.py
FLASK_ENV=production
```

## 🧪 Testing

### Unit Tests
```bash
# Run unit tests
pytest tests/

# Run with coverage
pytest --cov=. tests/
```

### Integration Tests
```bash
# Test PDF generation
curl -X POST http://localhost:8000/generate-question-paper/download \
  -H "Content-Type: application/json" \
  -d @test_data.json

# Test health endpoint
curl http://localhost:8000/health
```

## 📊 Performance Optimization

### Flask Configuration
- **Gunicorn WSGI Server**: Production-ready WSGI server
- **Worker Processes**: Configurable number of worker processes
- **Timeout Settings**: Request timeout configuration
- **Memory Management**: Efficient PDF generation without disk storage

### Template Caching
- Jinja2 template caching enabled
- Static asset optimization
- CSS and JavaScript minification

## 🔒 Security Considerations

### Input Validation
- Pydantic model validation
- Request data sanitization
- File size limits
- Content type validation

### CORS Configuration
- Configurable CORS settings
- Origin restrictions for production
- Credential handling

## 🚀 Deployment Options

### Development Deployment
```bash
./start_dev.sh
```

### Production Deployment
```bash
./start_prod.sh
```

### Docker Deployment
```bash
docker-compose up -d
```

### Cloud Deployment
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- Heroku

## 🛠️ Troubleshooting

### Common Issues

#### Flask Service Not Starting
```bash
# Check logs
docker-compose logs pdf-service-flask

# Check port availability
netstat -tulpn | grep :8000

# Restart service
docker-compose restart pdf-service-flask
```

#### PDF Generation Failures
```bash
# Check service logs
docker-compose logs -f pdf-service-flask

# Test with simple request
curl -X POST http://localhost:8000/health
```

#### Import Errors
```bash
# Activate virtual environment
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

## 📈 Monitoring and Logging

### Health Monitoring
- Built-in health check endpoint
- Docker health checks
- Service status monitoring

### Logging Configuration
```python
# Logging levels
DEBUG   # Detailed debugging information
INFO    # General information about service operation
WARNING # Warning messages for potential issues
ERROR   # Error messages for failed operations
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards
- Follow PEP 8 for Python code
- Use type hints for all functions
- Write comprehensive docstrings
- Include unit tests for new features

## 📄 License

This project is part of the Exam Portal system and follows the same licensing terms.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Create an issue in the repository
- Contact the development team

---

**Flask PDF Service Ready! 📄✨**
