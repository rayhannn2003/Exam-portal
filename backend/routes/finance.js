const express = require("express");
const {
  getTotalIncome,
  getSchoolWiseIncome,
  getClassWiseIncome,
  getSchoolClassWiseIncome,
  getCollectionByAdminId,
  getAllAdminCollections,
} = require("../controllers/financeController");

const router = express.Router();

// ✅ Total Income
router.get("/total", getTotalIncome);

// ✅ School-wise Income
router.get("/school", getSchoolWiseIncome);

// ✅ Class-wise Income
router.get("/class", getClassWiseIncome);

// ✅ School + Class-wise Income
router.get("/school-class", getSchoolClassWiseIncome);

// ✅ Fee collection by Admin ID
router.get("/collection/:adminId", getCollectionByAdminId);

// ✅ All admin collections
router.get("/admin-collections", getAllAdminCollections);

module.exports = router;
