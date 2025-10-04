"""
Exam Question Paper PDF Generation Service
A FastAPI microservice for generating professional PDF question papers
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from datetime import datetime
import os

from models.question_models import (
    QuestionPaperRequest,
    QuestionPaperResponse,
    Question,
    ExamSet,
    Exam
)
from pydantic import BaseModel
from typing import List, Optional
from services.template_engine import TemplateEngine
from services.pdf_generator import PDFGenerator
import urllib.request
import os

# Scholarship models
class ScholarshipStudent(BaseModel):
    serial_no: int
    name: str
    school: str
    roll_number: str

class ScholarshipRequest(BaseModel):
    class_name: str
    students: List[ScholarshipStudent]
    exam_name: str = "উপবৃত্তি পরীক্ষা - ২০২৫"
    organization_name: str = "উত্তর তারাবুনিয়া ছাত্র-কল্যাণ সংগঠন"
    motto: str = "দৃষ্টিভঙ্গি বদলান, জীবন বদলে যাবে"
    established_year: str = "2004 ইং"
    location: str = "Uttar Tarabunia, Sadar Upazila, Shariatpur, Bangladesh."

class ScholarshipResponse(BaseModel):
    success: bool
    message: str
    pdf_data: str
    class_name: str
    total_students: int
    generated_at: str

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Exam Question Paper PDF Service",
    description="Microservice for generating professional exam question papers in PDF format",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Function to download SolaimanLipi font
def download_solaiman_font():
    """Download SolaimanLipi font if not available locally"""
    try:
        font_path = "/tmp/SolaimanLipi.ttf"
        if not os.path.exists(font_path):
            logger.info("Downloading SolaimanLipi font...")
            font_url = "https://github.com/ekushey/SolaimanLipi/raw/master/SolaimanLipi.ttf"
            urllib.request.urlretrieve(font_url, font_path)
            logger.info("SolaimanLipi font downloaded successfully")
        return font_path
    except Exception as e:
        logger.warning(f"Could not download SolaimanLipi font: {e}")
        return None

# Download font on startup
download_solaiman_font()

# Initialize services (use WeasyPrint-based generator so templates are applied)
pdf_generator = PDFGenerator()
template_engine = TemplateEngine()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Exam Question Paper PDF Service",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "pdf_service",
        "timestamp": datetime.now().isoformat(),
        "uptime": "running"
    }

@app.post("/generate-question-paper", response_model=QuestionPaperResponse)
async def generate_question_paper(request: QuestionPaperRequest):
    """
    Generate a PDF question paper from exam data
    
    Args:
        request: QuestionPaperRequest containing exam and question data
        
    Returns:
        QuestionPaperResponse with PDF data and metadata
    """
    try:
        logger.info(f"Generating question paper for exam: {request.exam.title}")
        
        # Validate request data
        if not request.exam or not request.exam_set:
            raise HTTPException(status_code=400, detail="Exam and exam set data are required")
        
        # Generate PDF (bytes) using WeasyPrint-based generator
        pdf_bytes = await pdf_generator.generate_question_paper(
            exam=request.exam,
            exam_set=request.exam_set,
            template_type=request.template_type,
            customization=request.customization
        )
        
        # Create response
        # Base64 encode for JSON response compatibility
        import base64
        pdf_b64 = base64.b64encode(pdf_bytes).decode("utf-8")

        response = QuestionPaperResponse(
            success=True,
            message="Question paper generated successfully",
            pdf_data=pdf_b64,
            exam_title=request.exam.title,
            set_name=request.exam_set.set_name,
            total_questions=len(request.exam_set.questions),
            total_marks=request.exam_set.total_marks or sum(q.marks for q in request.exam_set.questions),
            generated_at=datetime.now().isoformat()
        )
        
        logger.info(f"Successfully generated question paper: {request.exam.title} - {request.exam_set.set_name}")
        return response
        
    except Exception as e:
        logger.error(f"Error generating question paper: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate question paper: {str(e)}")

@app.post("/generate-question-paper/download")
async def download_question_paper(request: QuestionPaperRequest):
    """
    Generate and directly download a PDF question paper
    
    Args:
        request: QuestionPaperRequest containing exam and question data
        
    Returns:
        PDF file as Response
    """
    try:
        logger.info(f"Generating and downloading question paper for exam: {request.exam.title}")
        
        # Generate PDF (bytes)
        pdf_bytes = await pdf_generator.generate_question_paper(
            exam=request.exam,
            exam_set=request.exam_set,
            template_type=request.template_type,
            customization=request.customization
        )
        
        # Create safe ASCII filename (no Bengali characters for HTTP header)
        safe_filename = f"Bengali_Exam_{request.exam_set.set_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        safe_filename = "".join(c for c in safe_filename if c.isascii() and (c.isalnum() or c in (' ', '-', '_'))).rstrip()
        
        # Return PDF as download
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={safe_filename}",
                "Content-Type": "application/pdf"
            }
        )
        
    except Exception as e:
        logger.error(f"Error downloading question paper: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate question paper: {str(e)}")

@app.post("/preview-question-paper")
async def preview_question_paper(request: QuestionPaperRequest):
    """
    Generate HTML preview of question paper (without PDF conversion)
    
    Args:
        request: QuestionPaperRequest containing exam and question data
        
    Returns:
        HTML preview of the question paper
    """
    try:
        logger.info(f"Generating HTML preview for exam: {request.exam.title}")
        
        # Generate HTML preview
        html_content = await template_engine.render_question_paper_template(
            exam=request.exam,
            exam_set=request.exam_set,
            template_type=request.template_type,
            customization=request.customization
        )
        
        return Response(
            content=html_content,
            media_type="text/html"
        )
        
    except Exception as e:
        logger.error(f"Error generating preview: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate preview: {str(e)}")

@app.get("/templates")
async def get_available_templates():
    """Get list of available question paper templates"""
    try:
        templates = await template_engine.get_available_templates()
        return {
            "success": True,
            "templates": templates
        }
    except Exception as e:
        logger.error(f"Error getting templates: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get templates: {str(e)}")

@app.get("/templates/{template_name}")
async def get_template_info(template_name: str):
    """Get information about a specific template"""
    try:
        template_info = await template_engine.get_template_info(template_name)
        return {
            "success": True,
            "template": template_info
        }
    except Exception as e:
        logger.error(f"Error getting template info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get template info: {str(e)}")

@app.get("/customization-options")
async def get_customization_options():
    """Get available customization options for question papers"""
    return {
        "success": True,
        "customization_options": {
            "paper_sizes": ["A4", "A3", "Legal", "Letter"],
            "font_sizes": ["9pt", "10pt", "11pt", "12pt", "14pt", "16pt"],
            "margins": ["narrow", "normal", "wide"],
            "orientation": ["portrait", "landscape"],
            "templates": ["default", "bengali", "compact_bengali"],
            "header_options": {
                "show_logo": True,
                "show_title": True,
                "show_date": True,
                "show_duration": True,
                "show_marks": True
            },
            "footer_options": {
                "show_page_numbers": True,
                "show_instructions": True
            }
        }
    }

@app.get("/templates/compact_bengali/preview")
async def preview_compact_bengali_template():
    """Preview the compact Bengali template with sample data"""
    try:
        from models.question_models import Exam, ExamSet, Question, PaperCustomization, HeaderOptions, FooterOptions
        
        # Create sample exam data
        exam = Exam(
            title="মেধাবৃত্তী পরীক্ষা - ২০২৫",
            class_name="সেট - A",
            year=2025,
            question_count=10
        )
        
        # Create sample questions
        questions = []
        for i in range(1, 11):
            question = Question(
                qno=i,
                question=f"নমুনা প্রশ্ন {i}: এটি একটি পরীক্ষার প্রশ্ন।",
                question_type="mcq",
                marks=1,
                options={
                    "A": f"উত্তর A - {i}",
                    "B": f"উত্তর B - {i}",
                    "C": f"উত্তর C - {i}",
                    "D": f"উত্তর D - {i}"
                }
            )
            questions.append(question)
        
        exam_set = ExamSet(
            set_name="সেট - A",
            questions=questions,
            answer_key={str(i): chr(65 + (i % 4)) for i in range(1, 11)},
            total_marks=10,
            duration_minutes=30,
            instructions="সকল প্রশ্নের উত্তর দিতে হবে।"
        )
        
        customization = PaperCustomization(
            paper_size="A4",
            orientation="portrait",
            font_size="9pt",
            margin_type="narrow",
            show_answer_spaces=True,
            header_options=HeaderOptions(
                show_title=True,
                show_class=True,
                show_date=True,
                show_duration=True,
                show_marks=True,
                show_instructions=True,
                organization_name="শিক্ষা বোর্ড"
            ),
            footer_options=FooterOptions(
                show_page_numbers=True,
                show_instructions=True
            )
        )
        
        # Generate HTML preview
        html_content = await template_engine.render_question_paper_template(
            exam=exam,
            exam_set=exam_set,
            template_type="compact_bengali",
            customization=customization
        )
        
        return Response(
            content=html_content,
            media_type="text/html"
        )
        
    except Exception as e:
        logger.error(f"Error generating preview: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate preview: {str(e)}")

@app.post("/generate-scholarship-pdf", response_model=ScholarshipResponse)
async def generate_scholarship_pdf(request: ScholarshipRequest):
    """
    Generate a PDF scholarship result list
    
    Args:
        request: ScholarshipRequest containing scholarship data
        
    Returns:
        ScholarshipResponse with PDF data and metadata
    """
    try:
        logger.info(f"Generating scholarship PDF for class: {request.class_name}")
        
        # Validate request data
        if not request.students:
            raise HTTPException(status_code=400, detail="Student data is required")
        
        # Generate PDF (bytes) using WeasyPrint-based generator
        pdf_bytes = await pdf_generator.generate_scholarship_pdf(request)
        
        # Create response
        # Base64 encode for JSON response compatibility
        import base64
        pdf_b64 = base64.b64encode(pdf_bytes).decode("utf-8")

        response = ScholarshipResponse(
            success=True,
            message="Scholarship PDF generated successfully",
            pdf_data=pdf_b64,
            class_name=request.class_name,
            total_students=len(request.students),
            generated_at=datetime.now().isoformat()
        )
        
        logger.info(f"Successfully generated scholarship PDF: {request.class_name}")
        return response
        
    except Exception as e:
        logger.error(f"Error generating scholarship PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate scholarship PDF: {str(e)}")

@app.post("/generate-scholarship-pdf/download")
async def download_scholarship_pdf(request: ScholarshipRequest):
    """
    Generate and directly download a PDF scholarship result list
    
    Args:
        request: ScholarshipRequest containing scholarship data
        
    Returns:
        PDF file as Response
    """
    try:
        logger.info(f"Generating and downloading scholarship PDF for class: {request.class_name}")
        
        # Generate PDF (bytes)
        pdf_bytes = await pdf_generator.generate_scholarship_pdf(request)
        
        # Create safe ASCII filename (no Bengali characters for HTTP header)
        safe_filename = f"Scholarship_Class_{request.class_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        safe_filename = "".join(c for c in safe_filename if c.isascii() and (c.isalnum() or c in (' ', '-', '_'))).rstrip()
        
        # Return PDF as download
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={safe_filename}",
                "Content-Type": "application/pdf"
            }
        )
        
    except Exception as e:
        logger.error(f"Error downloading scholarship PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate scholarship PDF: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PDF_SERVICE_PORT", 8000))
    host = os.getenv("PDF_SERVICE_HOST", "0.0.0.0")
    
    logger.info(f"Starting PDF Service on {host}:{port}")
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
