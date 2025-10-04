const express = require("express");
const jwt = require("jsonwebtoken");
const {
  createExam,
  addExamClass,
  getExamWithClasses,
  getAllExams,
  editExam,
  editExamClass,
  deleteExam,
  deleteExamClass,
  getFullQuestionPaper,
  getStudentsDetailsWithAnswerKey,
} = require("../controllers/examController.js");

const router = express.Router();

// Minimal verifyAdmin middleware
function verifyAdmin(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    const token = auth.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin" && decoded.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// Create exam (Admin only)
router.post("/", verifyAdmin, createExam);

// Add class to exam (Admin only)
router.post("/:examId/classes", verifyAdmin, addExamClass);

// Edit exam (Admin only)
router.put("/:examId", verifyAdmin, editExam);

// Edit exam class (Admin only)
router.put("/:examId/classes/:classId", verifyAdmin, editExamClass);

// Delete exam class (Admin only)
router.delete("/:examId/classes/:classId", verifyAdmin, deleteExamClass);

// Delete exam (Admin only)
router.delete("/:examId", verifyAdmin, deleteExam);

// Get single exam with classes
router.get("/:examId", getExamWithClasses);

// Get all exams (list)
router.get("/", getAllExams);

// Get full question paper for a class and exam
router.get("/:examId/classes/:classId/full-question-paper", getFullQuestionPaper);

// Get answer key for specific exam and class (for OMR service)
router.get("/:examId/classes/:classId/answer-key", async (req, res) => {
  try {
    const { examId, classId } = req.params;
    const pool = require("../models/db");
    
    const result = await pool.query(
      `SELECT answer_key FROM exam_class WHERE exam_id = $1 AND id = $2`,
      [examId, classId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Answer key not found" });
    }
    
    res.json({ answer_key: result.rows[0].answer_key });
  } catch (err) {
    console.error("Error fetching answer key:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

//get students details with answer key for a student with roll number

router.get("/omr-process-details/:roll_number",getStudentsDetailsWithAnswerKey);

module.exports = router;
