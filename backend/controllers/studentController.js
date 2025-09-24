const pool = require("../models/db");
const generateRoll = require("../utils/rollNumberGenerator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");

// Register a student
exports.registerStudent = async (req, res) => {
  try {
    const { name, father_name, mother_name, school, email_id, student_class,class_roll, gender, phone, entry_fee ,registered_by} = req.body;
    if (!name || !school || !student_class || !phone || !entry_fee) {
      return res.status(400).json({ error: "All required fields are needed" });
    }
    console.log("Generating roll number...");
    const roll_number = await generateRoll();
    //generate a random 6 digit password and hash it
    const rawPassword = Math.random().toString(36).slice(-6);
    const passwordHash = await bcrypt.hash(rawPassword, 10);
     const payment_status = entry_fee > 0 ? true : false;

    const result = await pool.query(
      `INSERT INTO students (name, father_name, mother_name, school, class, class_roll, email_id, gender, phone, roll_number, payment_status, entry_fee, password, registered_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id, name, father_name, mother_name, school, class, email_id, gender, phone, roll_number, payment_status, entry_fee, created_at `,
      [name, father_name, mother_name, school, student_class, class_roll, email_id, gender, phone, roll_number, payment_status, entry_fee, passwordHash, registered_by]
    );

    res.status(201).json({ message: "Student registered", student: result.rows[0], temp_password: rawPassword });
  } catch (err) {
    console.error("❌ Error registering student:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// login student with roll number and password
exports.loginStudent = async (req, res) => {
  try {
    const { roll_number, password } = req.body;
    const result = await pool.query("SELECT * FROM students WHERE roll_number = $1", [roll_number]);

    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const student = result.rows[0];
    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: student.id, role: "student" }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("❌ Error logging in student:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get student by roll number 
exports.getStudentByRoll = async (req, res) => {
  try {
    const { roll } = req.params;
    const result = await pool.query("SELECT * FROM students WHERE roll_number = $1", [roll]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching student:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update student by id
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updatable = ["name", "school", "class", "email_id", "gender", "phone", "payment_status", "entry_fee"];
    const entries = Object.entries(req.body).filter(([k]) => updatable.includes(k));

    if (entries.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const setSql = entries.map(([k], i) => `${k} = $${i + 2}`).join(", ");
    const values = [id, ...entries.map(([, v]) => v)];

    const result = await pool.query(
      `UPDATE students SET ${setSql} WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rowCount === 0) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student updated", student: result.rows[0] });
  } catch (err) {
    console.error("❌ Error updating student:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete student by id
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // optional: clean up dependent data
    await pool.query("DELETE FROM student_answers WHERE student_id = $1", [id]);
    await pool.query("DELETE FROM results WHERE student_id = $1", [id]);

    const result = await pool.query("DELETE FROM students WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted" });
  } catch (err) {
    console.error("❌ Error deleting student:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all students
exports.getAllStudents = async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM students ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get students by class
exports.getStudentsByClass = async (req, res) => {
  try {
    const { class: cls } = req.params;
    const result = await pool.query("SELECT * FROM students WHERE class = $1 ORDER BY created_at DESC", [cls]);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching students by class:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get students by school
exports.getStudentsBySchool = async (req, res) => {
  try {
    const { school } = req.params;
    const result = await pool.query("SELECT * FROM students WHERE school = $1 ORDER BY created_at DESC", [school]);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching students by school:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get students by school and class
exports.getStudentsBySchoolAndClass = async (req, res) => {
  try {
    const { school, class: cls } = req.params;
    const result = await pool.query(
      "SELECT * FROM students WHERE school = $1 AND class = $2 ORDER BY created_at DESC",
      [school, cls]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching students by school and class:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


exports.getRegistrationCountOverTime = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DATE(created_at) AS registration_date, COUNT(*) AS registration_count
      FROM students
      GROUP BY registration_date
      ORDER BY registration_date
    `);

    // Convert UTC → Dhaka
    const formatted = result.rows.map(r => ({
      registration_date: moment(r.registration_date)
        .tz("Asia/Dhaka")
        .format("YYYY-MM-DD"),
      registration_count: r.registration_count
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching registrations over time:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
