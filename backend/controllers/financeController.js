const pool = require("../models/db");

// ✅ Total income
exports.getTotalIncome = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COALESCE(SUM(entry_fee), 0) AS total_income FROM students"
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching total income:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ School-wise income
exports.getSchoolWiseIncome = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT school, COALESCE(SUM(entry_fee), 0) AS income
       FROM students
       GROUP BY school
       ORDER BY income DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching school-wise income:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Class-wise income
exports.getClassWiseIncome = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT class, COALESCE(SUM(entry_fee), 0) AS income
       FROM students
       GROUP BY class
       ORDER BY class`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching class-wise income:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ School + Class-wise income
exports.getSchoolClassWiseIncome = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT school, class, COALESCE(SUM(entry_fee), 0) AS income
       FROM students
       GROUP BY school, class
       ORDER BY school, class`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching school+class-wise income:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Fee collection by Admin ID
exports.getCollectionByAdminId = async (req, res) => {
  try {
    const { adminId } = req.params;

    const result = await pool.query(
      `SELECT a.id AS admin_id, 
              a.name AS admin_name, 
              a.username AS admin_username,
              COALESCE(SUM(s.entry_fee), 0) AS total_income,
              COUNT(s.id) AS total_students
       FROM admins a
       LEFT JOIN students s ON s.registered_by = a.id
       WHERE a.id = $1
       GROUP BY a.id, a.username, a.name`,
      [adminId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Admin not found or no collection" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching collection by admin:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ All admin collections
exports.getAllAdminCollections = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.id AS admin_id, 
              a.name AS admin_name, 
              a.username AS admin_username,
              COALESCE(SUM(s.entry_fee), 0) AS total_income,
              COUNT(s.id) AS total_students
       FROM admins a
       LEFT JOIN students s ON s.registered_by = a.id
       GROUP BY a.id, a.username, a.name
       ORDER BY total_income DESC`
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching all admin collections:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
