const express = require("express");
const router = express.Router();
const { loginAdmin, getAllStudents, registerAdmin, updateAdmin, deleteAdmin, getAllAdmins, getAdminNameByUsername } = require("../controllers/adminController");
const { verifySuperAdmin } = require("../middleware/verifyAdmin");

router.post("/login", loginAdmin);

// Admin management (by super admin)
router.post("/register", verifySuperAdmin, registerAdmin);
router.put("/admins/:id", verifySuperAdmin, updateAdmin);
router.delete("/admins/:id", verifySuperAdmin, deleteAdmin);
router.get("/admins", verifySuperAdmin, getAllAdmins);

// Student listing from admin
router.get("/students", getAllStudents);

// Get admin name by username
router.get("/name/:username", getAdminNameByUsername);

module.exports = router;
