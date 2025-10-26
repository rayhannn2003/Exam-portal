#!/usr/bin/env python3
"""
Debug script for LaTeX to SVG conversion
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.latex_renderer import latex_renderer, MATPLOTLIB_AVAILABLE
import logging

# Set up logging to see debug messages
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def test_latex_conversion():
    """Test LaTeX to SVG conversion step by step"""
    
    print("="*60)
    print("LaTeX to SVG Conversion Debug Test")
    print("="*60)
    
    # Check if matplotlib is available
    print(f"Matplotlib available: {MATPLOTLIB_AVAILABLE}")
    
    if not MATPLOTLIB_AVAILABLE:
        print("ERROR: Matplotlib not available!")
        return
    
    # Test cases
    test_cases = [
        "Simple equation: $$x^2 + y^2 = z^2$$",
        "Fraction: $$\\frac{a}{b} = \\frac{c}{d}$$",
        "Multiple equations: $$E = mc^2$$ and $$F = ma$$",
        "No equation: This is plain text",
        "Mixed: The area is $$\\pi r^2$$ square units."
    ]
    
    for i, test_text in enumerate(test_cases, 1):
        print(f"\n--- Test Case {i} ---")
        print(f"Input: {test_text}")
        
        # Find LaTeX expressions
        matches = latex_renderer.find_latex_expressions(test_text)
        print(f"Found {len(matches)} LaTeX expressions: {matches}")
        
        # Process each match individually
        for full_match, latex_expr in matches:
            print(f"\nProcessing: {full_match}")
            print(f"LaTeX expression: '{latex_expr}'")
            
            # Generate SVG
            svg_result = latex_renderer.latex_to_svg_matplotlib(latex_expr)
            print(f"SVG length: {len(svg_result)} characters")
            print(f"SVG starts with: {svg_result[:100]}...")
            print(f"Contains <svg: {'<svg' in svg_result}")
            print(f"Contains </svg>: {'</svg>' in svg_result}")
        
        # Process full text
        processed = latex_renderer.process_text_with_latex(test_text)
        print(f"\nFinal processed text length: {len(processed)} characters")
        print(f"Same as input: {processed == test_text}")
        
        # Show first 200 chars of processed text
        if len(processed) > 200:
            print(f"Processed (first 200 chars): {processed[:200]}...")
        else:
            print(f"Processed: {processed}")
        
        print("-" * 40)

def test_matplotlib_directly():
    """Test matplotlib LaTeX rendering directly"""
    print("\n" + "="*60)
    print("Direct Matplotlib Test")
    print("="*60)
    
    try:
        import matplotlib.pyplot as plt
        import matplotlib
        matplotlib.use('Agg')
        import io
        
        # Test simple LaTeX rendering
        latex_expr = "x^2 + y^2 = z^2"
        
        print(f"Testing LaTeX: {latex_expr}")
        
        # Create figure
        fig, ax = plt.subplots(figsize=(2, 1))
        ax.axis("off")
        
        # Render LaTeX
        ax.text(0, 0, f"${latex_expr}$", fontsize=14, ha='left', va='bottom')
        
        # Save to SVG
        buffer = io.BytesIO()
        plt.savefig(buffer, format="svg", bbox_inches="tight", pad_inches=0.05, 
                   transparent=True, facecolor='none')
        plt.close(fig)
        
        # Get SVG content
        svg = buffer.getvalue().decode("utf-8")
        
        print(f"Raw SVG length: {len(svg)} characters")
        print(f"Raw SVG (first 300 chars):\n{svg[:300]}...")
        
        # Process like in our renderer
        if "<svg" in svg:
            processed_svg = svg.split("<svg", 1)[-1]
            processed_svg = "<svg" + processed_svg
            print(f"\nProcessed SVG length: {len(processed_svg)} characters")
            print(f"Processed SVG (first 300 chars):\n{processed_svg[:300]}...")
        
    except Exception as e:
        print(f"Error in direct matplotlib test: {e}")
        import traceback
        traceback.print_exc()

def test_question_data():
    """Test with actual question data format"""
    print("\n" + "="*60)
    print("Question Data Format Test")
    print("="*60)
    
    # Simulate question data like from the payload
    test_question = {
        "qno": 1,
        "question": "What is the solution to $$ax^2 + bx + c = 0$$?",
        "question_type": "mcq",
        "marks": 1,
        "options": {
            "A": "$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$",
            "B": "$$x = \\frac{-b}{2a}$$",
            "C": "$$x = \\sqrt{c}$$",
            "D": "No solution"
        },
        "correct_answer": "A"
    }
    
    print("Original question:")
    print(f"Question: {test_question['question']}")
    print(f"Option A: {test_question['options']['A']}")
    
    # Process the question
    processed = latex_renderer.process_question_data(test_question)
    
    print("\nProcessed question:")
    print(f"Question: {processed['question']}")
    print(f"Option A: {processed['options']['A']}")
    
    print("\nChanges made:")
    print(f"Question changed: {processed['question'] != test_question['question']}")
    print(f"Option A changed: {processed['options']['A'] != test_question['options']['A']}")

if __name__ == "__main__":
    test_latex_conversion()
    test_matplotlib_directly()
    test_question_data()
