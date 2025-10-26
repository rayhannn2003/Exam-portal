/**
 * PDF Generation Routes
 * Routes for PDF question paper generation
 */

const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { verifyAdmin } = require('../middleware/verifyAdmin');

// PDF Generation Routes
router.post('/generate/:examId/:classId', verifyAdmin, pdfController.generateQuestionPaperPDF);
router.get('/preview/:examId/:classId', verifyAdmin, pdfController.generateQuestionPaperPreview);
router.post('/preview/:examId/:classId', verifyAdmin, pdfController.generateQuestionPaperPreview);

// Scholarship PDF Generation Routes
router.post('/scholarship/:class_name', verifyAdmin, pdfController.generateScholarshipPDF);

// Admit Card PDF Generation Routes
router.post('/admit-card', pdfController.generateAdmitCardPDF);

// PDF Service Management Routes
router.get('/templates', verifyAdmin, pdfController.getAvailableTemplates);
router.get('/customization-options', verifyAdmin, pdfController.getCustomizationOptions);
router.get('/health', pdfController.getPDFServiceHealth);
router.get('/config', verifyAdmin, pdfController.validatePDFServiceConfig);

module.exports = router;
