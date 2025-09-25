#!/usr/bin/env python3
"""
Test script for PDF Service
This script tests the PDF service functionality
"""

import requests
import json
from datetime import datetime

# Service configuration
PDF_SERVICE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test the health endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{PDF_SERVICE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")
        return False

def test_templates_endpoint():
    """Test the templates endpoint"""
    print("🔍 Testing templates endpoint...")
    try:
        response = requests.get(f"{PDF_SERVICE_URL}/templates")
        if response.status_code == 200:
            print("✅ Templates endpoint working")
            print(f"   Available templates: {response.json()}")
            return True
        else:
            print(f"❌ Templates endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Templates endpoint error: {str(e)}")
        return False

def test_customization_options():
    """Test the customization options endpoint"""
    print("🔍 Testing customization options endpoint...")
    try:
        response = requests.get(f"{PDF_SERVICE_URL}/customization-options")
        if response.status_code == 200:
            print("✅ Customization options endpoint working")
            options = response.json()
            print(f"   Paper sizes: {options['customization_options']['paper_sizes']}")
            return True
        else:
            print(f"❌ Customization options failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Customization options error: {str(e)}")
        return False

def test_pdf_generation():
    """Test PDF generation with sample data"""
    print("🔍 Testing PDF generation...")
    
    # Sample exam data
    sample_data = {
        "exam": {
            "id": 1,
            "title": "Mathematics Final Exam",
            "class_name": "Class 10",
            "year": 2024,
            "question_count": 3,
            "created_at": datetime.now().isoformat()
        },
        "exam_set": {
            "set_name": "Set A",
            "questions": [
                {
                    "qno": 1,
                    "question": "What is 2 + 2?",
                    "question_type": "mcq",
                    "marks": 1,
                    "options": {
                        "A": "3",
                        "B": "4",
                        "C": "5",
                        "D": "6"
                    }
                },
                {
                    "qno": 2,
                    "question": "What is the capital of France?",
                    "question_type": "mcq",
                    "marks": 1,
                    "options": {
                        "A": "London",
                        "B": "Berlin",
                        "C": "Paris",
                        "D": "Madrid"
                    }
                },
                {
                    "qno": 3,
                    "question": "Explain the concept of gravity in your own words.",
                    "question_type": "long_answer",
                    "marks": 5
                }
            ],
            "answer_key": {
                "1": "B",
                "2": "C"
            },
            "total_marks": 7,
            "duration_minutes": 60,
            "instructions": "Read all questions carefully before answering."
        },
        "template_type": "default",
        "customization": {
            "paper_size": "A4",
            "orientation": "portrait",
            "font_size": "12pt",
            "margin_type": "normal",
            "header_options": {
                "show_logo": False,
                "show_title": True,
                "show_class": True,
                "show_date": True,
                "show_duration": True,
                "show_marks": True,
                "show_instructions": True,
                "organization_name": "Test School"
            },
            "footer_options": {
                "show_page_numbers": True,
                "show_instructions": True,
                "custom_text": "Good luck with your exam!"
            },
            "show_answer_spaces": True
        }
    }
    
    try:
        # Test PDF generation endpoint
        response = requests.post(
            f"{PDF_SERVICE_URL}/generate-question-paper",
            json=sample_data,
            timeout=30
        )
        
        if response.status_code == 200:
            print("✅ PDF generation successful")
            result = response.json()
            print(f"   Exam: {result['exam_title']}")
            print(f"   Set: {result['set_name']}")
            print(f"   Questions: {result['total_questions']}")
            print(f"   Total marks: {result['total_marks']}")
            return True
        else:
            print(f"❌ PDF generation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ PDF generation error: {str(e)}")
        return False

def test_preview_generation():
    """Test HTML preview generation"""
    print("🔍 Testing HTML preview generation...")
    
    # Use the same sample data as PDF generation
    sample_data = {
        "exam": {
            "title": "Mathematics Final Exam",
            "class_name": "Class 10",
            "year": 2024,
            "question_count": 2
        },
        "exam_set": {
            "set_name": "Set A",
            "questions": [
                {
                    "qno": 1,
                    "question": "What is 2 + 2?",
                    "question_type": "mcq",
                    "marks": 1,
                    "options": {
                        "A": "3",
                        "B": "4",
                        "C": "5",
                        "D": "6"
                    }
                },
                {
                    "qno": 2,
                    "question": "What is the capital of France?",
                    "question_type": "mcq",
                    "marks": 1,
                    "options": {
                        "A": "London",
                        "B": "Berlin",
                        "C": "Paris",
                        "D": "Madrid"
                    }
                }
            ],
            "answer_key": {
                "1": "B",
                "2": "C"
            },
            "total_marks": 2,
            "duration_minutes": 30
        },
        "template_type": "default",
        "customization": {
            "paper_size": "A4",
            "orientation": "portrait",
            "font_size": "12pt"
        }
    }
    
    try:
        response = requests.post(
            f"{PDF_SERVICE_URL}/preview-question-paper",
            json=sample_data,
            timeout=15
        )
        
        if response.status_code == 200:
            print("✅ HTML preview generation successful")
            html_content = response.text
            print(f"   Generated HTML length: {len(html_content)} characters")
            # Check if it contains expected elements
            if "Mathematics Final Exam" in html_content and "Set A" in html_content:
                print("✅ HTML content validation passed")
                return True
            else:
                print("❌ HTML content validation failed")
                return False
        else:
            print(f"❌ HTML preview generation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ HTML preview generation error: {str(e)}")
        return False

def run_all_tests():
    """Run all tests"""
    print("🚀 Starting PDF Service Tests")
    print("=" * 50)
    
    tests = [
        test_health_endpoint,
        test_templates_endpoint,
        test_customization_options,
        test_preview_generation,
        test_pdf_generation
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
            print()
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {str(e)}")
            print()
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! PDF Service is working correctly.")
        return True
    else:
        print("⚠️  Some tests failed. Please check the service configuration.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
