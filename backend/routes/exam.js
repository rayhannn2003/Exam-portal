const express = require("express");
const jwt = require("jsonwebtoken");
const {
  createExam,
  addExamSet,
  getExamWithSets,
  getAllExams,
  editExam,
  editExamSet,
  deleteExam,
  deleteExamSet,
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

// Add set to exam (Admin only)
router.post("/:examId/sets", verifyAdmin, addExamSet);

// Edit exam (Admin only)
router.put("/:examId", verifyAdmin, editExam);

// Edit exam set (Admin only)
router.put("/:examId/sets/:setId", verifyAdmin, editExamSet);

// Delete exam set (Admin only)
router.delete("/:examId/sets/:setId", verifyAdmin, deleteExamSet);

// Delete exam (Admin only)
router.delete("/:examId", verifyAdmin, deleteExam);

// Get single exam with sets
router.get("/:examId", getExamWithSets);

// Get all exams (list)
router.get("/", getAllExams);

module.exports = router;
