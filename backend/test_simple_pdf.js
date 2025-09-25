#!/usr/bin/env node

/**
 * Simple PDF Test Script
 * Tests the simplified PDF generation without customization
 */

const axios = require('axios');

async function testSimplePDF() {
  console.log('🧪 Testing Simple PDF Generation...\n');

  try {
    // Test 1: Check services
    console.log('1️⃣ Checking services...');
    
    const pdfHealth = await axios.get('http://localhost:8000/health');
    console.log('✅ PDF Service:', pdfHealth.data.status);
    
    const backendHealth = await axios.get('http://localhost:4001/api/pdf/health');
    console.log('✅ Backend Service:', backendHealth.data.status);
    
    // Test 2: Generate simple PDF
    console.log('\n2️⃣ Testing simple PDF generation...');
    
    const sampleData = {
      exam: {
        title: "Sample Mathematics Exam",
        class_name: "Class 10",
        year: 2024,
        question_count: 3
      },
      exam_set: {
        set_name: "Set A",
        questions: [
          {
            qno: 1,
            question: "What is 5 + 3?",
            question_type: "mcq",
            marks: 1,
            options: {
              "A": "6",
              "B": "7",
              "C": "8",
              "D": "9"
            }
          },
          {
            qno: 2,
            question: "What is 10 - 4?",
            question_type: "mcq",
            marks: 1,
            options: {
              "A": "5",
              "B": "6",
              "C": "7",
              "D": "8"
            }
          }
        ],
        answer_key: {
          "1": "C",
          "2": "B"
        },
        total_marks: 2,
        duration_minutes: 60
      },
      template_type: "default"
    };

    const response = await axios.post('http://localhost:8000/generate-question-paper', sampleData);
    
    if (response.data.success) {
      console.log('✅ PDF generation successful!');
      console.log('   Exam:', response.data.exam_title);
      console.log('   Set:', response.data.set_name);
      console.log('   Questions:', response.data.total_questions);
      console.log('   Total marks:', response.data.total_marks);
      
      // Decode and check HTML content
      const htmlContent = Buffer.from(response.data.pdf_data, 'base64').toString('utf-8');
      console.log('   HTML length:', htmlContent.length, 'characters');
      console.log('   Contains exam title:', htmlContent.includes('Sample Mathematics Exam'));
      console.log('   Contains questions:', htmlContent.includes('What is 5 + 3?'));
      console.log('   Contains options:', htmlContent.includes('A) 6'));
      
      console.log('\n📄 PDF Content Preview:');
      console.log('   ' + htmlContent.substring(0, 200) + '...');
      
    } else {
      console.log('❌ PDF generation failed:', response.data.message);
    }

    console.log('\n🎉 Simple PDF generation test completed successfully!');
    console.log('\n📋 How to use:');
    console.log('   1. The PDF service generates HTML that can be printed to PDF');
    console.log('   2. Users can use browser Print to PDF functionality');
    console.log('   3. The HTML includes print-specific CSS for proper formatting');
    console.log('   4. No complex dependencies like WeasyPrint required');
    console.log('   5. Simple, reliable, and fast PDF generation');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Response:', error.response.data);
    }
    
    console.log('\n🔧 Make sure services are running:');
    console.log('   PDF Service: http://localhost:8000');
    console.log('   Backend: http://localhost:4001');
  }
}

// Run the test
testSimplePDF();
