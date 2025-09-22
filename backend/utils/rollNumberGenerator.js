const pool = require("../models/db");


async function generateRoll() {
  try {
    // Get the last roll number from all students
    const result = await pool.query(
      `SELECT roll_number 
       FROM students 
       ORDER BY roll_number DESC 
       LIMIT 1`
    );

    let newRoll;

    if (result.rows.length === 0) {
      // First roll overall
      newRoll = "10001";
    } else {
      // Increment last roll number
      const lastRoll = parseInt(result.rows[0].roll_number, 10);
      newRoll = String(lastRoll + 1).padStart(5, "1");
      console.log("Last Roll:", lastRoll, "New Roll:", newRoll);
    }

    return newRoll;
  } catch (err) {
    console.error("Error generating roll:", err);
    throw err;
  }
}
module.exports = generateRoll;