/**
 * PDF Generation Controller
 * Handles integration with the Python PDF service
 */

const axios = require('axios');
const pool = require('../models/db');

// PDF Service Configuration
const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'http://localhost:8000';
const PDF_SERVICE_TIMEOUT = parseInt(process.env.PDF_SERVICE_TIMEOUT) || 30000;

/**
 * Generate question paper PDF for an exam set
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateQuestionPaperPDF = async (req, res) => {
  try {
    const { examId, classId } = req.params;
    const { templateType = 'compact_bengali', customization = {} } = req.body;

    // Get exam data
    const examResult = await pool.query(
      'SELECT * FROM exams WHERE id = $1',
      [examId]
    );

    if (examResult.rowCount === 0) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const exam = examResult.rows[0];

    // Get exam class data using the getFullQuestionPaper function logic
    const classResult = await pool.query(
      'SELECT * FROM exam_class WHERE id = $1 AND exam_id = $2',
      [classId, examId]
    );

    if (classResult.rowCount === 0) {
      return res.status(404).json({ message: 'Exam class not found' });
    }

    const examClass = classResult.rows[0];

    // Transform data for PDF service (matching the expected Pydantic model)
    const questions = Array.isArray(examClass.questions) ? examClass.questions : [];
    
    const pdfRequest = {
      exam: {
        id: parseInt(exam.id.replace(/-/g, '').substring(0, 8), 16), // Convert UUID to integer
        title: exam.exam_name,
        class_name: examClass.class_name, // PDF service expects 'class_name'
        class: examClass.class_name || 'Class 8', // Template expects 'class' with fallback
        year: exam.year,
        question_count: exam.question_count,
        created_at: exam.created_at
      },
      exam_set: {
        set_name: examClass.class_name, // PDF service expects 'set_name'
        questions: questions.map(q => ({
          qno: q.qno || questions.indexOf(q) + 1,
          question: q.question || '',
          question_type: 'mcq',
          marks: q.marks || 1,
          options: q.options || { A: '', B: '', C: '', D: '' },
          correct_answer: q.correct_answer || null
        })),
        answer_key: examClass.answer_key || {},
        total_marks: calculateTotalMarks(questions),
        duration_minutes: customization.duration_minutes || 60,
        instructions: customization.instructions
      },
      template_type: templateType,
      customization: {
        paper_size: customization.paper_size || 'A4',
        orientation: customization.orientation || 'portrait',
        font_size: customization.font_size || '10pt',
        margin_type: customization.margin_type || 'normal',
        header_options: {
          show_logo: customization.show_logo !== false,
          show_title: customization.show_title !== false,
          show_class: customization.show_class !== false,
          show_date: customization.show_date !== false,
          show_duration: customization.show_duration !== false,
          show_marks: customization.show_marks !== false,
          show_instructions: customization.show_instructions !== false,
          organization_name: customization.organization_name || 'উত্তর তারাবুনিয়া ছাত্রকল্যাণ সংগঠন',
          logo_url: customization.logo_url
        },
        footer_options: {
          show_page_numbers: customization.show_page_numbers !== false,
          show_instructions: customization.show_footer_instructions !== false,
          custom_text: customization.footer_text
        },
        custom_css: customization.custom_css,
        watermark: customization.watermark,
        show_answer_spaces: customization.show_answer_spaces !== false
      }
    };

    // Call PDF service
    const response = await axios.post(
      `${PDF_SERVICE_URL}/generate-question-paper/download`,
      pdfRequest,
      {
        timeout: PDF_SERVICE_TIMEOUT,
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Set response headers for PDF download
    // Create safe filename without Bengali characters for HTTP header
    const safeClassName = examClass.class_name.replace(/[^\x00-\x7F]/g, '').trim() || 'Class'; // Remove non-ASCII characters
    const filename = `exam_${safeClassName}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', response.data.length);

    // Send PDF data
    res.send(response.data);

  } catch (error) {
    console.error('Error generating PDF:', error.message);
    
    if (error.response) {
      // PDF service error
      return res.status(error.response.status).json({
        message: 'PDF generation failed',
        error: error.response.data
      });
    } else if (error.code === 'ECONNREFUSED') {
      // PDF service not available
      return res.status(503).json({
        message: 'PDF service is not available',
        error: 'Connection refused'
      });
    } else if (error.code === 'ETIMEDOUT') {
      // Timeout error
      return res.status(504).json({
        message: 'PDF generation timed out',
        error: 'Request timeout'
      });
    } else {
      // Other errors
      return res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

/**
 * Generate question paper preview (HTML)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateQuestionPaperPreview = async (req, res) => {
  try {
    const { examId, classId } = req.params;
    
    // Handle both GET and POST requests
    let templateType, customizationParams;
    if (req.method === 'POST') {
      // For POST requests, read from request body
      templateType = req.body.templateType || 'compact_bengali';
      customizationParams = req.body.customization || {};
    } else {
      // For GET requests, read from query parameters
      const queryParams = req.query;
      templateType = queryParams.templateType || 'compact_bengali';
      customizationParams = { ...queryParams };
      delete customizationParams.templateType; // Remove templateType from customization params
    }
    
    // Log the parameters for debugging
    console.log('Preview method:', req.method);
    console.log('Template type:', templateType);
    
    // Build customization object from parameters
    // Handle Bengali characters more robustly
    let organizationName = 'উত্তর তারাবুনিয়া ছাত্রকল্যাণ সংগঠন';
    
    // Try to get the organization name if it exists
    if (customizationParams.organization_name) {
      if (req.method === 'GET') {
        // For GET requests, try to decode URL-encoded Bengali characters
        try {
          organizationName = decodeURIComponent(customizationParams.organization_name);
        } catch (error) {
          // If decoding fails, use the original value or fallback
          organizationName = customizationParams.organization_name || 'উত্তর তারাবুনিয়া ছাত্রকল্যাণ সংগঠন';
        }
      } else {
        // For POST requests, use the value directly (no URL encoding)
        organizationName = customizationParams.organization_name || 'উত্তর তারাবুনিয়া ছাত্রকল্যাণ সংগঠন';
      }
    }
    
    const customization = {
      organization_name: organizationName,
      duration_minutes: parseInt(customizationParams.duration_minutes) || 60,
      show_instructions: customizationParams.show_instructions !== 'false'
    };

    // Get exam data
    const examResult = await pool.query(
      'SELECT * FROM exams WHERE id = $1',
      [examId]
    );

    if (examResult.rowCount === 0) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const exam = examResult.rows[0];

    // Get exam class data
    const classResult = await pool.query(
      'SELECT * FROM exam_class WHERE id = $1 AND exam_id = $2',
      [classId, examId]
    );

    if (classResult.rowCount === 0) {
      return res.status(404).json({ message: 'Exam class not found' });
    }

    const examClass = classResult.rows[0];
    

    // Transform data for PDF service (matching the expected Pydantic model)
    const questions = Array.isArray(examClass.questions) ? examClass.questions : [];
    
    const pdfRequest = {
      exam: {
        id: parseInt(exam.id.replace(/-/g, '').substring(0, 8), 16), // Convert UUID to integer
        title: exam.exam_name,
        class_name: examClass.class_name, // PDF service expects 'class_name'
        class: examClass.class_name || 'Class 8', // Template expects 'class' with fallback
        year: exam.year,
        question_count: exam.question_count,
        created_at: exam.created_at
      },
      exam_set: {
        set_name: examClass.class_name, // Template expects 'set_name'
        questions: questions.map(q => ({
          qno: q.qno || questions.indexOf(q) + 1,
          question: q.question || '',
          question_type: 'mcq',
          marks: q.marks || 1,
          options: q.options || { A: '', B: '', C: '', D: '' },
          correct_answer: q.correct_answer || null
        })),
        answer_key: examClass.answer_key || {},
        total_marks: calculateTotalMarks(questions),
        duration_minutes: customization.duration_minutes || 60
      },
      template_type: templateType,
      customization: {
        paper_size: 'A4',
        orientation: 'portrait',
        font_size: '10pt',
        margin_type: 'normal',
        header_options: {
          organization_name: customization.organization_name || 'উত্তর তারাবুনিয়া ছাত্রকল্যাণ সংগঠন'
        },
        show_answer_spaces: true
      }
    };
    

    // Call PDF service for preview
    const response = await axios.post(
      `${PDF_SERVICE_URL}/preview-question-paper`,
      pdfRequest,
      {
        timeout: PDF_SERVICE_TIMEOUT,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Return HTML preview
    res.setHeader('Content-Type', 'text/html');
    res.send(response.data);

  } catch (error) {
    console.error('Error generating preview:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.response) {
      return res.status(error.response.status).json({
        message: 'Preview generation failed',
        error: error.response.data
      });
    } else {
      return res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

/**
 * Get available PDF templates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAvailableTemplates = async (req, res) => {
  try {
    const response = await axios.get(
      `${PDF_SERVICE_URL}/templates`,
      { timeout: PDF_SERVICE_TIMEOUT }
    );

    res.json(response.data);

  } catch (error) {
    console.error('Error getting templates:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        message: 'Failed to get templates',
        error: error.response.data
      });
    } else {
      return res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

/**
 * Get PDF service health status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPDFServiceHealth = async (req, res) => {
  try {
    const response = await axios.get(
      `${PDF_SERVICE_URL}/health`,
      { timeout: 5000 }
    );

    res.json({
      status: 'healthy',
      pdf_service: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('PDF service health check failed:', error.message);
    
    res.status(503).json({
      status: 'unhealthy',
      pdf_service: null,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get customization options for PDF generation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCustomizationOptions = async (req, res) => {
  try {
    const response = await axios.get(
      `${PDF_SERVICE_URL}/customization-options`,
      { timeout: PDF_SERVICE_TIMEOUT }
    );

    res.json(response.data);

  } catch (error) {
    console.error('Error getting customization options:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        message: 'Failed to get customization options',
        error: error.response.data
      });
    } else {
      return res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

/**
 * Helper function to calculate total marks from questions
 * @param {Array} questions - Array of questions
 * @returns {number} Total marks
 */
function calculateTotalMarks(questions) {
  if (!questions || !Array.isArray(questions)) {
    return 0;
  }
  
  // For the new schema, each question typically counts as 1 mark
  // unless specified otherwise
  return questions.reduce((total, question) => {
    return total + (question.marks || 1);
  }, 0);
}

/**
 * Validate PDF service configuration
 * @returns {Object} Validation result
 */
exports.validatePDFServiceConfig = () => {
  const config = {
    pdf_service_url: PDF_SERVICE_URL,
    timeout: PDF_SERVICE_TIMEOUT,
    status: 'unknown'
  };

  // Test connection
  axios.get(`${PDF_SERVICE_URL}/health`, { timeout: 5000 })
    .then(response => {
      config.status = 'connected';
      config.version = response.data.version;
    })
    .catch(error => {
      config.status = 'disconnected';
      config.error = error.message;
    });

  return config;
};
