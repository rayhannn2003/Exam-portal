#!/usr/bin/env node

/**
 * Test script for PDF integration
 * This script tests the PDF generation with real exam data
 */

const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://localhost:4000';
const PDF_SERVICE_URL = 'http://localhost:8000';

async function testPDFIntegration() {
  console.log('🧪 Testing PDF Integration...\n');

  try {
    // Test 1: Check if services are running
    console.log('1️⃣ Testing service health...');
    
    const backendHealth = await axios.get(`${BACKEND_URL}/api/pdf/health`);
    console.log('✅ Backend service:', backendHealth.data.status);
    console.log('   PDF Service status:', backendHealth.data.pdf_service?.status);
    
    const pdfHealth = await axios.get(`${PDF_SERVICE_URL}/health`);
    console.log('✅ PDF service:', pdfHealth.data.status);
    
    // Test 2: Test PDF service directly
    console.log('\n2️⃣ Testing PDF service directly...');
    
    const sampleData = {
      exam: {
        title: "Mathematics Final Exam",
        class_name: "Class 10",
        year: 2024,
        question_count: 3
      },
      exam_set: {
        set_name: "Set A",
        questions: [
          {
            qno: 1,
            question: "What is 2 + 2?",
            question_type: "mcq",
            marks: 1,
            options: {
              "A": "3",
              "B": "4",
              "C": "5",
              "D": "6"
            }
          },
          {
            qno: 2,
            question: "What is the capital of France?",
            question_type: "mcq",
            marks: 1,
            options: {
              "A": "London",
              "B": "Berlin",
              "C": "Paris",
              "D": "Madrid"
            }
          }
        ],
        answer_key: {
          "1": "B",
          "2": "C"
        },
        total_marks: 2,
        duration_minutes: 60
      },
      template_type: "default",
      customization: {
        paper_size: "A4",
        orientation: "portrait",
        font_size: "12pt"
      }
    };

    const pdfResponse = await axios.post(`${PDF_SERVICE_URL}/generate-question-paper`, sampleData);
    console.log('✅ PDF generation successful');
    console.log('   Exam:', pdfResponse.data.exam_title);
    console.log('   Set:', pdfResponse.data.set_name);
    console.log('   Questions:', pdfResponse.data.total_questions);
    console.log('   Total marks:', pdfResponse.data.total_marks);

    // Test 3: Test HTML preview
    console.log('\n3️⃣ Testing HTML preview...');
    
    const previewResponse = await axios.post(`${PDF_SERVICE_URL}/preview-question-paper`, sampleData);
    console.log('✅ HTML preview successful');
    console.log('   Generated HTML length:', previewResponse.data.length, 'characters');

    // Test 4: Test customization options
    console.log('\n4️⃣ Testing customization options...');
    
    const customizationResponse = await axios.get(`${PDF_SERVICE_URL}/customization-options`);
    console.log('✅ Customization options retrieved');
    console.log('   Paper sizes:', customizationResponse.data.customization_options.paper_sizes.join(', '));

    console.log('\n🎉 All tests passed! PDF integration is working correctly.');
    console.log('\n📋 Next steps:');
    console.log('   1. Login to the frontend application');
    console.log('   2. Navigate to Exam Management');
    console.log('   3. Create or select an exam with question sets');
    console.log('   4. Click the PDF generation button (📄) on any set');
    console.log('   5. Customize and generate your PDF question paper');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Response:', error.response.data);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure both services are running:');
    console.log('      - Backend: npm start (in backend directory)');
    console.log('      - PDF Service: uvicorn main:app --host 0.0.0.0 --port 8000 (in pdf_service directory)');
    console.log('   2. Check if ports 4000 and 8000 are available');
    console.log('   3. Verify database connection for backend');
  }
}

// Run the test
testPDFIntegration();
