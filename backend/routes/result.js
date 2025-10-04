// filepath: /home/rayhan/Documents/exam-portal/backend/routes/result.js
const express = require("express");
const router = express.Router();
const {
  submitResult,
  submitDetailedResult,
  editSubmittedResult,
  deleteSubmittedResult,
  getResultByStudentRoll,
  getResultByClass,
  getResultBySchool,
  getFullResults,
  markForScholarship,
  unmarkForScholarship,
  getScholarshipResults,
} = require("../controllers/resultController");

// Submit answers
router.post("/submit", submitResult);
router.post("/submit-detailed", submitDetailedResult);

// Edit submitted answers/result
router.put("/submit", editSubmittedResult);

// Delete submitted result by student and exam
router.delete("/submit/:student_id/:exam_id", deleteSubmittedResult);
router.get("/full", getFullResults);
// Queries
router.get("/roll/:roll", getResultByStudentRoll);
router.get("/class/:class", getResultByClass);
router.post("/school", getResultBySchool);

//scholarship
router.post("/mark-for-scholarship/:student_id", markForScholarship);
router.post("/unmark-for-scholarship/:student_id", unmarkForScholarship);
router.get("/scholarship-results", getScholarshipResults);

module.exports = router;
