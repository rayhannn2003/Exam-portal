"""
LaTeX equation rendering service
Converts LaTeX expressions to SVG format for embedding in PDFs
"""

import io
import re
import logging
from typing import List, Tuple

logger = logging.getLogger(__name__)

# Try to import matplotlib, fallback if not available
try:
    import matplotlib.pyplot as plt
    import matplotlib
    # Use Agg backend for headless operation
    matplotlib.use('Agg')
    MATPLOTLIB_AVAILABLE = True
    logger.info("Matplotlib available for LaTeX rendering")
except ImportError:
    MATPLOTLIB_AVAILABLE = False
    logger.warning("Matplotlib not available. LaTeX equations will not be rendered.")


class LaTeXRenderer:
    """Service for rendering LaTeX equations to SVG"""
    
    def __init__(self):
        self.latex_pattern = re.compile(r'\$\$(.*?)\$\$', re.DOTALL)
        logger.info("LaTeX renderer initialized")
    
    def latex_to_svg_matplotlib(self, latex_expr: str) -> str:
        """
        Convert LaTeX expression to SVG using matplotlib
        
        Args:
            latex_expr: LaTeX expression without $$ wrappers
            
        Returns:
            SVG string for embedding
        """
        if not MATPLOTLIB_AVAILABLE:
            logger.warning(f"Matplotlib not available, returning original LaTeX: {latex_expr}")
            return f"$${latex_expr}$$"
        
        try:
            # Create a minimal figure
            fig, ax = plt.subplots(figsize=(0.01, 0.01))
            ax.axis("off")
            
            # Render the LaTeX expression
            ax.text(0, 0, f"${latex_expr}$", fontsize=14, ha='left', va='bottom')
            
            # Save to SVG buffer
            buffer = io.BytesIO()
            plt.savefig(buffer, format="svg", bbox_inches="tight", pad_inches=0.05, 
                       transparent=True, facecolor='none')
            plt.close(fig)
            
            # Get SVG content
            svg = buffer.getvalue().decode("utf-8")
            
            # Strip XML header so it can embed inline
            if "<svg" in svg:
                svg = svg.split("<svg", 1)[-1]
                svg = "<svg" + svg
            
            logger.debug(f"Successfully converted LaTeX to SVG: {latex_expr}")
            return svg
            
        except Exception as e:
            logger.error(f"Error converting LaTeX to SVG: {str(e)}")
            # Return original LaTeX as fallback
            return f"$${latex_expr}$$"
    
    def find_latex_expressions(self, text: str) -> List[Tuple[str, str]]:
        """
        Find all LaTeX expressions in text
        
        Args:
            text: Text to search for LaTeX expressions
            
        Returns:
            List of tuples (full_match, latex_expression)
        """
        matches = []
        for match in self.latex_pattern.finditer(text):
            full_match = match.group(0)  # $$expression$$
            latex_expr = match.group(1).strip()  # expression
            matches.append((full_match, latex_expr))
        
        return matches
    
    def process_text_with_latex(self, text: str) -> str:
        """
        Process text by converting all LaTeX expressions to SVG
        
        Args:
            text: Text containing LaTeX expressions
            
        Returns:
            Text with LaTeX expressions replaced by SVG
        """
        if not text:
            return text
        
        # Find all LaTeX expressions
        latex_matches = self.find_latex_expressions(text)
        
        if not latex_matches:
            return text
        
        logger.info(f"Found {len(latex_matches)} LaTeX expressions to process")
        
        # Replace each LaTeX expression with SVG
        processed_text = text
        for full_match, latex_expr in latex_matches:
            svg_content = self.latex_to_svg_matplotlib(latex_expr)
            processed_text = processed_text.replace(full_match, svg_content, 1)
        print(processed_text)
        return processed_text
    
    def process_question_data(self, question_data: dict) -> dict:
        """
        Process question data to convert LaTeX expressions
        
        Args:
            question_data: Dictionary containing question information
            
        Returns:
            Processed question data with LaTeX converted to SVG
        """
        if not question_data:
            return question_data
        
        # Create a copy to avoid modifying original
        processed_data = question_data.copy()
        
        # Process question text
        if 'question' in processed_data:
            processed_data['question'] = self.process_text_with_latex(processed_data['question'])
        
        # Process options if they exist
        if 'options' in processed_data and isinstance(processed_data['options'], dict):
            processed_options = {}
            for key, value in processed_data['options'].items():
                processed_options[key] = self.process_text_with_latex(str(value))
            processed_data['options'] = processed_options
        
        return processed_data
    
    def process_questions_list(self, questions: List[dict]) -> List[dict]:
        """
        Process a list of questions to convert LaTeX expressions
        
        Args:
            questions: List of question dictionaries
            
        Returns:
            List of processed questions with LaTeX converted to SVG
        """
        if not questions:
            return questions
        
        logger.info(f"Processing {len(questions)} questions for LaTeX expressions")
        
        processed_questions = []
        for question in questions:
            processed_question = self.process_question_data(question)
            processed_questions.append(processed_question)
        
        return processed_questions


# Global instance for easy access
latex_renderer = LaTeXRenderer()
