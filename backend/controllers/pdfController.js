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
    const { examId, setId } = req.params;
    const { templateType = 'default', customization = {} } = req.body;

    // Get exam data
    const examResult = await pool.query(
      'SELECT * FROM exams WHERE id = $1',
      [examId]
    );

    if (examResult.rowCount === 0) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const exam = examResult.rows[0];

    // Get exam set data
    const setResult = await pool.query(
      'SELECT * FROM exam_sets WHERE id = $1 AND exam_id = $2',
      [setId, examId]
    );

    if (setResult.rowCount === 0) {
      return res.status(404).json({ message: 'Exam set not found' });
    }

    const examSet = setResult.rows[0];

    // Transform data for PDF service
    const pdfRequest = {
      exam: {
        id: exam.id,
        title: exam.title,
        class_name: exam.class,
        year: exam.year,
        question_count: exam.question_count,
        created_at: exam.created_at
      },
      exam_set: {
        set_name: examSet.set_name,
        questions: examSet.questions,
        answer_key: examSet.answer_key,
        total_marks: calculateTotalMarks(examSet.questions),
        duration_minutes: customization.duration_minutes || 180,
        instructions: customization.instructions
      },
      template_type: templateType,
      customization: {
        paper_size: customization.paper_size || 'A4',
        orientation: customization.orientation || 'portrait',
        font_size: customization.font_size || '12pt',
        margin_type: customization.margin_type || 'normal',
        header_options: {
          show_logo: customization.show_logo !== false,
          show_title: customization.show_title !== false,
          show_class: customization.show_class !== false,
          show_date: customization.show_date !== false,
          show_duration: customization.show_duration !== false,
          show_marks: customization.show_marks !== false,
          show_instructions: customization.show_instructions !== false,
          organization_name: customization.organization_name,
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
    const filename = `${exam.title}_${examSet.set_name}_${new Date().toISOString().split('T')[0]}.pdf`;
    
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
    const { examId, setId } = req.params;
    const { templateType = 'default', customization = {} } = req.query;

    // Get exam data
    const examResult = await pool.query(
      'SELECT * FROM exams WHERE id = $1',
      [examId]
    );

    if (examResult.rowCount === 0) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const exam = examResult.rows[0];

    // Get exam set data
    const setResult = await pool.query(
      'SELECT * FROM exam_sets WHERE id = $1 AND exam_id = $2',
      [setId, examId]
    );

    if (setResult.rowCount === 0) {
      return res.status(404).json({ message: 'Exam set not found' });
    }

    const examSet = setResult.rows[0];

    // Transform data for PDF service
    const pdfRequest = {
      exam: {
        id: exam.id,
        title: exam.title,
        class_name: exam.class,
        year: exam.year,
        question_count: exam.question_count,
        created_at: exam.created_at
      },
      exam_set: {
        set_name: examSet.set_name,
        questions: examSet.questions,
        answer_key: examSet.answer_key,
        total_marks: calculateTotalMarks(examSet.questions),
        duration_minutes: 180
      },
      template_type: templateType,
      customization: {
        paper_size: 'A4',
        orientation: 'portrait',
        font_size: '12pt',
        margin_type: 'normal',
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
  
  return questions.reduce((total, question) => {
    return total + (question.marks || 0);
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
