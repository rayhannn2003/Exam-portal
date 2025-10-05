"""
Exam Question Paper PDF Generation Service - Flask Version
A Flask microservice for generating professional PDF question papers
"""

from flask import Flask, request, jsonify, send_file, render_template_string, make_response
from flask_cors import CORS
import logging
import os
import io
import base64
from datetime import datetime
from typing import Dict, List, Optional, Any
import urllib.request

# Import PDF generation modules
from services.pdf_generator import PDFGenerator
from services.template_engine import TemplateEngine
from models.question_models import (
    QuestionPaperRequest,
    QuestionPaperResponse,
    Question,
    ExamSet,
    Exam,
    PaperCustomization,
    HeaderOptions,
    FooterOptions,
    ScholarshipRequest,
    ScholarshipResponse,
    ScholarshipStudent
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
app.config.update({
    'PDF_SERVICE_PORT': int(os.getenv('PDF_SERVICE_PORT', 8000)),
    'PDF_SERVICE_HOST': os.getenv('PDF_SERVICE_HOST', '0.0.0.0'),
    'TEMPLATE_DIR': os.getenv('TEMPLATE_DIR', '/app/templates'),
    'UPLOAD_DIR': os.getenv('UPLOAD_DIR', '/app/uploads'),
    'MAX_PAPER_SIZE': os.getenv('MAX_PAPER_SIZE', '50MB'),
    'LOG_LEVEL': os.getenv('LOG_LEVEL', 'INFO'),
    'DEBUG': os.getenv('DEBUG', 'false').lower() == 'true'
})

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

# Initialize services
pdf_generator = PDFGenerator()
template_engine = TemplateEngine()

# Connect services
pdf_generator.template_engine = template_engine

@app.route('/', methods=['GET'])
def root():
    """Root endpoint with service information"""
    return jsonify({
        "service": "Exam Question Paper PDF Service",
        "version": "1.0.0",
        "framework": "Flask",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "health": "/health",
            "generate_pdf": "/generate-question-paper/download",
            "preview": "/preview-question-paper",
            "templates": "/templates",
            "customization_options": "/customization-options"
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        return jsonify({
            "status": "healthy",
            "version": "1.0.0",
            "framework": "Flask",
            "timestamp": datetime.now().isoformat(),
            "services": {
                "pdf_generator": "operational",
                "template_engine": "operational"
            }
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 503

@app.route('/generate-question-paper/download', methods=['POST'])
def generate_question_paper_pdf():
    """Generate and download question paper PDF"""
    try:
        # Validate request content type
        if not request.is_json:
            return jsonify({
                "success": False,
                "error": "Content-Type must be application/json"
            }), 400

        # Parse request data
        request_data = request.get_json()
        
        # Validate required fields
        if not request_data:
            return jsonify({
                "success": False,
                "error": "Request body is required"
            }), 400

        # Create request model (with validation)
        try:
            pdf_request = QuestionPaperRequest(**request_data)
        except Exception as e:
            return jsonify({
                "success": False,
                "error": f"Invalid request data: {str(e)}"
            }), 400

        logger.info(f"Generating PDF for exam: {pdf_request.exam.title}, set: {pdf_request.exam_set.set_name}")

        # Generate PDF
        pdf_bytes = pdf_generator.generate_question_paper(
            pdf_request.exam,
            pdf_request.exam_set,
            pdf_request.template_type,
            pdf_request.customization
        )

        # Create filename
        safe_title = "".join(c for c in pdf_request.exam.title if c.isalnum() or c in (' ', '-', '_')).rstrip()
        safe_set = "".join(c for c in pdf_request.exam_set.set_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        filename = f"{safe_title}_{safe_set}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

        # Return PDF as file download
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        logger.error(f"PDF generation error: {e}")
        return jsonify({
            "success": False,
            "error": f"Failed to generate PDF: {str(e)}"
        }), 500

@app.route('/preview-question-paper', methods=['POST'])
def preview_question_paper():
    """Generate HTML preview of question paper"""
    try:
        # Validate request content type
        if not request.is_json:
            return jsonify({
                "success": False,
                "error": "Content-Type must be application/json"
            }), 400

        # Parse request data
        request_data = request.get_json()
        
        if not request_data:
            return jsonify({
                "success": False,
                "error": "Request body is required"
            }), 400

        # Create request model
        try:
            pdf_request = QuestionPaperRequest(**request_data)
        except Exception as e:
            return jsonify({
                "success": False,
                "error": f"Invalid request data: {str(e)}"
            }), 400

        logger.info(f"Generating preview for exam: {pdf_request.exam.title}, set: {pdf_request.exam_set.set_name}")

        # Generate HTML preview
        html_content = template_engine.render_template(
            pdf_request.exam,
            pdf_request.exam_set,
            pdf_request.template_type,
            pdf_request.customization
        )

        # Return HTML content
        return html_content, 200, {'Content-Type': 'text/html; charset=utf-8'}

    except Exception as e:
        logger.error(f"Preview generation error: {e}")
        return jsonify({
            "success": False,
            "error": f"Failed to generate preview: {str(e)}"
        }), 500

@app.route('/templates', methods=['GET'])
def get_available_templates():
    """Get available PDF templates"""
    try:
        templates = [
            {
                "name": "default",
                "description": "Standard question paper template",
                "version": "1.0.0",
                "supported_paper_sizes": ["A4", "A3", "Legal", "Letter"],
                "supported_orientations": ["portrait", "landscape"],
                "features": ["MCQ support", "Answer spaces", "Page numbers", "Bengali font support"]
            },
            {
                "name": "compact_bengali",
                "description": "Compact Bengali question paper template",
                "version": "1.0.0",
                "supported_paper_sizes": ["A4"],
                "supported_orientations": ["portrait"],
                "features": ["Bengali language", "Compact layout", "MCQ support", "Answer spaces"]
            }
        ]
        
        return jsonify({
            "success": True,
            "templates": templates
        })

    except Exception as e:
        logger.error(f"Error getting templates: {e}")
        return jsonify({
            "success": False,
            "error": f"Failed to get templates: {str(e)}"
        }), 500

@app.route('/customization-options', methods=['GET'])
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
                "show_instructions": True
            },
            "footer_options": {
                "show_page_numbers": True,
                "show_instructions": True
            },
            "additional_features": [
                "custom_css",
                "watermark",
                "show_answer_spaces"
            ]
        }
        
        return jsonify({
            "success": True,
            "customization_options": options
        })

    except Exception as e:
        logger.error(f"Error getting customization options: {e}")
        return jsonify({
            "success": False,
            "error": f"Failed to get customization options: {str(e)}"
        }), 500

@app.route('/generate-scholarship-pdf/download', methods=['POST'])
def generate_scholarship_pdf():
    """Generate scholarship result PDF"""
    try:
        request_data = request.get_json()
        
        if not request_data:
            return jsonify({
                "success": False,
                "error": "Request body is required"
            }), 400

        # Validate request data
        try:
            scholarship_request = ScholarshipRequest(**request_data)
        except Exception as e:
            return jsonify({
                "success": False,
                "error": f"Invalid request data: {str(e)}"
            }), 400

        logger.info(f"Generating scholarship PDF for class: {scholarship_request.class_name}")

        # Generate PDF
        pdf_bytes = pdf_generator.generate_scholarship_pdf(scholarship_request)

        # Create filename
        safe_class = "".join(c for c in scholarship_request.class_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        filename = f"scholarship_{safe_class}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

        # Return PDF as response
        response = make_response(pdf_bytes)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename="{filename}"'

        return response

    except Exception as e:
        logger.error(f"Scholarship PDF generation error: {e}")
        return jsonify({
            "success": False,
            "error": f"Failed to generate scholarship PDF: {str(e)}"
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        "success": False,
        "error": "Method not allowed"
    }), 405

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500

if __name__ == '__main__':
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

