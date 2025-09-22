const express = require("express");
const router = express.Router();
const {
  registerStudent,
  loginStudent,
  getStudentByRoll,
  updateStudent,
  deleteStudent,
  getAllStudents,
  getStudentsByClass,
  getStudentsBySchool,
  getStudentsBySchoolAndClass,
} = require("../controllers/studentController");

// Register new student
router.post("/register", registerStudent);

// Login student
router.post("/login", loginStudent);

// Lists and filters
router.get("/", getAllStudents);
router.get("/class/:class", getStudentsByClass);
router.get("/school/:school", getStudentsBySchool);
router.get("/school/:school/class/:class", getStudentsBySchoolAndClass);

// Update/Delete by id
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

// Explicit roll route
router.get("/roll/:roll", getStudentByRoll);

// Back-compat (keep last to prevent conflicts)
router.get("/:roll", getStudentByRoll);

module.exports = router;
