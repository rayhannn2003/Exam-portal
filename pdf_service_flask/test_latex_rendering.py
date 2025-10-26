#!/usr/bin/env python3
"""
Test script for LaTeX equation rendering
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.latex_renderer import latex_renderer

def test_latex_rendering():
    """Test LaTeX equation rendering"""
    print("Testing LaTeX equation rendering...")
    
    # Test cases with different LaTeX expressions
    test_cases = [
        "x^2 + y^2 = z^2",
        "\\frac{a}{b} = \\frac{c}{d}",
        "\\int_{0}^{1} x^2 dx",
        "\\sqrt{a^2 + b^2}",
        "\\sum_{i=1}^{n} x_i"
    ]
    
    print("\n1. Testing individual LaTeX expressions:")
    for i, latex_expr in enumerate(test_cases, 1):
        print(f"\n{i}. Testing: {latex_expr}")
        svg_result = latex_renderer.latex_to_svg_matplotlib(latex_expr)
        
        if svg_result.startswith('<svg'):
            print("   ✓ Successfully converted to SVG")
            print(f"   SVG length: {len(svg_result)} characters")
        else:
            print("   ✗ Failed to convert, returned:", svg_result[:100])
    
    print("\n2. Testing text with LaTeX expressions:")
    text_with_latex = """
    What is the solution to $$x^2 + 5x + 6 = 0$$?
    A) $$x = -2, -3$$
    B) $$x = 2, 3$$
    C) $$x = \\frac{-5 \\pm \\sqrt{25-24}}{2}$$
    D) No solution
    """
    
    processed_text = latex_renderer.process_text_with_latex(text_with_latex)
    print(f"Original text length: {len(text_with_latex)}")
    print(f"Processed text length: {len(processed_text)}")
    
    if '<svg' in processed_text:
        print("   ✓ Successfully processed text with LaTeX")
        svg_count = processed_text.count('<svg')
        print(f"   Found {svg_count} SVG elements")
    else:
        print("   ✗ No SVG elements found in processed text")
    
    print("\n3. Testing question data processing:")
    sample_question = {
        "qno": 1,
        "question": "Solve for x: $$x^2 - 4 = 0$$",
        "question_type": "mcq",
        "marks": 1,
        "options": {
            "A": "$$x = \\pm 2$$",
            "B": "$$x = 2$$",
            "C": "$$x = -2$$",
            "D": "No solution"
        },
        "correct_answer": "A"
    }
    
    processed_question = latex_renderer.process_question_data(sample_question)
    
    print("Original question:", sample_question['question'])
    print("Processed question:", processed_question['question'][:100] + "...")
    
    if '<svg' in processed_question['question']:
        print("   ✓ Successfully processed question text")
    else:
        print("   ✗ Failed to process question text")
    
    for key, value in processed_question['options'].items():
        if '<svg' in value:
            print(f"   ✓ Successfully processed option {key}")
        else:
            print(f"   - Option {key}: {value}")

if __name__ == "__main__":
    test_latex_rendering()
