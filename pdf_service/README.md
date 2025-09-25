# 📝 Exam Question Paper PDF Generation Service

A professional microservice for generating high-quality PDF question papers for the Exam Portal system. Built with FastAPI and WeasyPrint, this service provides comprehensive PDF generation capabilities with customizable templates and styling options.

## 🌟 Features

- **Professional PDF Generation**: Create high-quality, print-ready question papers
- **Multiple Question Types**: Support for MCQ, short answer, and long answer questions
- **Customizable Templates**: Flexible HTML templates with Jinja2 templating
- **Paper Customization**: Adjustable paper sizes, fonts, margins, and styling
- **School Branding**: Support for logos, custom headers, and organizational branding
- **Answer Spaces**: Configurable answer spaces for student responses
- **Page Management**: Automatic page breaks and numbering
- **Preview Mode**: HTML preview before PDF generation
- **API Documentation**: Complete OpenAPI/Swagger documentation
- **Docker Support**: Containerized deployment with Docker and Docker Compose
- **Health Monitoring**: Built-in health checks and monitoring endpoints

## 🏗️ Architecture

```
pdf_service/
├── main.py                    # FastAPI application entry point
├── requirements.txt           # Python dependencies
├── Dockerfile                # Docker container configuration
├── docker-compose.yml        # Docker Compose configuration
├── setup.sh                  # Setup script for local development
├── models/
│   ├── __init__.py
│   └── question_models.py    # Pydantic data models
├── services/
│   ├── __init__.py
│   ├── pdf_generator.py      # PDF generation service
│   └── template_engine.py    # Template rendering engine
├── templates/
│   └── default_question_paper.html  # Default HTML template
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
   cd /path/to/exam-portal/pdf_service
   ```

2. **Run Setup Script**
   ```bash
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
   docker-compose logs -f pdf-service
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Authentication
The service integrates with the main exam portal authentication system. All endpoints (except health checks) require valid admin authentication.

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

### Response Formats

#### Successful PDF Generation
```json
{
  "success": true,
  "message": "Question paper generated successfully",
  "exam_title": "Mathematics Final Exam",
  "set_name": "Set A",
  "total_questions": 50,
  "total_marks": 100,
  "generated_at": "2024-01-15T10:30:00Z",
  "file_size": 2048576,
  "template_used": "default"
}
```

#### Error Response
```json
{
  "detail": "Failed to generate question paper: Template not found"
}
```

## 🎨 Customization Options

### Paper Configuration
- **Paper Sizes**: A4, A3, Legal, Letter
- **Orientation**: Portrait, Landscape
- **Margins**: Narrow, Normal, Wide
- **Font Sizes**: 10pt, 11pt, 12pt, 14pt, 16pt

### Header Customization
- Organization logo and name
- Exam title and class information
- Date and duration display
- Total marks and set information
- Custom instructions

### Footer Customization
- Page numbers
- Custom footer text
- Additional instructions

### Advanced Features
- Custom CSS styling
- Watermark support
- Answer space configuration
- Section breaks and page management

## 🔧 Integration with Main Application

### Backend Integration

The PDF service integrates with the main exam portal backend through a dedicated controller:

```javascript
// Example usage in main application
const response = await fetch('http://localhost:8000/generate-question-paper/download', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    exam: examData,
    exam_set: examSetData,
    template_type: 'default',
    customization: customizationOptions
  })
});

const pdfBlob = await response.blob();
```

### Environment Variables

Add these to your main application's `.env` file:

```bash
# PDF Service Configuration
PDF_SERVICE_URL=http://localhost:8000
PDF_SERVICE_TIMEOUT=30000
```

### Frontend Integration

Add PDF generation buttons to your exam management interface:

```jsx
// Example React component
const GeneratePDFButton = ({ examId, setId }) => {
  const handleGeneratePDF = async () => {
    try {
      const response = await fetch(`/api/pdf/generate/${examId}/${setId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          templateType: 'default',
          customization: {
            paper_size: 'A4',
            show_logo: true,
            organization_name: 'Your School Name'
          }
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `question_paper_${examId}_${setId}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };

  return (
    <button onClick={handleGeneratePDF} className="btn btn-primary">
      📄 Generate PDF
    </button>
  );
};
```

## 🐳 Docker Configuration

### Dockerfile Features
- Python 3.11 slim base image
- System dependencies for WeasyPrint
- Optimized layer caching
- Health check configuration
- Security best practices

### Docker Compose Features
- Service orchestration
- Volume mounting for templates
- Network configuration
- Health monitoring
- Restart policies

### Environment Variables
```bash
PDF_SERVICE_PORT=8000
PDF_SERVICE_HOST=0.0.0.0
TEMPLATE_DIR=/app/templates
UPLOAD_DIR=/app/uploads
MAX_PAPER_SIZE=50MB
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
curl -X POST http://localhost:8000/generate-question-paper \
  -H "Content-Type: application/json" \
  -d @test_data.json

# Test health endpoint
curl http://localhost:8000/health
```

### Performance Testing
```bash
# Load testing with multiple concurrent requests
ab -n 100 -c 10 -p test_data.json -T application/json \
  http://localhost:8000/generate-question-paper
```

## 📊 Monitoring and Logging

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

### Metrics
- Request count and response times
- PDF generation success/failure rates
- Template usage statistics
- Error tracking and reporting

## 🔒 Security Considerations

### Authentication
- Integration with main application auth system
- JWT token validation
- Admin role verification

### Input Validation
- Pydantic model validation
- SQL injection prevention
- XSS protection in templates

### File Security
- Secure file upload handling
- Temporary file cleanup
- Access control for generated PDFs

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Set production environment variables
   export PDF_SERVICE_HOST=0.0.0.0
   export PDF_SERVICE_PORT=8000
   export LOG_LEVEL=INFO
   ```

2. **Docker Deployment**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Health Check**
   ```bash
   curl http://your-domain:8000/health
   ```

### cPanel Deployment

1. **Upload Files**
   - Upload the entire `pdf_service` directory
   - Ensure Python 3.11+ is available

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Web Server**
   - Set up reverse proxy to port 8000
   - Configure SSL certificates

## 🛠️ Troubleshooting

### Common Issues

#### WeasyPrint Installation Issues
```bash
# Install system dependencies
sudo apt-get update
sudo apt-get install build-essential libffi-dev libxml2-dev libxslt1-dev
```

#### Template Not Found
- Verify template files exist in `templates/` directory
- Check template file permissions
- Ensure correct template name in API request

#### PDF Generation Fails
- Check WeasyPrint installation
- Verify HTML template syntax
- Review service logs for detailed error messages

#### Memory Issues
- Increase Docker memory limits
- Optimize template complexity
- Implement PDF size limits

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
uvicorn main:app --reload --log-level debug
```

## 📈 Performance Optimization

### Template Caching
- Jinja2 template caching enabled
- Static asset optimization
- CSS and JavaScript minification

### PDF Optimization
- Font subsetting for smaller file sizes
- Image compression
- Metadata optimization

### Concurrent Processing
- Thread pool for PDF generation
- Async request handling
- Connection pooling

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

**Happy PDF Generation! 📄✨**
