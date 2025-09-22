const pool = require("../models/db");

// ✅ Submit answers + auto-evaluate
exports.submitResult = async (req, res) => {
  try {
    const { student_id, exam_id, set_id, answers } = req.body;

    // fetch answer key
    const keyRes = await pool.query(
      "SELECT answer_key FROM exam_sets WHERE id = $1 AND exam_id = $2",
      [set_id, exam_id]
    );
    if (keyRes.rowCount === 0) {
      return res.status(400).json({ message: "Invalid exam/set" });
    }
    const answerKey = keyRes.rows[0].answer_key;

    // compare answers
    let correct = 0;
    let wrong = 0;
    Object.entries(answerKey).forEach(([q, correctAns]) => {
      if (answers[q]) {
        if (answers[q] === correctAns) correct++;
        else wrong++;
      }
    });

    const total = Object.keys(answerKey).length;
    const percentage = ((correct / total) * 100).toFixed(2);

    // save student answers (optional for audit)
    await pool.query(
      `INSERT INTO student_answers (student_id, exam_id, set_id, answers)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id, exam_id) DO UPDATE SET answers = EXCLUDED.answers`,
      [student_id, exam_id, set_id, answers]
    );

    // save results
    const result = await pool.query(
      `INSERT INTO results (student_id, exam_id, set_id, total_questions, correct, wrong, score, percentage)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (student_id, exam_id) DO UPDATE
       SET correct = EXCLUDED.correct, wrong = EXCLUDED.wrong, score = EXCLUDED.score, percentage = EXCLUDED.percentage
       RETURNING *`,
      [student_id, exam_id, set_id, total, correct, wrong, correct, percentage]
    );

    res.status(201).json({
      message: "Result submitted and evaluated successfully",
      result: result.rows[0],
    });
  } catch (err) {
    console.error("Error submitting result:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✏️ Edit submitted result (re-evaluate with new answers)
exports.editSubmittedResult = async (req, res) => {
  try {
    const { student_id, exam_id, set_id, answers } = req.body;

    const keyRes = await pool.query(
      "SELECT answer_key FROM exam_sets WHERE id = $1 AND exam_id = $2",
      [set_id, exam_id]
    );
    if (keyRes.rowCount === 0) return res.status(400).json({ message: "Invalid exam/set" });

    const answerKey = keyRes.rows[0].answer_key;

    let correct = 0;
    let wrong = 0;
    Object.entries(answerKey).forEach(([q, correctAns]) => {
      if (answers[q]) {
        if (answers[q] === correctAns) correct++;
        else wrong++;
      }
    });

    const total = Object.keys(answerKey).length;
    const percentage = ((correct / total) * 100).toFixed(2);

    await pool.query(
      `UPDATE student_answers SET answers = $4 WHERE student_id = $1 AND exam_id = $2 AND set_id = $3`,
      [student_id, exam_id, set_id, answers]
    );

    const result = await pool.query(
      `UPDATE results SET total_questions=$4, correct=$5, wrong=$6, score=$7, percentage=$8
       WHERE student_id=$1 AND exam_id=$2 AND set_id=$3 RETURNING *`,
      [student_id, exam_id, set_id, total, correct, wrong, correct, percentage]
    );

    if (result.rowCount === 0) return res.status(404).json({ message: "Result not found" });

    res.json({ message: "Result updated", result: result.rows[0] });
  } catch (err) {
    console.error("Error editing result:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 🗑️ Delete submitted result
exports.deleteSubmittedResult = async (req, res) => {
  const client = await pool.connect();
  try {
    const { student_id, exam_id } = req.params;
    await client.query("BEGIN");
    await client.query("DELETE FROM student_answers WHERE student_id=$1 AND exam_id=$2", [student_id, exam_id]);
    const del = await client.query("DELETE FROM results WHERE student_id=$1 AND exam_id=$2 RETURNING id", [student_id, exam_id]);
    if (del.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Result not found" });
    }
    await client.query("COMMIT");
    res.json({ message: "Result deleted" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error deleting result:", err.message);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// 📄 Get result by student roll
exports.getResultByStudentRoll = async (req, res) => {
  try {
    const { roll } = req.params;
    const result = await pool.query(
      `SELECT r.*, s.name, s.roll_number, s.school, s.class, e.title, e.year
       FROM results r
       JOIN students s ON s.id = r.student_id
       JOIN exams e ON e.id = r.exam_id
       WHERE s.roll_number = $1
       ORDER BY r.created_at DESC`,
      [roll]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching results by roll:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 📄 Get results by class
exports.getResultByClass = async (req, res) => {
  try {
    const { class: cls } = req.params;
    const result = await pool.query(
      `SELECT r.*, s.name, s.roll_number, s.school, s.class, e.title, e.year
       FROM results r
       JOIN students s ON s.id = r.student_id
       JOIN exams e ON e.id = r.exam_id
       WHERE s.class = $1
       ORDER BY r.created_at DESC`,
      [cls]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching results by class:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 📄 Get results by school
exports.getResultBySchool = async (req, res) => {
  try {
    const { school } = req.params;
    const result = await pool.query(
      `SELECT r.*, s.name, s.roll_number, s.school, s.class, e.title, e.year
       FROM results r
       JOIN students s ON s.id = r.student_id
       JOIN exams e ON e.id = r.exam_id
       WHERE s.school = $1
       ORDER BY r.created_at DESC`,
      [school]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching results by school:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
