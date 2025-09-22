import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../db.js"; // your Postgres connection

// SECRET for JWT
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Search in both tables (students + admins)
    let user = null;
    let role = null;

    // Check in students
    const studentRes = await pool.query("SELECT * FROM students WHERE username=$1", [username]);
    if (studentRes.rows.length > 0) {
      user = studentRes.rows[0];
      role = "student";
    }

    // Check in admins if not found
    if (!user) {
      const adminRes = await pool.query("SELECT * FROM admins WHERE username=$1", [username]);
      if (adminRes.rows.length > 0) {
        user = adminRes.rows[0];
        role = "admin";
      }
    }

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user.id, role }, 
      JWT_SECRET, 
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role,
      username: user.username
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
