// filepath: /home/rayhan/Documents/exam-portal/backend/routes/result.js
const express = require("express");
const router = express.Router();
const {
  submitResult,
  editSubmittedResult,
  deleteSubmittedResult,
  getResultByStudentRoll,
  getResultByClass,
  getResultBySchool,
} = require("../controllers/resultController");

// Submit answers
router.post("/submit", submitResult);

// Edit submitted answers/result
router.put("/submit", editSubmittedResult);

// Delete submitted result by student and exam
router.delete("/submit/:student_id/:exam_id", deleteSubmittedResult);

// Queries
router.get("/roll/:roll", getResultByStudentRoll);
router.get("/class/:class", getResultByClass);
router.get("/school/:school", getResultBySchool);

module.exports = router;
