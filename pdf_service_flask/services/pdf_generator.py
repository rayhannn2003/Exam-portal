"""
PDF generation service using WeasyPrint
"""

import io
import logging
from typing import Optional
import asyncio
from concurrent.futures import ThreadPoolExecutor

from models.question_models import Exam, ExamSet, PaperCustomization
from services.template_engine import TemplateEngine

# Try to import WeasyPrint, fallback to basic HTML if not available
try:
    from weasyprint import HTML, CSS
    from weasyprint.text.fonts import FontConfiguration
    WEASYPRINT_AVAILABLE = True
except ImportError:
    WEASYPRINT_AVAILABLE = False
    print("Warning: WeasyPrint not fully available. PDF generation may be limited.")

logger = logging.getLogger(__name__)


class PDFGenerator:
    """PDF generator service using WeasyPrint"""
    
    def __init__(self, template_engine: Optional[TemplateEngine] = None):
        self.template_engine = template_engine or TemplateEngine()
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Font configuration for better font support
        if WEASYPRINT_AVAILABLE:
            self.font_config = FontConfiguration()
        else:
            self.font_config = None
        
        logger.info("PDF generator initialized")
    
    async def generate_question_paper(
        self,
        exam: Exam,
        exam_set: ExamSet,
        template_type: str = "default",
        customization: Optional[PaperCustomization] = None
    ) -> bytes:
        """
        Generate PDF question paper
        
        Args:
            exam: Exam information
            exam_set: Exam set with questions
            template_type: Type of template to use
            customization: Customization options
            
        Returns:
            PDF data as bytes
        """
        try:
            logger.info(f"Starting PDF generation for exam: {exam.title}")
            
            # Set default customization if not provided
            if customization is None:
                customization = PaperCustomization()
            
            # Generate HTML content
            html_content = await self.template_engine.render_question_paper_template(
                exam=exam,
                exam_set=exam_set,
                template_type=template_type,
                customization=customization
            )
            
            # Generate PDF from HTML
            pdf_data = await self._html_to_pdf(html_content, customization)
            
            logger.info(f"Successfully generated PDF for exam: {exam.title}")
            return pdf_data
            
        except Exception as e:
            logger.error(f"Error generating PDF: {str(e)}")
            raise Exception(f"Failed to generate PDF: {str(e)}")
    
    async def generate_scholarship_pdf(self, scholarship_request) -> bytes:
        """
        Generate PDF scholarship result list
        
        Args:
            scholarship_request: ScholarshipRequest containing scholarship data
            
        Returns:
            PDF data as bytes
        """
        try:
            logger.info(f"Starting scholarship PDF generation for class: {scholarship_request.class_name}")
            
            # Generate HTML content for scholarship
            html_content = await self.template_engine.render_scholarship_template(scholarship_request)
            
            # Generate PDF from HTML
            pdf_data = await self._html_to_pdf_scholarship(html_content)
            
            logger.info(f"Successfully generated scholarship PDF for class: {scholarship_request.class_name}")
            return pdf_data
            
        except Exception as e:
            logger.error(f"Error generating scholarship PDF: {str(e)}")
            raise Exception(f"Failed to generate scholarship PDF: {str(e)}")
    
    async def _html_to_pdf_scholarship(self, html_content: str) -> bytes:
        """
        Convert HTML content to PDF for scholarship using WeasyPrint
        
        Args:
            html_content: HTML content to convert
            
        Returns:
            PDF data as bytes
        """
        try:
            # Run PDF generation in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            pdf_data = await loop.run_in_executor(
                self.executor,
                self._generate_scholarship_pdf_sync,
                html_content
            )
            
            return pdf_data
            
        except Exception as e:
            logger.error(f"Error converting scholarship HTML to PDF: {str(e)}")
            raise Exception(f"Failed to convert scholarship HTML to PDF: {str(e)}")
    
    def _generate_scholarship_pdf_sync(self, html_content: str) -> bytes:
        """
        Synchronous scholarship PDF generation
        
        Args:
            html_content: HTML content
            
        Returns:
            PDF data as bytes
        """
        try:
            if not WEASYPRINT_AVAILABLE:
                # Fallback: return HTML content as a simple text file
                logger.warning("WeasyPrint not available, returning HTML content")
                return html_content.encode('utf-8')
            
            # Create HTML object with base URL for resolving relative paths
            import os
            base_url = f"file://{os.path.abspath('.')}/"
            html_doc = HTML(string=html_content, base_url=base_url)
            
            # Create CSS for scholarship styling
            css_content = self._generate_scholarship_css()
            css_doc = CSS(string=css_content, font_config=self.font_config)
            
            # Generate PDF
            pdf_buffer = io.BytesIO()
            html_doc.write_pdf(
                target=pdf_buffer,
                stylesheets=[css_doc],
                font_config=self.font_config,
                optimize_size=['fonts']
            )
            
            pdf_data = pdf_buffer.getvalue()
            pdf_buffer.close()
            
            return pdf_data
            
        except Exception as e:
            logger.error(f"Error in synchronous scholarship PDF generation: {str(e)}")
            # Fallback: return HTML content
            logger.warning("Scholarship PDF generation failed, returning HTML content as fallback")
            return html_content.encode('utf-8')
    
    def _generate_scholarship_css(self) -> str:
        """
        Generate CSS for scholarship PDF styling with Bengali font support
        
        Returns:
            CSS content as string
        """
        css_content = """
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap');
        
        @page {
            size: A4;
            margin: 0.5in;
        }
        
        * {
            font-feature-settings: "kern" 1, "liga" 1;
            -webkit-font-feature-settings: "kern" 1, "liga" 1;
        }
        
        body {
            font-family: 'Noto Sans Bengali', 'Hind Siliguri', 'SolaimanLipi', Arial, sans-serif;
            font-size: 12pt;
            color: #333;
            direction: ltr;
            text-rendering: optimizeLegibility;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }
        
        /* Header styling */
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
        }
        
        .bismillah {
            font-size: 18pt;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
        }
        
        .motto {
            font-size: 14pt;
            color: #374151;
            margin-bottom: 15px;
        }
        
        .org-name {
            font-size: 16pt;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
        }
        
        .org-details {
            font-size: 11pt;
            color: #6b7280;
            margin-bottom: 10px;
        }
        
        .exam-title {
            font-size: 18pt;
            font-weight: bold;
            color: #dc2626;
            margin-top: 15px;
        }
        
        /* Logo styling */
        .logo-container {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px 0;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            border: 3px solid #2563eb;
            border-radius: 50%;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24pt;
            color: #1e40af;
            margin-right: 20px;
        }
        
        /* Table styling */
        .scholarship-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .scholarship-table th {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 12px 8px;
            text-align: center;
            font-weight: bold;
            font-size: 12pt;
            border: 1px solid #1e40af;
        }
        
        .scholarship-table td {
            padding: 10px 8px;
            text-align: center;
            border: 1px solid #d1d5db;
            font-size: 11pt;
        }
        
        .scholarship-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        
        .scholarship-table tr:hover {
            background-color: #e0f2fe;
        }
        
        /* Class title */
        .class-title {
            font-size: 16pt;
            font-weight: bold;
            color: #1e40af;
            text-align: center;
            margin: 25px 0 15px 0;
            padding: 10px;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border-radius: 8px;
            border: 2px solid #3b82f6;
        }
        
        /* Serial number styling */
        .serial-no {
            font-weight: bold;
            color: #1e40af;
        }
        
        /* Name styling */
        .student-name {
            font-weight: 500;
            color: #374151;
            text-align: left;
            padding-left: 15px;
        }
        
        /* School styling */
        .school-name {
            color: #6b7280;
            text-align: left;
            padding-left: 15px;
        }
        
        /* Roll number styling */
        .roll-number {
            font-weight: bold;
            color: #dc2626;
        }
        
        /* Print-specific styles */
        @media print {
            .scholarship-table {
                break-inside: avoid;
                page-break-inside: avoid;
            }
            
            .header {
                break-after: avoid;
            }
            
            .class-title {
                break-after: avoid;
            }
        }
        """
        
        return css_content
    
    async def _html_to_pdf(
        self, 
        html_content: str, 
        customization: PaperCustomization
    ) -> bytes:
        """
        Convert HTML content to PDF using WeasyPrint
        
        Args:
            html_content: HTML content to convert
            customization: Customization options
            
        Returns:
            PDF data as bytes
        """
        try:
            # Run PDF generation in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            pdf_data = await loop.run_in_executor(
                self.executor,
                self._generate_pdf_sync,
                html_content,
                customization
            )
            
            return pdf_data
            
        except Exception as e:
            logger.error(f"Error converting HTML to PDF: {str(e)}")
            raise Exception(f"Failed to convert HTML to PDF: {str(e)}")
    
    def _generate_pdf_sync(
        self, 
        html_content: str, 
        customization: PaperCustomization
    ) -> bytes:
        """
        Synchronous PDF generation
        
        Args:
            html_content: HTML content
            customization: Customization options
            
        Returns:
            PDF data as bytes
        """
        try:
            if not WEASYPRINT_AVAILABLE:
                # Fallback: return HTML content as a simple text file
                logger.warning("WeasyPrint not available, returning HTML content")
                return html_content.encode('utf-8')
            
            # Create HTML object
            html_doc = HTML(string=html_content)
            
            # Create CSS for additional styling
            css_content = self._generate_css(customization)
            css_doc = CSS(string=css_content, font_config=self.font_config)
            
            # Generate PDF
            pdf_buffer = io.BytesIO()
            html_doc.write_pdf(
                target=pdf_buffer,
                stylesheets=[css_doc],
                font_config=self.font_config,
                optimize_size=['fonts']
            )
            
            pdf_data = pdf_buffer.getvalue()
            pdf_buffer.close()
            
            return pdf_data
            
        except Exception as e:
            logger.error(f"Error in synchronous PDF generation: {str(e)}")
            # Fallback: return HTML content
            logger.warning("PDF generation failed, returning HTML content as fallback")
            return html_content.encode('utf-8')
    
    def _generate_css(self, customization: PaperCustomization) -> str:
        """
        Generate additional CSS for PDF styling with Bengali font support
        
        Args:
            customization: Customization options
            
        Returns:
            CSS content as string
        """
        css_content = f"""
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap');
        
        @page {{
            size: {customization.paper_size.value};
            margin: {self._get_margin_value(customization.margin_type)};
        }}
        
        * {{
            font-feature-settings: "kern" 1, "liga" 1;
            -webkit-font-feature-settings: "kern" 1, "liga" 1;
        }}
        
        body {{
            font-family: 'Noto Sans Bengali', 'Hind Siliguri', 'SolaimanLipi', Arial, sans-serif;
            font-size: {customization.font_size.value};
            color: #333;
            direction: ltr;
            text-rendering: optimizeLegibility;
        }}
        
        /* Bengali text styling */
        .bengali-text {{
            font-family: 'Noto Sans Bengali', 'Hind Siliguri', Arial, sans-serif;
            direction: ltr;
            unicode-bidi: bidi-override;
        }}
        
        .bengali-char {{
            font-family: 'Noto Sans Bengali', 'Hind Siliguri', Arial, sans-serif;
            font-size: 1.1em;
        }}
        
        /* Option key styling - Use Arial for English letters ONLY */
        .option-key {{
            font-family: Arial, sans-serif !important;
            font-weight: bold;
            display: inline-block;
            width: 25px;
            height: 25px;
            border: 2px solid #333;
            border-radius: 50%;
            text-align: center;
            line-height: 21px;
            background-color: white;
            margin-right: 10px;
            color: #495057;
        }}
        
        /* Print-specific styles */
        @media print {{
            .question {{
                break-inside: avoid;
                page-break-inside: avoid;
            }}
            
            .header {{
                break-after: avoid;
            }}
            
            .instructions-box {{
                break-after: avoid;
            }}
            
            .option-key {{
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }}
        }}
        """
        
        # Add landscape orientation if needed
        if customization.orientation.value == 'landscape':
            css_content += f"""
        @page {{
            size: {customization.paper_size.value} landscape;
        }}
        """
        
        # Add watermark if provided
        if customization.watermark:
            css_content += f"""
        @page {{
            @top-center {{
                content: "{customization.watermark}";
                font-size: 2em;
                color: rgba(0,0,0,0.1);
                transform: rotate(-45deg);
                position: fixed;
                top: 50%;
                left: 50%;
                z-index: -1;
            }}
        }}
        """
        
        return css_content
    
    def _get_margin_value(self, margin_type: str) -> str:
        """Get margin value based on margin type"""
        margin_map = {
            "narrow": "0.5in",
            "normal": "1in", 
            "wide": "1.5in"
        }
        return margin_map.get(margin_type, "1in")
    
    async def validate_pdf(self, pdf_data: bytes) -> dict:
        """
        Validate generated PDF
        
        Args:
            pdf_data: PDF data to validate
            
        Returns:
            Validation result dictionary
        """
        try:
            result = {
                "valid": True,
                "file_size": len(pdf_data),
                "errors": [],
                "warnings": []
            }
            
            # Check file size
            if len(pdf_data) == 0:
                result["valid"] = False
                result["errors"].append("PDF file is empty")
            
            # Check if it's a valid PDF (basic check)
            if not pdf_data.startswith(b'%PDF-'):
                result["valid"] = False
                result["errors"].append("Invalid PDF format")
            
            # Check file size limits
            max_size = 50 * 1024 * 1024  # 50MB
            if len(pdf_data) > max_size:
                result["warnings"].append(f"PDF file size ({len(pdf_data)} bytes) is large")
            
            return result
            
        except Exception as e:
            logger.error(f"Error validating PDF: {str(e)}")
            return {
                "valid": False,
                "file_size": 0,
                "errors": [f"Validation failed: {str(e)}"],
                "warnings": []
            }
    
    async def get_pdf_metadata(self, pdf_data: bytes) -> dict:
        """
        Extract metadata from PDF
        
        Args:
            pdf_data: PDF data
            
        Returns:
            PDF metadata dictionary
        """
        try:
            # This is a simplified metadata extraction
            # In a production environment, you might want to use PyPDF2 or similar
            metadata = {
                "file_size": len(pdf_data),
                "pages": 1,  # This would need to be calculated from actual PDF
                "created_at": None,
                "title": None,
                "author": None,
                "subject": None
            }
            
            return metadata
            
        except Exception as e:
            logger.error(f"Error extracting PDF metadata: {str(e)}")
            return {
                "file_size": len(pdf_data),
                "pages": 1,
                "created_at": None,
                "title": None,
                "author": None,
                "subject": None,
                "error": str(e)
            }
    
    def cleanup(self):
        """Cleanup resources"""
        if hasattr(self, 'executor'):
            self.executor.shutdown(wait=True)
        logger.info("PDF generator cleanup completed")


class PDFOptimizer:
    """PDF optimization utilities"""
    
    @staticmethod
    def optimize_pdf_size(pdf_data: bytes, max_size_mb: int = 10) -> bytes:
        """
        Optimize PDF file size
        
        Args:
            pdf_data: Original PDF data
            max_size_mb: Maximum size in MB
            
        Returns:
            Optimized PDF data
        """
        try:
            # Basic size check
            current_size_mb = len(pdf_data) / (1024 * 1024)
            
            if current_size_mb <= max_size_mb:
                return pdf_data
            
            # In a production environment, you would implement actual optimization
            # This could include image compression, font subsetting, etc.
            logger.warning(f"PDF size ({current_size_mb:.2f}MB) exceeds limit ({max_size_mb}MB)")
            
            return pdf_data
            
        except Exception as e:
            logger.error(f"Error optimizing PDF: {str(e)}")
            return pdf_data
    
    @staticmethod
    def compress_images(pdf_data: bytes) -> bytes:
        """
        Compress images in PDF (placeholder implementation)
        
        Args:
            pdf_data: PDF data
            
        Returns:
            Compressed PDF data
        """
        # This would require additional libraries like PyMuPDF or similar
        # For now, return original data
        return pdf_data
