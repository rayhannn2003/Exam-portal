const pool = require("../models/db");

// Helper function to clean up invalid roll numbers
async function cleanupInvalidRollNumbers() {
  try {
    // Find and update any roll numbers that are not numeric
    const result = await pool.query(
      `UPDATE students 
       SET roll_number = '10000' || id::text
       WHERE roll_number !~ '^[0-9]+$' OR roll_number IS NULL
       RETURNING id, roll_number`
    );
    
    if (result.rows.length > 0) {
      console.log("Cleaned up invalid roll numbers:", result.rows);
    }
  } catch (err) {
    console.error("Error cleaning up invalid roll numbers:", err);
  }
}

async function generateRoll() {
  try {
    // Clean up any existing invalid roll numbers first
    try {
      await cleanupInvalidRollNumbers();
    } catch (cleanupErr) {
      console.warn("Warning: Could not cleanup invalid roll numbers:", cleanupErr.message);
    }
    
    let newRoll;
    let attempts = 0;
    const maxAttempts = 10;

    do {
    // Get the last roll number from all students
    const result = await pool.query(
      `SELECT roll_number 
       FROM students 
       ORDER BY roll_number DESC 
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      // First roll overall
      newRoll = "10001";
    } else {
      // Increment last roll number
      const lastRoll = parseInt(result.rows[0].roll_number, 10);
        
        // Check if lastRoll is a valid number
        if (isNaN(lastRoll)) {
          console.error("Invalid roll number found in database:", result.rows[0].roll_number);
          // If the last roll number is invalid, start from 10001
          newRoll = "10001";
        } else {
          newRoll = String(lastRoll + 1 + attempts).padStart(5, "0");
        }
      }
      
      console.log("Attempt", attempts + 1, "- Last Roll:", result.rows[0]?.roll_number, "New Roll:", newRoll);

      // Check if this roll number already exists
      const checkResult = await pool.query(
        `SELECT roll_number FROM students WHERE roll_number = $1`,
        [newRoll]
      );

      if (checkResult.rows.length === 0) {
        // Roll number is unique, break the loop
        break;
      } else {
        // Roll number exists, try again
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error("Unable to generate unique roll number after maximum attempts");
        }
      }
    } while (attempts < maxAttempts);

    return newRoll;
  } catch (err) {
    console.error("Error generating roll:", err);
    // Fallback: generate a simple roll number based on timestamp
    const fallbackRoll = String(Date.now()).slice(-5);
    console.log("Using fallback roll number:", fallbackRoll);
    return fallbackRoll;
  }
}
module.exports = generateRoll;