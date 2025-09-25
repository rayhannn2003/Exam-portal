import logging
import base64
from io import BytesIO
from typing import Optional
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
import urllib.request
import os

logger = logging.getLogger(__name__)

class ReportLabPDFGenerator:
    """PDF generator using ReportLab for creating actual PDF files"""
    
    def __init__(self):
        # Register Bengali font
        try:
            # Download and register Noto Sans Bengali font
            font_url = "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansBengali/NotoSansBengali-Regular.ttf"
            font_path = "/tmp/NotoSansBengali-Regular.ttf"
            
            if not os.path.exists(font_path):
                urllib.request.urlretrieve(font_url, font_path)
            
            pdfmetrics.registerFont(TTFont('NotoSansBengali', font_path))
            self.bengali_font = "NotoSansBengali"
            logger.info("Bengali font registered successfully")
        except Exception as e:
            logger.warning(f"Could not register Bengali font: {e}")
            self.bengali_font = "Helvetica"
        
        logger.info("ReportLab PDF generator initialized")
    
    async def generate_question_paper(self, exam=None, exam_set=None, template_type: str = "default", customization: Optional[dict] = None) -> str:
        """
        Generate a compact PDF document using ReportLab with Bengali font support
        
        Args:
            exam: Exam data
            exam_set: Exam set data
            template_type: Template type to use
            customization: Optional customization options
            
        Returns:
            Base64 encoded PDF content
        """
        try:
            logger.info("Starting ReportLab PDF generation with Bengali font")
            
            # Create a BytesIO buffer to hold the PDF
            buffer = BytesIO()
            
            # Create the PDF document with minimal margins for compact layout
            doc = SimpleDocTemplate(
                buffer,
                pagesize=A4,
                rightMargin=0.5*inch,
                leftMargin=0.5*inch,
                topMargin=0.4*inch,
                bottomMargin=0.4*inch
            )
            
            # Create compact styles
            title_style = ParagraphStyle(
                'Title',
                fontSize=14,
                spaceAfter=6,
                alignment=TA_CENTER,
                fontName=self.bengali_font,
                leading=16
            )
            
            header_style = ParagraphStyle(
                'Header',
                fontSize=12,
                spaceAfter=4,
                alignment=TA_CENTER,
                fontName=self.bengali_font,
                leading=14
            )
            
            meta_style = ParagraphStyle(
                'Meta',
                fontSize=9,
                spaceAfter=3,
                alignment=TA_CENTER,
                fontName=self.bengali_font,
                leading=11
            )
            
            question_style = ParagraphStyle(
                'Question',
                fontSize=9,
                spaceAfter=3,
                alignment=TA_LEFT,
                fontName=self.bengali_font,
                leading=11,
                leftIndent=0
            )
            
            option_style = ParagraphStyle(
                'Option',
                fontSize=8,
                spaceAfter=1,
                alignment=TA_LEFT,
                fontName=self.bengali_font,
                leading=10,
                leftIndent=15
            )
            
            guideline_style = ParagraphStyle(
                'Guideline',
                fontSize=8,
                spaceAfter=2,
                alignment=TA_LEFT,
                fontName=self.bengali_font,
                leading=10
            )
            
            # Build the story (content)
            story = []
            
            # Add compact header
            if exam and hasattr(exam, 'organization'):
                story.append(Paragraph(exam.organization, title_style))
            
            if exam and hasattr(exam, 'title'):
                story.append(Paragraph(exam.title, header_style))
            
            if exam and hasattr(exam, 'class_name'):
                story.append(Paragraph(exam.class_name, meta_style))
            
            if exam_set and hasattr(exam_set, 'set_name'):
                story.append(Paragraph(exam_set.set_name, meta_style))
            
            # Add exam meta information
            if exam_set:
                meta_text = f"পূর্ণমান: {exam_set.total_marks} | সময়: {exam_set.duration_minutes} মিনিট"
                story.append(Paragraph(meta_text, meta_style))
                story.append(Spacer(1, 6))
            
            # Add compact guidelines
            guidelines_text = "সাধারণ নির্দেশনা: ১) সকল প্রশ্নের উত্তর দিতে হবে ২) প্রতিটি প্রশ্নের মান ১ নম্বর ৩) সঠিক উত্তরটি বেছে নিন ৪) শুধুমাত্র নীল বা কালো কালি ব্যবহার করুন ৫) সময়ের সদ্ব্যবহার করুন ৬) জমা দেওয়ার আগে উত্তরগুলি পরীক্ষা করুন"
            story.append(Paragraph(guidelines_text, guideline_style))
            story.append(Spacer(1, 8))
            
            # Add questions in two columns using Table
            if exam_set and hasattr(exam_set, 'questions'):
                questions = exam_set.questions
                
                # Split questions for two pages - 30 questions per page
                first_page_questions = questions[:30] if len(questions) >= 30 else questions
                second_page_questions = questions[30:] if len(questions) > 30 else []
                
                # Create table data for first page
                table_data = []
                for i in range(0, len(first_page_questions), 2):
                    row = []
                    # Left column question
                    if i < len(first_page_questions):
                        q = first_page_questions[i]
                        left_q = f"{q.qno}. {q.question}"
                        left_options = ""
                        if hasattr(q, 'options') and q.options:
                            for opt_key, opt_text in q.options.items():
                                left_options += f"({opt_key}) {opt_text}<br/>"
                        row.append(Paragraph(left_q + "<br/>" + left_options, question_style))
                    else:
                        row.append(Paragraph("", question_style))
                    
                    # Right column question
                    if i + 1 < len(first_page_questions):
                        q = first_page_questions[i + 1]
                        right_q = f"{q.qno}. {q.question}"
                        right_options = ""
                        if hasattr(q, 'options') and q.options:
                            for opt_key, opt_text in q.options.items():
                                right_options += f"({opt_key}) {opt_text}<br/>"
                        row.append(Paragraph(right_q + "<br/>" + right_options, question_style))
                    else:
                        row.append(Paragraph("", question_style))
                    
                    table_data.append(row)
                
                # Create table for first page
                if table_data:
                    table = Table(table_data, colWidths=[3.2*inch, 3.2*inch])
                    table.setStyle(TableStyle([
                        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                        ('LEFTPADDING', (0, 0), (-1, -1), 0),
                        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                        ('TOPPADDING', (0, 0), (-1, -1), 0),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
                    ]))
                    story.append(table)
                
                # Add page break for second page
                if second_page_questions:
                    story.append(PageBreak())
                    
                    # Create table data for second page
                    table_data2 = []
                    for i in range(0, len(second_page_questions), 2):
                        row = []
                        # Left column question
                        if i < len(second_page_questions):
                            q = second_page_questions[i]
                            left_q = f"{q.qno}. {q.question}"
                            left_options = ""
                            if hasattr(q, 'options') and q.options:
                                for opt_key, opt_text in q.options.items():
                                    left_options += f"({opt_key}) {opt_text}<br/>"
                            row.append(Paragraph(left_q + "<br/>" + left_options, question_style))
                        else:
                            row.append(Paragraph("", question_style))
                        
                        # Right column question
                        if i + 1 < len(second_page_questions):
                            q = second_page_questions[i + 1]
                            right_q = f"{q.qno}. {q.question}"
                            right_options = ""
                            if hasattr(q, 'options') and q.options:
                                for opt_key, opt_text in q.options.items():
                                    right_options += f"({opt_key}) {opt_text}<br/>"
                            row.append(Paragraph(right_q + "<br/>" + right_options, question_style))
                        else:
                            row.append(Paragraph("", question_style))
                        
                        table_data2.append(row)
                    
                    # Create table for second page
                    if table_data2:
                        table2 = Table(table_data2, colWidths=[3.2*inch, 3.2*inch])
                        table2.setStyle(TableStyle([
                            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                            ('LEFTPADDING', (0, 0), (-1, -1), 0),
                            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                            ('TOPPADDING', (0, 0), (-1, -1), 0),
                            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
                        ]))
                        story.append(table2)
            
            # Build the PDF
            doc.build(story)
            
            # Get the PDF content
            pdf_content = buffer.getvalue()
            buffer.close()
            
            # Encode as base64
            pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
            
            logger.info("Successfully generated compact PDF with Bengali font")
            return pdf_base64
            
        except Exception as e:
            logger.error(f"Error generating PDF with ReportLab: {str(e)}")
            raise
