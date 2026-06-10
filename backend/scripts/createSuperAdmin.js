const bcrypt = require("bcrypt");
const pool = require("../models/db");

async function createSuperAdmin() {
  const username = process.env.SUPERADMIN_USERNAME?.trim();
  const name = process.env.SUPERADMIN_NAME?.trim();
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!username || !name || !password) {
    throw new Error(
      "SUPERADMIN_USERNAME, SUPERADMIN_NAME, and SUPERADMIN_PASSWORD are required"
    );
  }

  if (password.length < 12) {
    throw new Error("SUPERADMIN_PASSWORD must be at least 12 characters");
  }

  const existing = await pool.query(
    "SELECT id FROM admins WHERE username = $1",
    [username]
  );

  if (existing.rowCount > 0) {
    throw new Error(`Admin username already exists: ${username}`);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `INSERT INTO admins (username, name, password, role)
     VALUES ($1, $2, $3, 'superadmin')
     RETURNING id, username, name, role, created_at`,
    [username, name, passwordHash]
  );

  console.log("Created super-admin:", result.rows[0].username);
}

createSuperAdmin()
  .catch((error) => {
    console.error("Failed to create super-admin:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

