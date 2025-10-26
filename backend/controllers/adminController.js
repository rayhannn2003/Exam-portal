const pool = require("../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Admin login
exports.loginAdmin = async (req, res) => {
  try {
    console.log("Request body:", req.body); // Debugging line
    const { username, password } = req.body;
    const result = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);

    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "2h" });

    // Log admin login activity for user tracking
    try {
      await pool.query(
        `INSERT INTO login_events (
           user_id, role, identifier, name, ip_address, user_agent, platform, is_mobile
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          admin.id,
          admin.role,
          admin.username,
          admin.name || admin.username,
          req.ip || req.connection.remoteAddress || 'Unknown',
          req.get('User-Agent') || 'Unknown',
          req.get('Sec-CH-UA-Platform') || 'Unknown',
          req.get('Sec-CH-UA-Mobile') === '?1'
        ]
      );
    } catch (logError) {
      console.error("❌ Error logging admin activity:", logError);
      // Don't fail login if logging fails
    }

    res.json({ message: "Login successful", token ,admin});
  } catch (err) {
    console.error("❌ Error logging in admin:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM students ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Register admin (by super admin)
exports.registerAdmin = async (req, res) => {
  try {
    const { username, name, password, role = "admin" } = req.body;
    if (!username || !name || !password) return res.status(400).json({ error: "Username, name and password are required" });

    // Validate role - must be 'admin' or 'superadmin' (no underscore)
    const validRoles = ['admin', 'superadmin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
    }

    const exists = await pool.query("SELECT 1 FROM admins WHERE username = $1", [username]);
    if (exists.rowCount > 0) return res.status(400).json({ error: "Username already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO admins (username, name, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, name, role, created_at",
      [username, name, passwordHash, role]
    );
    res.status(201).json({ message: "Admin created", admin: result.rows[0] });
  } catch (err) {
    console.error("❌ Error registering admin:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update admin
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, name, password, role } = req.body;

    // Validate role if provided
    if (typeof role === "string") {
      const validRoles = ['admin', 'superadmin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          error: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
        });
      }
    }

    const fields = [];
    const values = [id];
    let idx = 2;

    if (username) {
      fields.push(`username = $${idx++}`);
      values.push(username);
    }
    if (name) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }
    if (typeof role === "string") {
      fields.push(`role = $${idx++}`);
      values.push(role);
    }
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      fields.push(`password = $${idx++}`);
      values.push(passwordHash);
    }

    if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });

    const result = await pool.query(
      `UPDATE admins SET ${fields.join(", ")} WHERE id = $1 RETURNING id, username, name, role, created_at`,
      values
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Admin not found" });
    res.json({ message: "Admin updated", admin: result.rows[0] });
  } catch (err) {
    console.error("❌ Error updating admin:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete admin
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM admins WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Admin not found" });
    res.json({ message: "Admin deleted" });
  } catch (err) {
    console.error("❌ Error deleting admin:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all admins
exports.getAllAdmins = async (_req, res) => {
  try {
    const result = await pool.query("SELECT id,name, username, role, created_at FROM admins ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching admins:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// get Admin name by username
exports.getAdminNameByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const result = await pool.query("SELECT name FROM admins WHERE username = $1", [username]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching admin name:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};