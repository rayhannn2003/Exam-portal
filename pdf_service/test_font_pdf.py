#!/usr/bin/env python3
"""
Test script for Bengali font and PDF generation
"""

import asyncio
import base64
import os
from models.question_models import Exam, ExamSet, Question, PaperCustomization

async def test_bengali_pdf():
    """Test Bengali PDF generation with SolaimanLipi font"""
    
    # Create sample exam data
    exam = Exam(
        title="মেধাবৃত্তী পরীক্ষা - ২০২৫",
        class_name="সেট - A",
        year=2025,
        question_count=3
    )
    
    # Create sample questions
    questions = [
        Question(
            qno=1,
            question="বাংলাদেশের রাজধানীর নাম কী?",
            question_type="mcq",
            marks=1,
            options={
                "A": "ঢাকা",
                "B": "চট্টগ্রাম", 
                "C": "সিলেট",
                "D": "রাজশাহী"
            }
        ),
        Question(
            qno=2,
            question="২ + ২ = কত?",
            question_type="mcq",
            marks=1,
            options={
                "A": "৩",
                "B": "৪",
                "C": "৫", 
                "D": "৬"
            }
        ),
        Question(
            qno=3,
            question="বাংলা ভাষার প্রথম কবি কে?",
            question_type="mcq",
            marks=1,
            options={
                "A": "রবীন্দ্রনাথ ঠাকুর",
                "B": "কাজী নজরুল ইসলাম",
                "C": "মাইকেল মধুসূদন দত্ত",
                "D": "জসীমউদ্দীন"
            }
        )
    ]
    
    exam_set = ExamSet(
        set_name="সেট - A",
        questions=questions,
        answer_key={"1": "A", "2": "B", "3": "C"},
        total_marks=3,
        duration_minutes=30,
        instructions="সকল প্রশ্নের উত্তর দিতে হবে"
    )
    
    # Create customization
    customization = PaperCustomization(
        paper_size="A4",
        orientation="portrait",
        font_size="12pt",
        margin_type="normal",
        show_answer_spaces=True,
        header_options={
            "show_logo": False,
            "show_title": True,
            "show_class": True,
            "show_date": True,
            "show_duration": True,
            "show_marks": True,
            "show_instructions": True,
            "organization_name": "শিক্ষা বোর্ড"
        },
        footer_options={
            "show_page_numbers": True,
            "show_instructions": True
        }
    )
    
    # Test ReportLab PDF generator
    print("Testing ReportLab PDF generator...")
    from services.reportlab_pdf_generator import ReportLabPDFGenerator
    
    pdf_gen = ReportLabPDFGenerator()
    pdf_data = await pdf_gen.generate_question_paper(
        exam=exam,
        exam_set=exam_set,
        template_type="bengali",
        customization=customization
    )
    
    # Save PDF
    pdf_bytes = base64.b64decode(pdf_data)
    with open("test_bengali_reportlab.pdf", "wb") as f:
        f.write(pdf_bytes)
    print("ReportLab PDF saved as test_bengali_reportlab.pdf")
    
    # Test template engine
    print("Testing template engine...")
    from services.template_engine import TemplateEngine
    
    template_engine = TemplateEngine()
    html_content = await template_engine.render_question_paper_template(
        exam=exam,
        exam_set=exam_set,
        template_type="bengali",
        customization=customization
    )
    
    # Save HTML
    with open("test_bengali_template.html", "w", encoding="utf-8") as f:
        f.write(html_content)
    print("HTML template saved as test_bengali_template.html")
    
    print("Test completed successfully!")

if __name__ == "__main__":
    asyncio.run(test_bengali_pdf())
