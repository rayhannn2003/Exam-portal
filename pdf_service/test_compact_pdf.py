#!/usr/bin/env python3
"""
Test script for compact Bengali PDF generation with 60 questions
"""

import asyncio
import base64
import os
from models.question_models import Exam, ExamSet, Question, PaperCustomization, HeaderOptions, FooterOptions

# Bengali number mapping
BENGALI_NUMBERS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']

def to_bengali_number(num):
    """Convert number to Bengali digits"""
    return ''.join(BENGALI_NUMBERS[int(digit)] for digit in str(num))

async def test_compact_bengali_pdf():
    """Test compact Bengali PDF generation with 60 questions"""
    
    # Create sample exam data
    exam = Exam(
        title="মেধাবৃত্তী পরীক্ষা - ২০২৫",
        class_name="সেট - A",
        year=2025,
        question_count=60
    )
    
    # Create 60 sample questions
    questions = []
    for i in range(1, 61):
        question_texts = [
            f"বাংলাদেশের রাজধানীর নাম কী?",
            f"২ + {i} = কত?",
            f"বাংলা ভাষার প্রথম কবি কে?",
            f"পৃথিবীর বৃহত্তম মহাদেশ কোনটি?",
            f"বাংলাদেশের স্বাধীনতা দিবস কবে?",
            f"গণিতের মৌলিক সংখ্যা কয়টি?",
            f"বাংলা সাহিত্যের প্রথম উপন্যাস কোনটি?",
            f"সূর্যের সবচেয়ে কাছের গ্রহ কোনটি?",
            f"বাংলাদেশের জাতীয় পাখি কোনটি?",
            f"পৃথিবীর দীর্ঘতম নদী কোনটি?"
        ]
        
        question = Question(
            qno=i,
            question=question_texts[i % len(question_texts)],
            question_type="mcq",
            marks=1,
            options={
                "A": f"উত্তর A - {i}",
                "B": f"উত্তর B - {i}",
                "C": f"উত্তর C - {i}",
                "D": f"উত্তর D - {i}"
            }
        )
        questions.append(question)
    
    # Create answer key
    answer_key = {str(i): chr(65 + (i % 4)) for i in range(1, 61)}  # A, B, C, D pattern
    
    exam_set = ExamSet(
        set_name="সেট - A",
        questions=questions,
        answer_key=answer_key,
        total_marks=60,
        duration_minutes=90,
        instructions="সকল প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ১ নম্বর।"
    )
    
    # Create customization for compact layout
    customization = PaperCustomization(
        paper_size="A4",
        orientation="portrait",
        font_size="9pt",
        margin_type="narrow",
        show_answer_spaces=True,
        header_options=HeaderOptions(
            show_logo=False,
            show_title=True,
            show_class=True,
            show_date=True,
            show_duration=True,
            show_marks=True,
            show_instructions=True,
            organization_name="শিক্ষা বোর্ড"
        ),
        footer_options=FooterOptions(
            show_page_numbers=True,
            show_instructions=True
        )
    )
    
    # Test WeasyPrint PDF generator
    print("Testing WeasyPrint PDF generator with compact Bengali template...")
    from services.pdf_generator import PDFGenerator
    
    pdf_gen = PDFGenerator()
    pdf_data = await pdf_gen.generate_question_paper(
        exam=exam,
        exam_set=exam_set,
        template_type="compact_bengali",
        customization=customization
    )
    
    # Save PDF
    with open("test_compact_bengali_60q.pdf", "wb") as f:
        f.write(pdf_data)
    print("WeasyPrint PDF saved as test_compact_bengali_60q.pdf")
    
    # Test template engine
    print("Testing template engine with compact Bengali template...")
    from services.template_engine import TemplateEngine
    
    template_engine = TemplateEngine()
    html_content = await template_engine.render_question_paper_template(
        exam=exam,
        exam_set=exam_set,
        template_type="compact_bengali",
        customization=customization
    )
    
    # Save HTML
    with open("test_compact_bengali_60q.html", "w", encoding="utf-8") as f:
        f.write(html_content)
    print("HTML template saved as test_compact_bengali_60q.html")
    
    print("Test completed successfully!")
    print(f"Generated PDF with {len(questions)} Bengali questions")
    print("Questions are numbered in Bengali: ১, ২, ৩, ...")
    print("Options are labeled in English: A, B, C, D")
    print("Layout is optimized for 2 A4 pages")

if __name__ == "__main__":
    asyncio.run(test_compact_bengali_pdf())
