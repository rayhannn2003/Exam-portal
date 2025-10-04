const axios = require('axios');

async function testPDFGeneration() {
  try {
    console.log('Testing PDF generation...');
    
    // Test data structure
    const testData = {
      exam: {
        id: 12345,
        title: "মেধাবৃত্তী পরীক্ষা - ২০২৫",
        class_name: "সেট - A",
        class: "সেট - A",
        year: 2025,
        question_count: 10,
        created_at: new Date().toISOString()
      },
      exam_set: {
        set_name: "সেট - A",
        questions: [
          {
            qno: 1,
            question: "নমুনা প্রশ্ন ১: এটি একটি পরীক্ষার প্রশ্ন।",
            question_type: "mcq",
            marks: 1,
            options: {
              A: "উত্তর A - ১",
              B: "উত্তর B - ১", 
              C: "উত্তর C - ১",
              D: "উত্তর D - ১"
            }
          },
          {
            qno: 2,
            question: "নমুনা প্রশ্ন ২: এটি একটি পরীক্ষার প্রশ্ন।",
            question_type: "mcq",
            marks: 1,
            options: {
              A: "উত্তর A - ২",
              B: "উত্তর B - ২",
              C: "উত্তর C - ২", 
              D: "উত্তর D - ২"
            }
          }
        ],
        answer_key: { "1": "A", "2": "B" },
        total_marks: 2,
        duration_minutes: 30
      },
      template_type: "compact_bengali",
      customization: {
        paper_size: "A4",
        orientation: "portrait",
        font_size: "10pt",
        margin_type: "normal",
        header_options: {
          organization_name: "উত্তর তারাবুনিয়া ছাত্রকল্যাণ সংগঠন"
        },
        show_answer_spaces: true
      }
    };

    // Test preview
    console.log('Testing preview...');
    const previewResponse = await axios.post('http://localhost:8000/preview-question-paper', testData);
    console.log('Preview response status:', previewResponse.status);
    console.log('Preview response length:', previewResponse.data.length);
    
    // Test PDF generation
    console.log('Testing PDF generation...');
    const pdfResponse = await axios.post('http://localhost:8000/generate-question-paper/download', testData, {
      responseType: 'arraybuffer'
    });
    console.log('PDF response status:', pdfResponse.status);
    console.log('PDF response size:', pdfResponse.data.length, 'bytes');
    
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testPDFGeneration();
