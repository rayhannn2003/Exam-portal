#!/usr/bin/env python3
"""
Test script for Flask PDF Service
"""

import requests
import json
from datetime import datetime

# Test data
test_data = {
    "exam": {
        "title": "Mathematics Final Exam",
        "class_name": "8",
        "year": 2024,
        "question_count": 50
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
                "question": "What is the capital of Bangladesh?",
                "question_type": "mcq",
                "marks": 1,
                "options": {
                    "A": "Chittagong",
                    "B": "Dhaka",
                    "C": "Sylhet",
                    "D": "Rajshahi"
                }
            }
        ],
        "answer_key": {
            "1": "B",
            "2": "B"
        }
    },
    "template_type": "compact_bengali",
    "customization": {
        "paper_size": "A4",
        "orientation": "portrait",
        "font_size": "12pt",
        "header_options": {
            "organization_name": "উত্তর তারাবুনিয়া ছাত্রকল্যাণ সংগঠন"
        },
        "show_answer_spaces": True
    }
}

def test_health():
    """Test health endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get("http://localhost:5000/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ Health check failed with status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_templates():
    """Test templates endpoint"""
    print("\n🔍 Testing templates endpoint...")
    try:
        response = requests.get("http://localhost:5000/templates")
        if response.status_code == 200:
            print("✅ Templates endpoint passed")
            data = response.json()
            print(f"Available templates: {len(data.get('templates', []))}")
            return True
        else:
            print(f"❌ Templates endpoint failed with status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Templates endpoint failed: {e}")
        return False

def test_customization_options():
    """Test customization options endpoint"""
    print("\n🔍 Testing customization options endpoint...")
    try:
        response = requests.get("http://localhost:5000/customization-options")
        if response.status_code == 200:
            print("✅ Customization options endpoint passed")
            data = response.json()
            print(f"Available options: {list(data.get('customization_options', {}).keys())}")
            return True
        else:
            print(f"❌ Customization options endpoint failed with status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Customization options endpoint failed: {e}")
        return False

def test_preview():
    """Test preview endpoint"""
    print("\n🔍 Testing preview endpoint...")
    try:
        response = requests.post(
            "http://localhost:5000/preview-question-paper",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            print("✅ Preview endpoint passed")
            print(f"HTML content length: {len(response.text)} characters")
            return True
        else:
            print(f"❌ Preview endpoint failed with status: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Preview endpoint failed: {e}")
        return False

def test_pdf_generation():
    """Test PDF generation endpoint"""
    print("\n🔍 Testing PDF generation endpoint...")
    try:
        response = requests.post(
            "http://localhost:5000/generate-question-paper/download",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            print("✅ PDF generation endpoint passed")
            print(f"PDF size: {len(response.content)} bytes")
            # Save PDF for verification
            with open("test_output.pdf", "wb") as f:
                f.write(response.content)
            print("📄 PDF saved as test_output.pdf")
            return True
        else:
            print(f"❌ PDF generation endpoint failed with status: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ PDF generation endpoint failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Flask PDF Service Tests")
    print("=" * 50)
    
    tests = [
        test_health,
        test_templates,
        test_customization_options,
        test_preview,
        test_pdf_generation
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Flask PDF Service is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the service configuration.")
    
    return passed == total

if __name__ == "__main__":
    main()
