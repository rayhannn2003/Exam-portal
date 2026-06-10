/**
 * OMR Scanner Routes
 * Routes for OMR sheet processing integration
 */

const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/verifyAdmin');
const multer = require('multer');
const axios = require('axios');

// OMR Service Configuration
const OMR_SERVICE_URL = process.env.OMR_SERVICE_URL || 'https://omr.daftar-e.com/';
const OMR_API_URL = 'https://omr.daftar-e.com/process-omr';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * Get OMR service health status
 */
router.get('/health', async (req, res) => {
  try {
    const axios = require('axios');
    const response = await axios.get(`${OMR_SERVICE_URL}/health`, { timeout: 5000 });
    
    res.json({
      status: 'healthy',
      omr_service: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('OMR service health check failed:', error.message);
    
    res.status(503).json({
      status: 'unhealthy',
      omr_service: null,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Process OMR sheet using external API (proxy endpoint to avoid CORS)
 */
router.post('/process-omr', upload.single('image'), async (req, res) => {
  try {
    console.log('OMR processing request received');
    console.log('Request details:', {
      hasFile: !!req.file,
      fileSize: req.file?.size,
      fileName: req.file?.originalname,
      fileMimetype: req.file?.mimetype,
      bufferLength: req.file?.buffer?.length
    });
    
    if (!req.file) {
      console.log('No file provided in request');
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Validate file
    if (!req.file.buffer || req.file.buffer.length === 0) {
      console.log('Empty file buffer received');
      return res.status(400).json({
        success: false,
        error: 'Empty image file provided'
      });
    }

    // Create FormData for the external API
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Append the image buffer to form data
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    console.log('Sending request to external OMR API...', {
      url: OMR_API_URL,
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      bufferSize: req.file.buffer.length
    });

    // Make request to external OMR API
    const response = await axios.post(OMR_API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000, // 30 second timeout
    });

    console.log('OMR API response received:', {
      status: response.status,
      dataKeys: Object.keys(response.data || {}),
      success: response.data?.success
    });

    // Return the response from the external API
    res.json(response.data);

  } catch (error) {
    console.error('OMR processing error:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log('External API error response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      res.status(error.response.status).json({
        success: false,
        error: error.response.data?.error || error.response.data?.message || 'OMR processing failed',
        details: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.log('No response received from external API:', {
        code: error.code,
        message: error.message
      });
      res.status(503).json({
        success: false,
        error: 'OMR service is currently unavailable. Please try again later.'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Request setup error:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error during OMR processing',
        details: error.message
      });
    }
  }
});

/**
 * Get answer key for OMR processing
 */
router.get('/answer-key/:examId/:classId', verifyAdmin, async (req, res) => {
  try {
    const { examId, classId } = req.params;
    const pool = require('../models/db');
    
    // Get exam class data
    const classResult = await pool.query(
      'SELECT * FROM exam_class WHERE id = $1 AND exam_id = $2',
      [classId, examId]
    );

    if (classResult.rowCount === 0) {
      return res.status(404).json({ message: 'Exam class not found' });
    }

    const examClass = classResult.rows[0];
    
    res.json({
      exam_id: examId,
      class_id: classId,
      answer_key: examClass.answer_key || {},
      questions: examClass.questions || [],
      class_name: examClass.class_name
    });

  } catch (error) {
    console.error('Error getting answer key:', error.message);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Submit OMR results to the system
 */
router.post('/submit-results', verifyAdmin, async (req, res) => {
  try {
    const { roll_number, answers, exam_id, class_id, submitted_by = 'OMR_Scanner' } = req.body;
    
    // Use your existing result submission logic
    const resultController = require('../controllers/resultController');
    
    // Create a mock request object for the existing submitResult function
    const mockReq = {
      body: {
        roll_number,
        answers,
        submitted_by
      }
    };
    
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          if (code === 201) {
            res.status(201).json({
              message: 'OMR results submitted successfully',
              data: data
            });
          } else {
            res.status(code).json(data);
          }
        }
      })
    };
    
    // Call the existing submitResult function
    await resultController.submitResult(mockReq, mockRes);
    
  } catch (error) {
    console.error('Error submitting OMR results:', error.message);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Get OMR processing statistics
 */
router.get('/stats/:examId/:classId', verifyAdmin, async (req, res) => {
  try {
    const { examId, classId } = req.params;
    const pool = require('../models/db');
    
    // Get statistics about OMR processed results
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_submissions,
        COUNT(CASE WHEN sa.submitted_by = 'OMR_Scanner' THEN 1 END) as omr_submissions,
        AVG(r.percentage) as average_score,
        MAX(r.percentage) as highest_score,
        MIN(r.percentage) as lowest_score
       FROM results r
       JOIN student_answers sa ON sa.student_id = r.student_id AND sa.exam_id = r.exam_id
       WHERE r.exam_id = $1 AND r.class_id = $2`,
      [examId, classId]
    );

    res.json({
      exam_id: examId,
      class_id: classId,
      statistics: statsResult.rows[0]
    });

  } catch (error) {
    console.error('Error getting OMR stats:', error.message);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
