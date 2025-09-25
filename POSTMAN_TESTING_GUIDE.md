# 📮 Postman Testing Guide for PDF Generator

This guide helps you test the PDF generation service using Postman.

## 🚀 Quick Start

### 1. Import the Collection
1. Open Postman
2. Click "Import" button
3. Select the file: `PDF_Generator_Postman_Collection.json`
4. The collection will be imported with all test requests

### 2. Set Environment Variables
The collection uses these variables:
- `pdf_service_url`: `http://localhost:8000`
- `backend_url`: `http://localhost:4001`

## 🧪 Testing Steps

### Step 1: Health Checks
First, verify that both services are running:

#### 1.1 PDF Service Health
- **Method**: GET
- **URL**: `http://localhost:8000/health`
- **Expected Response**:
```json
{
  "status": "healthy",
  "service": "pdf_service",
  "timestamp": "2025-09-25T05:03:01.242657",
  "uptime": "running"
}
```

#### 1.2 Backend Health
- **Method**: GET
- **URL**: `http://localhost:4001/api/pdf/health`
- **Expected Response**:
```json
{
  "status": "healthy",
  "pdf_service": {
    "status": "healthy",
    "service": "pdf_service",
    "timestamp": "2025-09-25T05:03:01.242657",
    "uptime": "running"
  },
  "timestamp": "2025-09-24T23:03:01.249Z"
}
```

### Step 2: Test PDF Generation (Direct)
Test the PDF service directly without authentication:

#### 2.1 Generate Question Paper
- **Method**: POST
- **URL**: `http://localhost:8000/generate-question-paper`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body** (JSON):
```json
{
  "exam": {
    "title": "Mathematics Final Exam",
    "class_name": "Class 10",
    "year": 2024,
    "question_count": 3
  },
  "exam_set": {
    "set_name": "Set A",
    "questions": [
      {
        "qno": 1,
        "question": "What is 5 + 3?",
        "question_type": "mcq",
        "marks": 1,
        "options": {
          "A": "6",
          "B": "7",
          "C": "8",
          "D": "9"
        }
      },
      {
        "qno": 2,
        "question": "What is 10 - 4?",
        "question_type": "mcq",
        "marks": 1,
        "options": {
          "A": "5",
          "B": "6",
          "C": "7",
          "D": "8"
        }
      }
    ],
    "answer_key": {
      "1": "C",
      "2": "B"
    },
    "total_marks": 2,
    "duration_minutes": 60
  },
  "template_type": "default"
}
```

#### 2.2 Expected Response
```json
{
  "success": true,
  "message": "Question paper generated successfully",
  "pdf_data": "PGh0bWw+PGhlYWQ+...",
  "exam_title": "Mathematics Final Exam",
  "set_name": "Set A",
  "total_questions": 2,
  "total_marks": 2,
  "generated_at": "2025-09-25T05:03:29.189582"
}
```

#### 2.3 Decode and View PDF
The `pdf_data` field contains base64-encoded HTML. To view it:

1. Copy the `pdf_data` value
2. Use an online base64 decoder
3. Save the decoded content as `.html` file
4. Open in browser and print to PDF

### Step 3: Test Preview Generation
Test HTML preview generation:

#### 3.1 Preview Question Paper
- **Method**: POST
- **URL**: `http://localhost:8000/preview-question-paper`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body**: Same as Step 2.1

#### 3.2 Expected Response
Returns HTML content directly (not base64 encoded).

### Step 4: Test Backend Integration
Test the backend integration (requires authentication):

#### 4.1 Get JWT Token
First, you need to login to get a JWT token:
- **Method**: POST
- **URL**: `http://localhost:4001/api/auth/login`
- **Body**:
```json
{
  "username": "your_admin_username",
  "password": "your_admin_password"
}
```

#### 4.2 Generate PDF via Backend
- **Method**: POST
- **URL**: `http://localhost:4001/api/pdf/generate/{examId}/{setId}`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_JWT_TOKEN_HERE
  ```
- **Body**:
```json
{
  "templateType": "default"
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Connection Refused
- **Error**: `ECONNREFUSED`
- **Solution**: Make sure both services are running:
  ```bash
  # PDF Service
  cd pdf_service && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000
  
  # Backend
  cd backend && PORT=4001 npm start
  ```

#### 2. 401 Unauthorized
- **Error**: `{"error": "Unauthorized"}`
- **Solution**: 
  - For direct PDF service: No auth needed
  - For backend integration: Get valid JWT token first

#### 3. 404 Not Found
- **Error**: `{"detail": "Not Found"}`
- **Solution**: Check URL paths and ensure services are running

#### 4. 500 Internal Server Error
- **Error**: Server error
- **Solution**: Check service logs for detailed error messages

### Testing Different Scenarios

#### 1. Different Question Types
```json
{
  "qno": 1,
  "question": "Explain photosynthesis",
  "question_type": "written",
  "marks": 5,
  "options": null
}
```

#### 2. Multiple Choice Questions
```json
{
  "qno": 1,
  "question": "What is 2+2?",
  "question_type": "mcq",
  "marks": 1,
  "options": {
    "A": "3",
    "B": "4",
    "C": "5",
    "D": "6"
  }
}
```

#### 3. Different Exam Classes
```json
{
  "exam": {
    "title": "Physics Test",
    "class_name": "Class 12",
    "year": 2024,
    "question_count": 5
  }
}
```

## 📊 Expected Results

### Successful PDF Generation
- **Status**: 200 OK
- **Response**: JSON with `success: true`
- **pdf_data**: Base64 encoded HTML
- **Content**: Professional question paper layout

### Successful Preview
- **Status**: 200 OK
- **Response**: HTML content
- **Content**: Same as PDF but in HTML format

### Health Check
- **Status**: 200 OK
- **Response**: Service status information

## 🎯 Quick Test Checklist

- [ ] PDF Service health check passes
- [ ] Backend health check passes
- [ ] Direct PDF generation works
- [ ] Preview generation works
- [ ] Backend integration works (with auth)
- [ ] HTML content is properly formatted
- [ ] Questions and options are displayed correctly
- [ ] Answer spaces are included

## 📝 Notes

1. **PDF Format**: The service generates HTML that can be printed to PDF
2. **No WeasyPrint**: Uses simple HTML generation for reliability
3. **Authentication**: Required only for backend integration
4. **Templates**: Currently supports "default" template type
5. **File Download**: HTML files can be saved and opened in browser

---

**Happy Testing! 🚀📄**
