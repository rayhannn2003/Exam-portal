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
from services.reportlab_pdf_generator import ReportLabPDFGenerator
from services.template_engine import TemplateEngine

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

# Initialize services
pdf_generator = ReportLabPDFGenerator()
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
        
        # Generate PDF
        pdf_data = await pdf_generator.generate_question_paper(
            exam=request.exam,
            exam_set=request.exam_set,
            template_type=request.template_type,
            customization=request.customization
        )
        
        # Create response
        response = QuestionPaperResponse(
            success=True,
            message="Question paper generated successfully",
            pdf_data=pdf_data,
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
        
        # Generate PDF
        pdf_data = await pdf_generator.generate_question_paper(
            exam=request.exam,
            exam_set=request.exam_set,
            template_type=request.template_type,
            customization=request.customization
        )
        
        # Create filename
        filename = f"{request.exam.title}_{request.exam_set.set_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filename = "".join(c for c in filename if c.isalnum() or c in (' ', '-', '_')).rstrip()
        
        # Return PDF as download
        return Response(
            content=pdf_data,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
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
            "font_sizes": ["10pt", "11pt", "12pt", "14pt", "16pt"],
            "margins": ["narrow", "normal", "wide"],
            "orientation": ["portrait", "landscape"],
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
