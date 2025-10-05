#!/usr/bin/env python3
"""
Test script for Flask PDF Service templates
"""

import requests
import json
import os
from datetime import datetime

# Test data for question paper
question_paper_data = {
    "exam": {
        "title": "মেধাবৃত্তি পরীক্ষা - ২০২৫",
        "class_name": "দশম শ্রেণী",
        "year": 2025,
        "question_count": 2
    },
    "exam_set": {
        "set_number": 1,
        "set_name": "Set A",
        "total_marks": 60,
        "duration_minutes": 90,
        "questions": [
            {
                "qno": 1,
                "question": "বাংলাদেশের রাজধানী কোনটি?",
                "options": {
                    "A": "চট্টগ্রাম",
                    "B": "ঢাকা",
                    "C": "রাজশাহী",
                    "D": "খুলনা"
                }
            },
            {
                "qno": 2,
                "question": "২ + ২ = কত?",
                "options": {
                    "A": "৩",
                    "B": "৪",
                    "C": "৫",
                    "D": "৬"
                }
            }
        ],
        "answer_key": {
            "1": "B",
            "2": "B"
        }
    },
    "customization": {
        "header_options": {
            "organization_name": "উত্তর তারাবুনিয়া ছাত্রকল্যাণ সংগঠন",
            "show_logo": True
        },
        "template_type": "compact_bengali",
        "paper_size": "A4",
        "orientation": "portrait"
    }
}

# Test data for scholarship
scholarship_data = {
    "class_name": "দশম শ্রেণী",
    "students": [
        {
            "serial_no": 1,
            "name": "আহমেদ রহমান",
            "school": "উত্তর তারাবুনিয়া উচ্চ বিদ্যালয়",
            "roll_number": "UTS001"
        },
        {
            "serial_no": 2,
            "name": "ফাতেমা খাতুন",
            "school": "দক্ষিণ তারাবুনিয়া উচ্চ বিদ্যালয়",
            "roll_number": "DTS002"
        },
        {
            "serial_no": 3,
            "name": "করিম উদ্দিন",
            "school": "পূর্ব তারাবুনিয়া উচ্চ বিদ্যালয়",
            "roll_number": "PTS003"
        }
    ],
    "exam_name": "উপবৃত্তি পরীক্ষা - ২০২৫",
    "organization_name": "উত্তর তারাবুনিয়া ছাত্র-কল্যাণ সংগঠন",
    "motto": "দৃষ্টিভঙ্গি বদলান, জীবন বদলে যাবে",
    "established_year": "2004 ইং",
    "location": "Uttar Tarabunia, Sadar Upazila, Shariatpur, Bangladesh."
}

def test_question_paper():
    """Test question paper PDF generation"""
    print("🧪 Testing Question Paper PDF Generation...")
    
    try:
        response = requests.post(
            'http://localhost:8000/generate-question-paper/download',
            json=question_paper_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 200:
            # Save PDF
            filename = f"test_question_paper_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            with open(filename, 'wb') as f:
                f.write(response.content)
            print(f"✅ Question Paper PDF generated successfully: {filename}")
            print(f"   Size: {len(response.content)} bytes")
            return True
        else:
            print(f"❌ Question Paper PDF generation failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing question paper: {e}")
        return False

def test_scholarship_pdf():
    """Test scholarship PDF generation"""
    print("\n🧪 Testing Scholarship PDF Generation...")
    
    try:
        response = requests.post(
            'http://localhost:8000/generate-scholarship-pdf/download',
            json=scholarship_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 200:
            # Save PDF
            filename = f"test_scholarship_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            with open(filename, 'wb') as f:
                f.write(response.content)
            print(f"✅ Scholarship PDF generated successfully: {filename}")
            print(f"   Size: {len(response.content)} bytes")
            return True
        else:
            print(f"❌ Scholarship PDF generation failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing scholarship: {e}")
        return False

def test_health():
    """Test service health"""
    print("🏥 Testing Service Health...")
    
    try:
        response = requests.get('http://localhost:8000/health', timeout=10)
        
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Service is healthy: {health_data['status']}")
            print(f"   Framework: {health_data['framework']}")
            print(f"   Version: {health_data['version']}")
            return True
        else:
            print(f"❌ Service health check failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error checking service health: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Flask PDF Service Template Tests")
    print("=" * 50)
    
    # Test service health first
    if not test_health():
        print("\n❌ Service is not healthy. Please start the Flask service first.")
        return
    
    # Test question paper
    question_success = test_question_paper()
    
    # Test scholarship
    scholarship_success = test_scholarship_pdf()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"   Health Check: ✅")
    print(f"   Question Paper: {'✅' if question_success else '❌'}")
    print(f"   Scholarship PDF: {'✅' if scholarship_success else '❌'}")
    
    if question_success and scholarship_success:
        print("\n🎉 All tests passed! Both templates are working correctly.")
        print("   Your Flask PDF service is ready for production use.")
    else:
        print("\n⚠️  Some tests failed. Please check the error messages above.")

if __name__ == "__main__":
    main()
