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
  getRegistrationCountOverTime,
  sendReminderToClass,
  changeStudentPassword,
  verifyStudentPassword,
} = require("../controllers/studentController");

// Register new student
router.post("/register", registerStudent);

// Login student
router.post("/login", loginStudent);

// Change student password
router.post("/change-password", changeStudentPassword);

// Verify old password
router.post("/verify-password", verifyStudentPassword);

// Lists and filters
router.get("/", getAllStudents);
router.get("/class/:class", getStudentsByClass);
router.get("/school/:school", getStudentsBySchool);
router.get("/school/:school/class/:class", getStudentsBySchoolAndClass);
//get registration count over time - MUST be before /:roll route
router.get("/registration-count-over-time", getRegistrationCountOverTime);
// SMS reminder to a class
router.post("/send-reminder", sendReminderToClass);

// Explicit roll route
router.get("/roll/:roll", getStudentByRoll);

// Update/Delete by id
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

// Back-compat (keep last to prevent conflicts)
router.get("/:roll", getStudentByRoll);

module.exports = router;
