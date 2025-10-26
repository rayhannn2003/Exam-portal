/**
 * Student Analytics Routes
 * Routes for viewing student activity statistics
 */

const express = require('express');
const router = express.Router();
const StudentActivityService = require('../utils/studentActivityService');
const { verifyAdmin } = require('../middleware/verifyAdmin');

// Get student login statistics
router.get('/login-stats', verifyAdmin, async (req, res) => {
  try {
    const { startDate, endDate, rollNumber, limit } = req.query;
    
    const options = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      rollNumber,
      limit: parseInt(limit) || 100
    };
    
    const stats = await StudentActivityService.getLoginStats(options);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching login stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get PDF download statistics
router.get('/pdf-stats', verifyAdmin, async (req, res) => {
  try {
    const { startDate, endDate, pdfType, rollNumber, limit } = req.query;
    
    const options = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      pdfType,
      rollNumber,
      limit: parseInt(limit) || 100
    };
    
    const stats = await StudentActivityService.getPDFDownloadStats(options);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching PDF stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get daily analytics summary
router.get('/daily-summary', verifyAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const options = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    };
    
    const summary = await StudentActivityService.getDailyAnalytics(options);
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get activity overview (dashboard summary)
router.get('/overview', verifyAdmin, async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get various statistics
    const [
      todayLogins,
      weekLogins,
      todayDownloads,
      weekDownloads,
      topDownloadTypes,
      recentActivity
    ] = await Promise.all([
      // Today's login count
      StudentActivityService.getLoginStats({
        startDate: new Date(today.toDateString()),
        endDate: today
      }),
      
      // Last 7 days login count
      StudentActivityService.getLoginStats({
        startDate: sevenDaysAgo,
        endDate: today
      }),
      
      // Today's download count
      StudentActivityService.getPDFDownloadStats({
        startDate: new Date(today.toDateString()),
        endDate: today
      }),
      
      // Last 7 days download count
      StudentActivityService.getPDFDownloadStats({
        startDate: sevenDaysAgo,
        endDate: today
      }),
      
      // Top PDF download types (last 30 days)
      StudentActivityService.getPDFDownloadStats({
        startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: today,
        limit: 100
      }),
      
      // Recent activity (last 20 entries)
      StudentActivityService.getLoginStats({
        limit: 20
      })
    ]);
    
    // Process top download types
    const downloadTypeCounts = {};
    if (topDownloadTypes && topDownloadTypes.length) {
      topDownloadTypes.forEach(download => {
        downloadTypeCounts[download.pdf_type] = (downloadTypeCounts[download.pdf_type] || 0) + 1;
      });
    }
    
    const overview = {
      todayStats: {
        logins: todayLogins ? todayLogins.length : 0,
        downloads: todayDownloads ? todayDownloads.length : 0
      },
      weekStats: {
        logins: weekLogins ? weekLogins.length : 0,
        downloads: weekDownloads ? weekDownloads.length : 0
      },
      downloadTypes: downloadTypeCounts,
      recentActivity: recentActivity ? recentActivity.slice(0, 10) : []
    };
    
    res.json({ success: true, data: overview });
  } catch (error) {
    console.error('Error fetching activity overview:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get exam analysis statistics
router.get('/exam-analysis/:examId/:classId', verifyAdmin, async (req, res) => {
  try {
    const { examId, classId } = req.params;
    
    if (!examId || !classId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Exam ID and Class ID are required' 
      });
    }

    const db = require('../models/db');
    
    const query = `
      WITH question_keys AS (
          SELECT
              ec.id AS class_id,
              (q->>'qno')::INT AS question_no,
              q->>'question' AS question_text,
              q->'options' AS options,
              ec.answer_key ->> (q->>'qno') AS correct_answer
          FROM exam_class ec,
               jsonb_array_elements(ec.questions) AS q
          WHERE ec.exam_id = $1
            AND ec.id = $2
      ),
      student_data AS (
          SELECT
              sa.student_id,
              sa.class_id,
              (key)::INT AS question_no,
              value AS chosen_answer
          FROM student_answers sa,
               jsonb_each_text(sa.answers)
          WHERE sa.exam_id = $1
            AND sa.class_id = $2
      )
      SELECT
          q.question_no,
          q.question_text,
          q.correct_answer,
          q.options,
          COUNT(s.student_id) AS total_attempted,
          COUNT(*) FILTER (WHERE s.chosen_answer = q.correct_answer) AS correct_count,
          COUNT(*) FILTER (WHERE s.chosen_answer IS NOT NULL AND s.chosen_answer <> q.correct_answer) AS incorrect_count,
          ROUND(
              (COUNT(*) FILTER (WHERE s.chosen_answer = q.correct_answer)::decimal /
               NULLIF(COUNT(s.student_id), 0)) * 100, 2
          ) AS accuracy_percent
      FROM question_keys q
      LEFT JOIN student_data s
        ON q.class_id = s.class_id
       AND q.question_no = s.question_no
      GROUP BY q.question_no, q.question_text, q.correct_answer, q.options
      ORDER BY q.question_no;
    `;
    
    const result = await db.query(query, [examId, classId]);
    
    // Get exam and class information
    const examInfoQuery = `
      SELECT 
        e.exam_name,
        e.year,
        ec.class_name
      FROM exams e
      JOIN exam_class ec ON e.id = ec.exam_id
      WHERE e.id = $1 AND ec.id = $2
    `;
    
    const examInfo = await db.query(examInfoQuery, [examId, classId]);
    
    res.json({ 
      success: true, 
      data: {
        examInfo: examInfo.rows[0] || {},
        questions: result.rows.map(row => ({
          questionNo: parseInt(row.question_no),
          questionText: row.question_text,
          correctAnswer: row.correct_answer,
          options: row.options,
          totalAttempted: parseInt(row.total_attempted),
          correctCount: parseInt(row.correct_count),
          incorrectCount: parseInt(row.incorrect_count),
          accuracyPercent: parseFloat(row.accuracy_percent) || 0
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching exam analysis:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update daily analytics (manual trigger)
router.post('/update-analytics', verifyAdmin, async (req, res) => {
  try {
    const { date } = req.body;
    await StudentActivityService.updateDailyAnalytics(date ? new Date(date) : undefined);
    res.json({ success: true, message: 'Daily analytics updated successfully' });
  } catch (error) {
    console.error('Error updating daily analytics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
