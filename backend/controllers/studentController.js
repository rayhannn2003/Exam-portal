const pool = require("../models/db");
const generateRoll = require("../utils/rollNumberGenerator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
const smsService = require("../utils/smsService");
const StudentActivityService = require("../utils/studentActivityService");

// Register a student
exports.registerStudent = async (req, res) => {
  try {
    const { name, father_name, mother_name, school, email_id, student_class,class_roll, gender, phone, entry_fee ,registered_by} = req.body;
    
    // Validate required fields (only name, school, and class are mandatory)
    if (!name?.trim() || !school?.trim() || !student_class) {
      return res.status(400).json({ error: "Name, School, and Class are required" });
    }
    
    // Validate phone number format only if provided
    if (phone && phone.trim() && (!/^[0-9+\-\s()]+$/.test(phone) || phone.trim().length < 11)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }
    
    // console.log("Generating roll number for class:", student_class);
    const roll_number = await generateRoll(student_class);
    //generate a random 6 digit password and hash it
    const rawPassword = Math.random().toString(36).slice(-6);
    const passwordHash = await bcrypt.hash(rawPassword, 10);
     const payment_status = entry_fee > 0 ? true : false;

    const result = await pool.query(
      `INSERT INTO students (name, father_name, mother_name, school, class, class_roll, email_id, gender, phone, roll_number, payment_status, entry_fee, password, registered_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id, name, father_name, mother_name, school, class, email_id, gender, phone, roll_number, payment_status, entry_fee, created_at `,
      [name, father_name, mother_name, school, student_class, class_roll, email_id, gender, phone, roll_number, payment_status, entry_fee, passwordHash, registered_by]
    );

    // Send SMS only if phone number is provided (fire-and-forget, non-blocking)
    if (phone && phone.trim()) {
      (async () => {
        try {
          await smsService.sendStudentRegistrationSMS({
            to: phone,
            name,
            schoolName: school,
            rollNumber: roll_number,
            password: rawPassword,
            portalUrl: process.env.FRONTEND_URL || process.env.PORTAL_URL,
          });
        } catch (e) {
          console.warn("SMS send failed:", e?.message || e);
        }
      })();
    }

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
    // console.log("Login attempt for roll number:", roll_number);
    const result = await pool.query("SELECT * FROM students WHERE roll_number = $1", [roll_number]);

    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const student = result.rows[0];
    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: student.id, role: "student", roll_number: student.roll_number, name: student.name }, process.env.JWT_SECRET, { expiresIn: "2h" });

    // Log student login activity
    try {
      // await StudentActivityService.logStudentLogin({
      //   studentId: student.id,
      //   rollNumber: student.roll_number,
      //   studentName: student.name,
      //   ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
      //              (req.connection.socket ? req.connection.socket.remoteAddress : null),
      //   userAgent: req.get('User-Agent') || 'Unknown',
      //   deviceInfo: {
      //     platform: req.get('Sec-CH-UA-Platform') || 'Unknown',
      //     mobile: req.get('Sec-CH-UA-Mobile') === '?1',
      //     timestamp: new Date().toISOString()
      //   }
      // });
      // console.log("Logging student login activity for student ID:", student.id);
      // Also log to user_activity table for SuperAdmin tracking
      await pool.query(
        `INSERT INTO login_events (
           user_id, role, identifier, name, ip_address, user_agent, platform, is_mobile
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          student.id,
          'student',
          student.roll_number,
          student.name,
          req.ip || req.connection.remoteAddress || 'Unknown',
          req.get('User-Agent') || 'Unknown',
          req.get('Sec-CH-UA-Platform') || 'Unknown',
          req.get('Sec-CH-UA-Mobile') === '?1'
        ]
      );
    } catch (logError) {
      console.error("❌ Error logging student activity:", logError);
      // Don't fail login if logging fails
    }

    res.json({ 
      message: "Login successful", 
      token,
      student: {
        id: student.id,
        name: student.name,
        roll_number: student.roll_number,
        class: student.class,
        school: student.school
      }
    });
  } catch (err) {
    console.error("❌ Error logging in student:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Change student password (by roll_number)
exports.changeStudentPassword = async (req, res) => {
  try {
    const { roll_number, old_password, new_password } = req.body;
    if (!roll_number || !old_password || !new_password) {
      return res.status(400).json({ error: "roll_number, old_password, new_password are required" });
    }

    const result = await pool.query("SELECT id, password FROM students WHERE roll_number = $1", [roll_number]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Student not found" });

    const student = result.rows[0];
    const isMatch = await bcrypt.compare(old_password, student.password);
    if (!isMatch) return res.status(401).json({ error: "Old password is incorrect" });

    const newHash = await bcrypt.hash(new_password, 10);
    await pool.query("UPDATE students SET password = $1 WHERE id = $2", [newHash, student.id]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Error changing password:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Verify student's old password correctness (pre-check)
exports.verifyStudentPassword = async (req, res) => {
  try {
    const { roll_number, old_password } = req.body;
    if (!roll_number || !old_password) {
      return res.status(400).json({ error: "roll_number এবং পুরনো পাসওয়ার্ড প্রয়োজন" });
    }
    const result = await pool.query("SELECT id, password FROM students WHERE roll_number = $1", [roll_number]);
    if (result.rowCount === 0) return res.status(404).json({ error: "ছাত্র পাওয়া যায়নি" });
    const student = result.rows[0];
    const isMatch = await bcrypt.compare(old_password, student.password);
    if (!isMatch) return res.status(401).json({ error: "পুরনো পাসওয়ার্ড সঠিক নয়" });
    return res.json({ valid: true, message: "পাসওয়ার্ড যাচাই সফল" });
  } catch (err) {
    console.error("❌ Error verifying student password:", err);
    res.status(500).json({ error: "সার্ভার ত্রুটি" });
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
    const updatable = ["name", "school", "email_id", "gender", "payment_status", "entry_fee"];
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

// Send reminder SMS to all students of a class
exports.sendReminderToClass = async (req, res) => {
  try {
    const { class: cls, message } = req.body;
    if (!cls) {
      return res.status(400).json({ message: "Missing required field: class" });
    }

    // Fetch students with valid phone numbers for the class
    const result = await pool.query(
      `SELECT name, school, roll_number, phone FROM students WHERE class = $1 AND phone IS NOT NULL`,
      [cls]
    );

    const students = result.rows || [];
    if (students.length === 0) {
      return res.status(200).json({ message: "No students found for this class", total: 0, success: 0, failed: 0 });
    }

    const defaultTemplate =
      "Dear Student, your UTCKS Scholarship Exam is tomorrow at 11 AM. Roll: {ROLL}. Please be present by 10:30 AM and bring your admit card. Best of luck!";
    const template = message && message.trim() ? message.trim() : defaultTemplate;

    // Build personalized messages with roll number
    const messages = students.map((s) => {
      let personalized = template;
      if (personalized.includes("{ROLL}")) {
        personalized = personalized.replace(/\{ROLL\}/g, String(s.roll_number));
      } else {
        personalized = `${template} Roll: ${s.roll_number}.`;
      }
      return { to: s.phone, message: personalized };
    });

    const smsResult = await smsService.sendBulkDifferentMessages(messages);

    res.json({
      message: "Reminder SMS processed",
      total: messages.length,
      success: smsResult?.success ? messages.length : 0,
      failed: smsResult?.success ? 0 : messages.length,
      results: [smsResult],
    });
  } catch (err) {
    console.error("❌ Error sending reminder SMS:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
