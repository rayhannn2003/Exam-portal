"""
Simple PDF Generator
A lightweight PDF generator that creates HTML content that can be printed to PDF
"""

import logging
import base64
from typing import Optional
from datetime import datetime
from .template_engine import TemplateEngine

logger = logging.getLogger(__name__)

class SimplePDFGenerator:
    """Simple PDF generator that creates print-ready HTML"""
    
    def __init__(self):
        self.template_engine = TemplateEngine()
        logger.info("Simple PDF generator initialized")
    
    async def generate_question_paper(self, exam=None, exam_set=None, template_type: str = "default", customization: Optional[dict] = None) -> str:
        """
        Generate a simple HTML document that can be printed to PDF
        
        Args:
            exam: Exam data
            exam_set: Exam set data
            template_type: Template type to use
            customization: Optional customization options
            
        Returns:
            Base64 encoded HTML content
        """
        try:
            logger.info("Starting simple PDF generation")
            
            # Use Bengali template for Bengali questions
            if template_type == "bengali" or (exam and hasattr(exam, 'organization')):
                template_name = "bengali_question_paper.html"
            else:
                template_name = "default_question_paper.html"
            
            # Render template
            html_content = await self.template_engine.render_question_paper_template(
                exam=exam,
                exam_set=exam_set,
                template_type=template_type,
                customization=customization
            )
            
            # Encode as base64 for consistent response format
            html_bytes = html_content.encode('utf-8')
            html_base64 = base64.b64encode(html_bytes).decode('utf-8')
            
            logger.info("Successfully generated HTML for PDF conversion")
            return html_base64
            
        except Exception as e:
            logger.error(f"Error generating PDF: {str(e)}")
            raise
    
    def _add_print_styles(self, html_content: str) -> str:
        """Add print-specific CSS styles to HTML content"""
        
        print_css = """
        <style>
            @media print {
                body {
                    font-family: 'Times New Roman', serif;
                    font-size: 12pt;
                    line-height: 1.4;
                    color: #000;
                    background: white;
                    margin: 0;
                    padding: 20px;
                }
                
                .page-break {
                    page-break-before: always;
                }
                
                .no-break {
                    page-break-inside: avoid;
                }
                
                .question {
                    page-break-inside: avoid;
                    margin-bottom: 20px;
                    padding: 10px;
                    border: 1px solid #ddd;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #000;
                    padding-bottom: 20px;
                }
                
                .instructions {
                    background: #f9f9f9;
                    border: 1px solid #ccc;
                    padding: 15px;
                    margin-bottom: 20px;
                }
                
                .options {
                    margin: 10px 0;
                }
                
                .option {
                    margin: 5px 0;
                    padding: 5px;
                }
                
                .answer-space {
                    border-bottom: 1px solid #000;
                    min-width: 100px;
                    display: inline-block;
                    margin: 0 5px;
                }
                
                .footer {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    font-size: 10pt;
                }
            }
            
            @page {
                size: A4;
                margin: 1in;
            }
            
            body {
                font-family: Arial, sans-serif;
                font-size: 14px;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
            }
            
            .exam-title {
                font-size: 24px;
                font-weight: bold;
                margin: 10px 0;
            }
            
            .exam-info {
                display: flex;
                justify-content: space-between;
                margin: 20px 0;
                font-size: 14px;
            }
            
            .instructions {
                background: #f0f8ff;
                border: 1px solid #4a90e2;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
            }
            
            .instructions h3 {
                margin-top: 0;
                color: #4a90e2;
            }
            
            .question {
                margin: 25px 0;
                padding: 15px;
                border-left: 4px solid #4a90e2;
                background: #f9f9f9;
            }
            
            .question-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .question-number {
                font-weight: bold;
                font-size: 16px;
                color: #4a90e2;
            }
            
            .question-marks {
                background: #4a90e2;
                color: white;
                padding: 4px 8px;
                border-radius: 3px;
                font-size: 12px;
            }
            
            .question-text {
                margin: 10px 0;
                font-size: 15px;
            }
            
            .options {
                margin: 15px 0;
                padding-left: 20px;
            }
            
            .option {
                margin: 8px 0;
                display: flex;
                align-items: flex-start;
            }
            
            .option-key {
                font-weight: bold;
                margin-right: 10px;
                min-width: 20px;
                color: #4a90e2;
            }
            
            .answer-spaces {
                margin: 15px 0;
                padding: 10px;
                background: #e8f5e8;
                border: 1px solid #4caf50;
                border-radius: 3px;
            }
            
            .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 20px;
            }
        </style>
        """
        
        # Insert print styles into the HTML
        if '<head>' in html_content:
            html_content = html_content.replace('<head>', f'<head>{print_css}')
        else:
            html_content = f'<html><head>{print_css}</head><body>{html_content}</body></html>'
        
        return html_content
    
    def _create_simple_html(self, exam, exam_set, customization=None):
        """Create simple HTML content for the question paper"""
        
        if not exam or not exam_set:
            return "<html><body><h1>Error: Missing exam data</h1></body></html>"
        
        # Calculate total marks
        total_marks = exam_set.total_marks or sum(q.marks for q in exam_set.questions)
        
        html = f"""
        <div class="header">
            <h1 class="exam-title">{exam.title}</h1>
            <div class="exam-info">
                <div>
                    <p><strong>Class:</strong> {exam.class_name}</p>
                    <p><strong>Year:</strong> {exam.year}</p>
                    <p><strong>Set:</strong> {exam_set.set_name}</p>
                </div>
                <div>
                    <p><strong>Total Questions:</strong> {len(exam_set.questions)}</p>
                    <p><strong>Total Marks:</strong> {total_marks}</p>
                    <p><strong>Date:</strong> {datetime.now().strftime('%Y-%m-%d')}</p>
                </div>
            </div>
        </div>
        
        <div class="instructions">
            <h3>General Instructions</h3>
            <ol>
                <li>Read all questions carefully before answering.</li>
                <li>All questions are compulsory.</li>
                <li>Write your answers clearly and legibly.</li>
                <li>For multiple choice questions, choose the best answer.</li>
                <li>Use only blue or black ink pen.</li>
            </ol>
        </div>
        
        <div class="questions">
        """
        
        # Add questions
        for question in exam_set.questions:
            html += f"""
            <div class="question">
                <div class="question-header">
                    <span class="question-number">Q{question.qno}</span>
                    <span class="question-marks">{question.marks} Mark{'s' if question.marks > 1 else ''}</span>
                </div>
                <div class="question-text">{question.question}</div>
            """
            
            # Add options for MCQ
            if question.question_type == 'mcq' and question.options:
                html += '<div class="options">'
                for key, text in question.options.items():
                    html += f'<div class="option"><span class="option-key">{key}</span> <span class="option-text">{text}</span></div>'
                html += '</div>'
            
            # Add answer space
            html += f"""
                <div class="answer-spaces">
                    <strong>Answer:</strong> <span class="answer-space"></span>
                </div>
            </div>
            """
        
        html += """
        </div>
        
        <div class="footer">
            <p>Best of luck!</p>
            <p>Generated on: """ + datetime.now().strftime('%Y-%m-%d %H:%M') + """</p>
        </div>
        """
        
        return html
