"""
Exam Question Paper PDF Generation Service - Flask Version
A Flask microservice for generating professional PDF question papers
"""

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import logging
import os
import base64
from datetime import datetime
import urllib.request
import re 
import io

from models.question_models import (
    QuestionPaperRequest,
    QuestionPaperResponse,
    Question,
    ExamSet,
    Exam
)
from pydantic import BaseModel, ValidationError
from typing import List, Optional
from services.template_engine import TemplateEngine
from services.pdf_generator import PDFGenerator

# Scholarship models (exact copy from FastAPI)
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

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# App configuration
app.config.update(
    PDF_SERVICE_HOST=os.getenv('PDF_SERVICE_HOST', '0.0.0.0'),
    PDF_SERVICE_PORT=int(os.getenv('PDF_SERVICE_PORT', 8000)),
    DEBUG=os.getenv('DEBUG', 'False').lower() == 'true'
)

import matplotlib.pyplot as plt
def latex_to_svg_matplotlib(latex_expr: str) -> str:
    """
    Render a limited LaTeX math expression to inline SVG using Matplotlib.
    Works without a TeX installation.
    """
    fig, ax = plt.subplots(figsize=(0.01, 0.01))
    ax.axis("off")
    ax.text(0, 0, f"${latex_expr}$", fontsize=14)
    buf = io.BytesIO()
    plt.savefig(buf, format="svg", bbox_inches="tight", pad_inches=0.05)
    plt.close(fig)
    svg = buf.getvalue().decode("utf-8")
    svg = svg.split("<svg", 1)[-1]
    return "<svg" + svg


def preprocess_latex_to_svg(payload):
    """Finds $...$ LaTeX math and replaces with SVGs."""
    pattern = r"\$(.*?)\$"

    for q in payload["exam_set"]["questions"]:
        def repl(match):
            expr = match.group(1).strip()
            return latex_to_svg_matplotlib(expr)

        q["question"] = re.sub(pattern, repl, q["question"])
        q["options"] = {k: re.sub(pattern, repl, v) for k, v in q["options"].items()}

    return payload


# Function to download SolaimanLipi font (exact copy from FastAPI)
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

# Initialize services (exact copy from FastAPI)
pdf_generator = PDFGenerator()
template_engine = TemplateEngine()

@app.route("/", methods=['GET'])
def root():
    """Health check endpoint"""
    return {
        "service": "Exam Question Paper PDF Service",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.route("/health", methods=['GET'])
def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "framework": "Flask",
        "services": {
            "pdf_generator": "operational",
            "template_engine": "operational"
        },
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.route("/generate-question-paper", methods=['POST'])
def generate_question_paper():
    """
    Generate a PDF question paper from exam data
    
    Args:
        request: QuestionPaperRequest containing exam and question data
        
    Returns:
        QuestionPaperResponse with PDF data and metadata
    """
    try:
        request_data = request.get_json()
        if not request_data:
            return jsonify({"error": "Request body is required"}), 400
        
        # Validate request data
        try:
            pdf_request = QuestionPaperRequest(**request_data)
        except ValidationError as e:
            return jsonify({"error": f"Invalid request data: {str(e)}"}), 400
        
        logger.info(f"Generating question paper for exam: {pdf_request.exam.title}")
        
        # Validate request data
        if not pdf_request.exam or not pdf_request.exam_set:
            return jsonify({"error": "Exam and exam set data are required"}), 400
        
        # Generate PDF (bytes) using WeasyPrint-based generator
        import asyncio
        pdf_bytes = asyncio.run(pdf_generator.generate_question_paper(
            exam=pdf_request.exam,
            exam_set=pdf_request.exam_set,
            template_type=pdf_request.template_type,
            customization=pdf_request.customization
        ))
        
        # Create response
        # Base64 encode for JSON response compatibility
        pdf_b64 = base64.b64encode(pdf_bytes).decode("utf-8")

        response = QuestionPaperResponse(
            success=True,
            message="Question paper generated successfully",
            pdf_data=pdf_b64,
            exam_title=pdf_request.exam.title,
            set_name=pdf_request.exam_set.set_name,
            total_questions=len(pdf_request.exam_set.questions),
            total_marks=pdf_request.exam_set.total_marks or sum(q.marks for q in pdf_request.exam_set.questions),
            generated_at=datetime.now().isoformat()
        )
        
        logger.info(f"Successfully generated question paper: {pdf_request.exam.title} - {pdf_request.exam_set.set_name}")
        return jsonify(response.dict())
        
    except Exception as e:
        logger.error(f"Error generating question paper: {str(e)}")
        return jsonify({"error": f"Failed to generate question paper: {str(e)}"}), 500

@app.route("/generate-question-paper/download", methods=['POST'])
def download_question_paper():
    """
    Generate and directly download a PDF question paper
    
    Args:
        request: QuestionPaperRequest containing exam and question data
        
    Returns:
        PDF file as Response
    """
    try:
        request_data = request.get_json()
        if not request_data:
            return jsonify({"error": "Request body is required"}), 400
        
        request_data = preprocess_latex_to_svg(request_data)
        # Validate request data
        try:
            pdf_request = QuestionPaperRequest(**request_data)
        except ValidationError as e:
            return jsonify({"error": f"Invalid request data: {str(e)}"}), 400
        
        logger.info(f"Generating and downloading question paper for exam: {pdf_request.exam.title}")
        
        # Generate PDF (bytes)
        import asyncio
        pdf_bytes = asyncio.run(pdf_generator.generate_question_paper(
            exam=pdf_request.exam,
            exam_set=pdf_request.exam_set,
            template_type=pdf_request.template_type,
            customization=pdf_request.customization
        ))
        
        # Create safe ASCII filename (no Bengali characters for HTTP header)
        safe_filename = f"Bengali_Exam_{pdf_request.exam_set.set_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        safe_filename = "".join(c for c in safe_filename if c.isascii() and (c.isalnum() or c in (' ', '-', '_'))).rstrip()
        
        # Return PDF as download
        response = Response(
            pdf_bytes,
            mimetype="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={safe_filename}",
                "Content-Type": "application/pdf"
            }
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error downloading question paper: {str(e)}")
        return jsonify({"error": f"Failed to generate question paper: {str(e)}"}), 500

@app.route("/preview-question-paper", methods=['POST'])
def preview_question_paper():
    """
    Generate HTML preview of question paper (without PDF conversion)
    
    Args:
        request: QuestionPaperRequest containing exam and question data
        
    Returns:
        HTML content as string
    """
    try:
        request_data = request.get_json()
        if not request_data:
            return jsonify({"error": "Request body is required"}), 400
        
        # Validate request data
        try:
            pdf_request = QuestionPaperRequest(**request_data)
        except ValidationError as e:
            return jsonify({"error": f"Invalid request data: {str(e)}"}), 400
        
        logger.info(f"Generating preview for exam: {pdf_request.exam.title}")
        
        # Generate HTML content
        import asyncio
        html_content = asyncio.run(template_engine.render_question_paper_template(
            exam=pdf_request.exam,
            exam_set=pdf_request.exam_set,
            template_type=pdf_request.template_type,
            customization=pdf_request.customization
        ))
        
        return Response(html_content, mimetype="text/html")
        
    except Exception as e:
        logger.error(f"Error generating preview: {str(e)}")
        return jsonify({"error": f"Failed to generate preview: {str(e)}"}), 500

@app.route("/templates", methods=['GET'])
def get_templates():
    """Get available templates"""
    try:
        templates = [
            {
                "name": "compact_bengali",
                "description": "Compact Bengali question paper template",
                "version": "1.0.0",
                "supported_paper_sizes": ["A4", "A3"],
                "supported_orientations": ["portrait", "landscape"],
                "features": ["MCQ support", "Bengali text", "Compact layout"]
            },
            {
                "name": "scholarship",
                "description": "Scholarship result template",
                "version": "1.0.0",
                "supported_paper_sizes": ["A4"],
                "supported_orientations": ["portrait"],
                "features": ["Student list", "Bengali text", "Professional layout"]
            }
        ]
        
        return jsonify({"templates": templates})
        
    except Exception as e:
        logger.error(f"Error getting templates: {str(e)}")
        return jsonify({"error": f"Failed to get templates: {str(e)}"}), 500

@app.route("/templates/<template_name>", methods=['GET'])
def get_template_info(template_name):
    """Get specific template information"""
    try:
        template_info = {
            "compact_bengali": {
                "name": "compact_bengali",
                "description": "Compact Bengali question paper template",
                "version": "1.0.0",
                "supported_paper_sizes": ["A4", "A3"],
                "supported_orientations": ["portrait", "landscape"],
                "features": ["MCQ support", "Bengali text", "Compact layout"]
            },
            "scholarship": {
                "name": "scholarship",
                "description": "Scholarship result template",
                "version": "1.0.0",
                "supported_paper_sizes": ["A4"],
                "supported_orientations": ["portrait"],
                "features": ["Student list", "Bengali text", "Professional layout"]
            }
        }
        
        if template_name not in template_info:
            return jsonify({"error": "Template not found"}), 404
        
        return jsonify(template_info[template_name])
        
    except Exception as e:
        logger.error(f"Error getting template info: {str(e)}")
        return jsonify({"error": f"Failed to get template info: {str(e)}"}), 500

@app.route("/customization-options", methods=['GET'])
def get_customization_options():
    """Get available customization options"""
    try:
        options = {
            "paper_sizes": ["A4", "A3", "Legal", "Letter"],
            "orientations": ["portrait", "landscape"],
            "font_sizes": ["9pt", "10pt", "11pt", "12pt", "14pt", "16pt"],
            "margin_types": ["narrow", "normal", "wide"],
            "header_options": {
                "show_logo": True,
                "show_title": True,
                "show_class": True,
                "show_date": True,
                "show_duration": True,
                "show_marks": True,
                "show_instructions": True,
                "organization_name": "উত্তর তারাবুনিয়া ছাত্রকল্যাণ সংগঠন"
            },
            "footer_options": {
                "show_page_numbers": True,
                "show_instructions": True,
                "custom_text": ""
            }
        }
        
        return jsonify(options)
        
    except Exception as e:
        logger.error(f"Error getting customization options: {str(e)}")
        return jsonify({"error": f"Failed to get customization options: {str(e)}"}), 500

@app.route("/generate-scholarship-pdf", methods=['POST'])
def generate_scholarship_pdf():
    """
    Generate a PDF scholarship result list
    
    Args:
        request: ScholarshipRequest containing scholarship data
        
    Returns:
        ScholarshipResponse with PDF data and metadata
    """
    try:
        request_data = request.get_json()
        if not request_data:
            return jsonify({"error": "Request body is required"}), 400
        
        # Validate request data
        try:
            scholarship_request = ScholarshipRequest(**request_data)
        except ValidationError as e:
            return jsonify({"error": f"Invalid request data: {str(e)}"}), 400
        
        logger.info(f"Generating scholarship PDF for class: {scholarship_request.class_name}")
        
        # Validate request data
        if not scholarship_request.students:
            return jsonify({"error": "Student data is required"}), 400
        
        # Generate PDF (bytes) using WeasyPrint-based generator
        import asyncio
        pdf_bytes = asyncio.run(pdf_generator.generate_scholarship_pdf(scholarship_request))
        
        # Create response
        # Base64 encode for JSON response compatibility
        pdf_b64 = base64.b64encode(pdf_bytes).decode("utf-8")

        response = ScholarshipResponse(
            success=True,
            message="Scholarship PDF generated successfully",
            pdf_data=pdf_b64,
            class_name=scholarship_request.class_name,
            total_students=len(scholarship_request.students),
            generated_at=datetime.now().isoformat()
        )
        
        logger.info(f"Successfully generated scholarship PDF: {scholarship_request.class_name}")
        return jsonify(response.dict())
        
    except Exception as e:
        logger.error(f"Error generating scholarship PDF: {str(e)}")
        return jsonify({"error": f"Failed to generate scholarship PDF: {str(e)}"}), 500

@app.route("/generate-scholarship-pdf/download", methods=['POST'])
def download_scholarship_pdf():
    """
    Generate and directly download a PDF scholarship result list
    
    Args:
        request: ScholarshipRequest containing scholarship data
        
    Returns:
        PDF file as Response
    """
    try:
        request_data = request.get_json()
        if not request_data:
            return jsonify({"error": "Request body is required"}), 400
        
        # Validate request data
        try:
            scholarship_request = ScholarshipRequest(**request_data)
        except ValidationError as e:
            return jsonify({"error": f"Invalid request data: {str(e)}"}), 400
        
        logger.info(f"Generating and downloading scholarship PDF for class: {scholarship_request.class_name}")
        
        # Generate PDF (bytes)
        import asyncio
        pdf_bytes = asyncio.run(pdf_generator.generate_scholarship_pdf(scholarship_request))
        
        # Create safe ASCII filename (no Bengali characters for HTTP header)
        safe_filename = f"Scholarship_Class_{scholarship_request.class_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        safe_filename = "".join(c for c in safe_filename if c.isascii() and (c.isalnum() or c in (' ', '-', '_'))).rstrip()
        
        # Return PDF as download
        response = Response(
            pdf_bytes,
            mimetype="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={safe_filename}",
                "Content-Type": "application/pdf"
            }
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error downloading scholarship PDF: {str(e)}")
        return jsonify({"error": f"Failed to generate scholarship PDF: {str(e)}"}), 500

class AdmitRequest(BaseModel):
    student_name: str
    school: str
    class_name: str
    roll_number: str
    exam_name: str
    exam_date: str
    exam_time: str
    center_name: str
    instructions: Optional[str] = None

@app.route("/generate-admit-card", methods=['POST'])
def generate_admit_card():
    try:
        payload = request.get_json()
        if not payload:
            return jsonify({"error": "Request body is required"}), 400

        try:
            admit_req = AdmitRequest(**payload)
        except ValidationError as e:
            return jsonify({"error": f"Invalid request data: {str(e)}"}), 400

        import asyncio
        pdf_bytes = asyncio.run(pdf_generator.generate_admit_card_pdf(admit_req))
        pdf_b64 = base64.b64encode(pdf_bytes).decode("utf-8")
        return jsonify({
            "success": True,
            "message": "Admit card generated successfully",
            "pdf_data": pdf_b64
        })
    except Exception as e:
        logger.error(f"Error generating admit card: {str(e)}")
        return jsonify({"error": f"Failed to generate admit card: {str(e)}"}), 500

@app.route("/generate-admit-card/download", methods=['POST'])
def download_admit_card():
    try:
        payload = request.get_json()
        if not payload:
            return jsonify({"error": "Request body is required"}), 400
        try:
            admit_req = AdmitRequest(**payload)
        except ValidationError as e:
            return jsonify({"error": f"Invalid request data: {str(e)}"}), 400
        import asyncio
        pdf_bytes = asyncio.run(pdf_generator.generate_admit_card_pdf(admit_req))
        safe_filename = f"Admit_{admit_req.roll_number}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        safe_filename = "".join(c for c in safe_filename if c.isascii() and (c.isalnum() or c in (' ', '-', '_'))).rstrip()
        return Response(pdf_bytes, mimetype="application/pdf", headers={
            "Content-Disposition": f"attachment; filename={safe_filename}",
            "Content-Type": "application/pdf"
        })
    except Exception as e:
        logger.error(f"Error downloading admit card: {str(e)}")
        return jsonify({"error": f"Failed to download admit card: {str(e)}"}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Endpoint not found",
        "success": False
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "error": "Internal server error",
        "success": False
    }), 500

if __name__ == "__main__":
    port = app.config['PDF_SERVICE_PORT']
    host = app.config['PDF_SERVICE_HOST']
    debug = app.config['DEBUG']
    
    logger.info(f"Starting PDF Service on {host}:{port}")
    logger.info(f"Debug mode: {debug}")
    
    app.run(
        host=host,
        port=port,
        debug=debug,
        threaded=True
    )