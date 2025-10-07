const pool = require("../models/db");

// Prefix mapping for class values
const CLASS_PREFIX = {
  "6": "61",
  "7": "71",
  "8": "81",
  "9": "91",
  "10": "101"
};

async function generateRoll(classValue) {
  try {
    const prefix = CLASS_PREFIX[classValue];
    if (!prefix) {
      throw new Error(`Invalid class value: ${classValue}`);
    }

    // Get the last roll number for this class
    const result = await pool.query(
      `SELECT roll_number 
       FROM students 
       WHERE class = $1 AND roll_number LIKE $2
       ORDER BY roll_number::BIGINT DESC 
       LIMIT 1`,
      [classValue, `${prefix}%`]
    );

    let newRoll;
    if (result.rows.length === 0) {
      // No students yet in this class → start from first available 5-digit roll
      newRoll = `${prefix}01`.padEnd(5, "0").slice(0, 5);
      // Example: for class 10 → prefix=101 → "10100" → first roll "10101"
      if (newRoll === `${prefix}00`) newRoll = `${prefix}01`;
    } else {
      // Increment last roll
      const lastRoll = parseInt(result.rows[0].roll_number, 10);

      if (isNaN(lastRoll)) {
        console.warn("Invalid last roll number:", result.rows[0].roll_number);
        newRoll = `${prefix}01`.padEnd(5, "0").slice(0, 5);
      } else {
        const nextRoll = lastRoll + 1;

        // Ensure it's 5 digits
        if (String(nextRoll).length > 5) {
          throw new Error(`Cannot generate new roll — limit exceeded for class ${classValue}`);
        }

        newRoll = String(nextRoll).padStart(5, "0");
      }
    }

    console.log(`Generated roll for class ${classValue}: ${newRoll}`);
    return newRoll;

  } catch (err) {
    console.error("Error generating roll:", err.message);
    const fallbackRoll = String(Date.now()).slice(-5);
    console.log("Using fallback roll number:", fallbackRoll);
    return fallbackRoll;
  }
}

module.exports = generateRoll;
