"""
Template engine for rendering question paper templates
"""

import os
from typing import Dict, Any, Optional
from jinja2 import Environment, FileSystemLoader, Template
import logging
from datetime import datetime

from models.question_models import Exam, ExamSet, PaperCustomization, TemplateInfo

logger = logging.getLogger(__name__)


class TemplateEngine:
    """Template engine for rendering question paper templates"""
    
    def __init__(self, template_dir: str = "templates"):
        self.template_dir = template_dir
        self.jinja_env = Environment(
            loader=FileSystemLoader(template_dir),
            autoescape=True,
            trim_blocks=True,
            lstrip_blocks=True
        )
        
        # Add custom filters
        self.jinja_env.filters['format_marks'] = self._format_marks
        self.jinja_env.filters['format_duration'] = self._format_duration
        self.jinja_env.filters['format_date'] = self._format_date
        self.jinja_env.filters['bengali_number'] = self._bengali_number
        
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
            
            # Load template - use Bengali template by default
            if template_type == "bengali" or template_type == "default":
                template_name = "bengali_question_paper.html"
            elif template_type == "compact_bengali":
                template_name = "compact_bengali_question_paper.html"
            else:
                template_name = f"{template_type}_question_paper.html"
            
            template = self.jinja_env.get_template(template_name)
            
            # Prepare template context
            context = {
                "exam": exam,
                "exam_set": exam_set,
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
