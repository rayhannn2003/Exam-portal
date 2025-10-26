const axios = require('axios');

// Test exam analysis endpoint
async function testExamAnalysis() {
  const baseUrl = 'http://localhost:4000/api';
  
  try {
    // First, get all exams to find valid exam and class IDs
    console.log('1. Fetching all exams...');
    const examsResponse = await axios.get(`${baseUrl}/exam`);
    console.log('Exams:', examsResponse.data);
    
    if (examsResponse.data && examsResponse.data.length > 0) {
      const firstExam = examsResponse.data[0];
      console.log('\n2. Testing exam classes endpoint...');
      
      // Get classes for the first exam
      const classesResponse = await axios.get(`${baseUrl}/exam/${firstExam.id}/classes`);
      console.log('Classes:', classesResponse.data);
      
      if (classesResponse.data.success && classesResponse.data.classes.length > 0) {
        const firstClass = classesResponse.data.classes[0];
        console.log('\n3. Testing exam analysis endpoint...');
        
        // Test exam analysis
        const analysisResponse = await axios.get(`${baseUrl}/analytics/exam-analysis/${firstExam.id}/${firstClass.id}`);
        console.log('Analysis:', JSON.stringify(analysisResponse.data, null, 2));
      } else {
        console.log('No classes found for exam');
      }
    } else {
      console.log('No exams found');
    }
  } catch (error) {
    console.error('Error testing exam analysis:', error.response?.data || error.message);
  }
}

testExamAnalysis();
