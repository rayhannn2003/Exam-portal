/**
 * PDF Generation Routes
 * Routes for PDF question paper generation
 */

const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { verifyAdmin } = require('../middleware/verifyAdmin');

// PDF Generation Routes
router.post('/generate/:examId/:setId', verifyAdmin, pdfController.generateQuestionPaperPDF);
router.get('/preview/:examId/:setId', verifyAdmin, pdfController.generateQuestionPaperPreview);

// PDF Service Management Routes
router.get('/templates', verifyAdmin, pdfController.getAvailableTemplates);
router.get('/customization-options', verifyAdmin, pdfController.getCustomizationOptions);
router.get('/health', pdfController.getPDFServiceHealth);
router.get('/config', verifyAdmin, pdfController.validatePDFServiceConfig);

module.exports = router;
