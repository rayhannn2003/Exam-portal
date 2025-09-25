# 🚀 PDF Service Deployment Guide

This guide provides comprehensive instructions for deploying the PDF generation service in production environments.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Python 3.11+ (for local development)
- Node.js 18+ (for backend integration)
- PostgreSQL database (for main application)
- SSL certificates (for HTTPS in production)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   PDF Service   │
│   (React)       │───▶│   (Node.js)     │───▶│   (Python)      │
│   Port: 3000    │    │   Port: 4000    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   PostgreSQL    │    │   Templates &   │
                       │   Database      │    │   Static Files  │
                       └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start (Development)

### 1. Start PDF Service
```bash
cd pdf_service
./setup.sh
source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start Backend
```bash
cd backend
npm install
npm start
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Test Integration
```bash
cd backend
node test_pdf_integration.js
```

## 🐳 Production Deployment

### Option 1: Docker Compose (Recommended)

1. **Clone and Setup**
   ```bash
   git clone <your-repo>
   cd exam-portal
   ```

2. **Configure Environment**
   ```bash
   # Copy environment files
   cp pdf_service/env.example pdf_service/.env
   cp backend/.env.example backend/.env
   
   # Edit configuration
   nano pdf_service/.env
   nano backend/.env
   ```

3. **Deploy with Docker Compose**
   ```bash
   # Development deployment
   cd pdf_service
   docker-compose up -d
   
   # Production deployment
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Verify Deployment**
   ```bash
   curl http://localhost:8000/health
   curl http://localhost:4000/api/pdf/health
   ```

### Option 2: Manual Deployment

1. **Install System Dependencies**
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install -y python3.11 python3.11-venv python3-pip
   sudo apt-get install -y build-essential libffi-dev libxml2-dev libxslt1-dev
   sudo apt-get install -y libjpeg-dev libpng-dev libpango1.0-dev libcairo2-dev
   
   # CentOS/RHEL
   sudo yum update
   sudo yum install -y python311 python311-pip gcc gcc-c++
   sudo yum install -y libffi-devel libxml2-devel libxslt1-devel
   sudo yum install -y libjpeg-devel libpng-devel pango-devel cairo-devel
   ```

2. **Setup PDF Service**
   ```bash
   cd pdf_service
   python3.11 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Configure System Service**
   ```bash
   # Create systemd service
   sudo nano /etc/systemd/system/pdf-service.service
   ```

   ```ini
   [Unit]
   Description=PDF Generation Service
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/path/to/exam-portal/pdf_service
   Environment=PATH=/path/to/exam-portal/pdf_service/venv/bin
   ExecStart=/path/to/exam-portal/pdf_service/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable pdf-service
   sudo systemctl start pdf-service
   ```

## 🔧 Configuration

### Environment Variables

#### PDF Service (.env)
```bash
# Service Configuration
PDF_SERVICE_PORT=8000
PDF_SERVICE_HOST=0.0.0.0
TEMPLATE_DIR=/app/templates
UPLOAD_DIR=/app/uploads
MAX_PAPER_SIZE=50MB

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/pdf_service.log

# Security
ALLOWED_ORIGINS=*
CORS_ENABLED=true

# Performance
MAX_WORKERS=4
REQUEST_TIMEOUT=30
```

#### Backend (.env)
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=exam_portal
DB_USER=your_user
DB_PASSWORD=your_password
DB_SSL=false

# JWT
JWT_SECRET=your_jwt_secret

# PDF Service Integration
PDF_SERVICE_URL=http://localhost:8000
PDF_SERVICE_TIMEOUT=30000
```

### Nginx Configuration

For production, use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # PDF Service
    location /api/pdf/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout settings for PDF generation
        proxy_connect_timeout 30s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Main application
    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔒 Security Considerations

### 1. Authentication & Authorization
- All PDF endpoints require admin authentication
- JWT tokens are validated for each request
- Role-based access control (admin/superadmin only)

### 2. Input Validation
- Pydantic models validate all input data
- SQL injection prevention
- XSS protection in templates

### 3. Rate Limiting
```bash
# Nginx rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;
```

### 4. File Security
- Temporary files are cleaned up automatically
- Upload directory has restricted permissions
- No direct file system access from templates

## 📊 Monitoring & Logging

### Health Checks
```bash
# Service health
curl http://localhost:8000/health

# Integration health
curl http://localhost:4000/api/pdf/health
```

### Logging Configuration
```python
# In main.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/pdf_service.log'),
        logging.StreamHandler()
    ]
)
```

### Performance Monitoring
- Request/response times
- Memory usage
- PDF generation success/failure rates
- Template usage statistics

## 🔧 Troubleshooting

### Common Issues

#### 1. PDF Service Won't Start
```bash
# Check Python version
python3 --version

# Check dependencies
pip list | grep weasyprint

# Check system dependencies
ldd /path/to/weasyprint/so

# View logs
journalctl -u pdf-service -f
```

#### 2. PDF Generation Fails
```bash
# Check WeasyPrint installation
python -c "import weasyprint; print('OK')"

# Test with sample data
python test_service.py

# Check memory usage
free -h
```

#### 3. Integration Issues
```bash
# Test backend connection
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:4000/api/pdf/customization-options

# Check network connectivity
telnet localhost 8000
```

#### 4. Performance Issues
```bash
# Monitor resource usage
htop
docker stats

# Check logs for errors
docker-compose logs -f pdf-service
```

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
export DEBUG=true

# Run with debug mode
uvicorn main:app --reload --log-level debug
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx/HAProxy)
- Multiple PDF service instances
- Shared storage for templates

### Vertical Scaling
- Increase memory allocation
- Optimize WeasyPrint settings
- Use SSD storage for better I/O

### Caching
- Template caching (already implemented)
- Response caching for static content
- CDN for static assets

## 🚀 Deployment Checklist

- [ ] System dependencies installed
- [ ] Python virtual environment created
- [ ] Dependencies installed successfully
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] PDF service health check passed
- [ ] Backend integration tested
- [ ] Frontend PDF buttons working
- [ ] SSL certificates configured (production)
- [ ] Nginx reverse proxy configured
- [ ] Monitoring and logging setup
- [ ] Backup procedures in place
- [ ] Security measures implemented
- [ ] Performance testing completed

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review logs for error messages
3. Test individual components
4. Contact development team

---

**Happy PDF Generation! 📄✨**
