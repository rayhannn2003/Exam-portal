"""
Template engine for rendering question paper templates
"""

import os
from typing import Dict, Any, Optional
from jinja2 import Environment, FileSystemLoader, Template
import logging
from datetime import datetime

from models.question_models import Exam, ExamSet, PaperCustomization, TemplateInfo
from services.latex_renderer import latex_renderer

logger = logging.getLogger(__name__)


class TemplateEngine:
    """Template engine for rendering question paper templates"""
    
    def __init__(self, template_dir: str = "templates"):
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.template_dir = os.path.join(base_path, template_dir)
        self.jinja_env = Environment(
            loader=FileSystemLoader(self.template_dir),
            autoescape=True,
            trim_blocks=True,
            lstrip_blocks=True
        )
        
        # Add custom filters
        self.jinja_env.filters['format_marks'] = self._format_marks
        self.jinja_env.filters['format_duration'] = self._format_duration
        self.jinja_env.filters['format_date'] = self._format_date
        self.jinja_env.filters['bengali_number'] = self._bengali_number
        self.jinja_env.filters['bengali_class'] = self._bengali_class
        self.jinja_env.filters['process_latex'] = self._process_latex
        
        logger.info(f"Template engine initialized with template directory: {template_dir}")
    
    async def render_question_paper_template(
        self,
        exam: Exam,
        exam_set: ExamSet,
        template_type: str = "default",
        customization: Optional[PaperCustomization] = None
    ) -> str:
        """
        Render question paper template to HTML
        
        Args:
            exam: Exam information
            exam_set: Exam set with questions
            template_type: Type of template to use
            customization: Customization options
            
        Returns:
            Rendered HTML content
        """
        try:
            # Set default customization if not provided
            if customization is None:
                customization = PaperCustomization()
            
            # Process questions to convert LaTeX expressions to SVG
            processed_exam_set = exam_set.copy() if hasattr(exam_set, 'copy') else exam_set
            if hasattr(processed_exam_set, 'questions') and processed_exam_set.questions:
                # Convert questions to list of dicts for processing
                questions_data = []
                for question in processed_exam_set.questions:
                    if hasattr(question, 'dict'):
                        questions_data.append(question.dict())
                    elif hasattr(question, '__dict__'):
                        questions_data.append(question.__dict__)
                    else:
                        questions_data.append(question)
                
                # Process LaTeX expressions in questions
                processed_questions = latex_renderer.process_questions_list(questions_data)
                
                # Update exam_set with processed questions
                # Note: We'll pass both original and processed questions to template
                logger.info(f"Processed {len(processed_questions)} questions for LaTeX expressions")
            else:
                processed_questions = []
            
            # Load template - use compact Bengali template by default
            if template_type == "bengali" or template_type == "default" or template_type == "compact_bengali":
                template_name = "compact_bengali_question_paper.html"
            else:
                template_name = f"{template_type}_question_paper.html"
            
            template = self.jinja_env.get_template(template_name)
            
            # Prepare template context
            context = {
                "exam": exam,
                "exam_set": exam_set,
                "processed_questions": processed_questions,  # Add processed questions
                "customization": customization,
                "generation_time": datetime.now(),
                "page_break": "page-break-after: always;",
                "clear_both": "clear: both;",
                "section_break": "margin-top: 30px;"
            }
            
            # Render template
            html_content = template.render(**context)
            
            logger.info(f"Successfully rendered template: {template_name}")
            return html_content
            
        except Exception as e:
            logger.error(f"Error rendering template: {str(e)}")
            raise Exception(f"Failed to render template: {str(e)}")
    
    async def render_scholarship_template(self, scholarship_request) -> str:
        """
        Render scholarship template to HTML
        
        Args:
            scholarship_request: ScholarshipRequest containing scholarship data
            
        Returns:
            HTML content as string
        """
        try:
            logger.info(f"Rendering scholarship template for class: {scholarship_request.class_name}")
            
            # Create template context
            context = {
                'scholarship_request': scholarship_request,
                'current_date': datetime.now().strftime('%d/%m/%Y'),
                'current_time': datetime.now().strftime('%H:%M:%S')
            }
            
            # Get the scholarship template
            template = self.jinja_env.get_template('scholarship_template.html')
            
            # Render template
            html_content = template.render(**context)
            
            logger.info(f"Successfully rendered scholarship template for class: {scholarship_request.class_name}")
            return html_content
            
        except Exception as e:
            logger.error(f"Error rendering scholarship template: {str(e)}")
            raise Exception(f"Failed to render scholarship template: {str(e)}")

    async def render_admit_card_template(self, admit_request) -> str:
        """
        Render admit card template to HTML
        Args:
            admit_request: object with student and exam fields
        Returns:
            HTML content as string
        """
        try:
            logger.info("Rendering admit card template")
            context = {
                'admit': admit_request,
                'current_date': datetime.now().strftime('%d/%m/%Y'),
                'current_time': datetime.now().strftime('%H:%M:%S')
            }
            # Try multiple template filenames for compatibility
            candidate_templates = [
                'admit_card_template_v2.html',
                'admit_card_template.html',
                'admit_card.html',
            ]
            last_error = None
            for name in candidate_templates:
                try:
                    template = self.jinja_env.get_template(name)
                    html_content = template.render(**context)
                    logger.info(f"Successfully rendered admit card with template: {name}")
                    return html_content
                except Exception as te:
                    last_error = te
                    logger.warning(f"Admit template not usable: {name} ({te})")
                    continue
            # If none worked, raise
            raise Exception(f"No admit card template found. Last error: {last_error}")
            
        except Exception as e:
            logger.error(f"Error rendering admit card template: {str(e)}")
            raise Exception(f"Failed to render admit card template: {str(e)}")
    
    async def get_available_templates(self) -> list:
        """Get list of available templates"""
        try:
            templates = []
            if os.path.exists(self.template_dir):
                for filename in os.listdir(self.template_dir):
                    if filename.endswith('.html') and '_question_paper' in filename:
                        template_name = filename.replace('_question_paper.html', '')
                        templates.append({
                            "name": template_name,
                            "filename": filename,
                            "description": f"{template_name.title()} question paper template"
                        })
            
            return templates
            
        except Exception as e:
            logger.error(f"Error getting available templates: {str(e)}")
            return []
    
    async def get_template_info(self, template_name: str) -> Optional[TemplateInfo]:
        """Get information about a specific template"""
        try:
            # This would typically read from a template metadata file
            # For now, return default info
            template_info = TemplateInfo(
                name=template_name,
                description=f"{template_name.title()} question paper template",
                version="1.0.0",
                supported_paper_sizes=["A4", "A3"],
                supported_orientations=["portrait", "landscape"],
                features=["MCQ support", "Answer spaces", "Page numbers", "Customizable headers"]
            )
            
            return template_info
            
        except Exception as e:
            logger.error(f"Error getting template info: {str(e)}")
            return None
    
    def _format_marks(self, marks: int) -> str:
        """Format marks for display"""
        return f"{marks} mark{'s' if marks != 1 else ''}"
    
    def _format_duration(self, minutes: int) -> str:
        """Format duration in minutes to hours and minutes"""
        if minutes < 60:
            return f"{minutes} minutes"
        else:
            hours = minutes // 60
            remaining_minutes = minutes % 60
            if remaining_minutes == 0:
                return f"{hours} hour{'s' if hours != 1 else ''}"
            else:
                return f"{hours} hour{'s' if hours != 1 else ''} {remaining_minutes} minutes"
    
    def _format_date(self, date_obj: datetime) -> str:
        """Format date for display"""
        return date_obj.strftime("%d %B %Y")
    
    def _bengali_number(self, number: int) -> str:
        """Convert number to Bengali digits"""
        bengali_digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
        return ''.join(bengali_digits[int(digit)] for digit in str(number))
        
    def _bengali_class(self, value) -> str:
        """Map class numeric values to Bengali class names with শ্রেণি suffix"""
        mapping = {
            '6': 'ষষ্ঠ শ্রেণি',
            '7': 'সপ্তম শ্রেণি',
            '8': 'অষ্টম শ্রেণি',
            '9': 'নবম শ্রেণি',
            '10': 'দশম শ্রেণি',
        }
        s = str(value).strip()
        return mapping.get(s, f"শ্রেণি {s}")
    
    def _process_latex(self, text: str) -> str:
        """Process text to convert LaTeX expressions to SVG"""
        if not text:
            return text
        return latex_renderer.process_text_with_latex(str(text))

   


class TemplateValidator:
    """Validator for template syntax and structure"""
    
    @staticmethod
    def validate_template(template_path: str) -> Dict[str, Any]:
        """
        Validate template file
        
        Args:
            template_path: Path to template file
            
        Returns:
            Validation result dictionary
        """
        result = {
            "valid": True,
            "errors": [],
            "warnings": [],
            "required_variables": []
        }
        
        try:
            with open(template_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for required variables
            required_vars = ['exam', 'exam_set', 'customization']
            for var in required_vars:
                if f"{{{{ {var}" not in content and f"{{% for" not in content:
                    result["warnings"].append(f"Variable '{var}' not found in template")
            
            # Check for basic HTML structure
            if '<!DOCTYPE html>' not in content:
                result["warnings"].append("Missing DOCTYPE declaration")
            
            if '<html>' not in content:
                result["errors"].append("Missing <html> tag")
                result["valid"] = False
            
            if '<head>' not in content:
                result["errors"].append("Missing <head> tag")
                result["valid"] = False
            
            if '<body>' not in content:
                result["errors"].append("Missing <body> tag")
                result["valid"] = False
            
        except Exception as e:
            result["valid"] = False
            result["errors"].append(f"Error reading template: {str(e)}")
        
        return result
