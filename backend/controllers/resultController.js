const pool = require("../models/db");
// ✅ Submit answers + auto-evaluate (optimized)
exports.submitResult = async (req, res) => {
  try {
    const { roll_number, set_name, answers, submitted_by } = req.body;

    // Step 1: Get student_id, class, exam_id, set_id, answer_key in ONE query
    const dataRes = await pool.query(
      `
      SELECT 
        s.id AS student_id,
        s.class AS student_class,
        e.id AS exam_id,
        es.id AS set_id,
        es.answer_key
      FROM students s
      JOIN exams e ON e.class = s.class
      JOIN exam_sets es ON es.exam_id = e.id AND es.set_name = $2
      WHERE s.roll_number = $1
      LIMIT 1
      `,
      [roll_number, set_name]
    );

    if (dataRes.rowCount === 0) {
      return res.status(400).json({ message: "Invalid student or set" });
    }

    const { student_id, exam_id, set_id, answer_key } = dataRes.rows[0];

    // Step 2: Compare answers
    let correct = 0;
    let wrong = 0;
    Object.entries(answer_key).forEach(([q, correctAns]) => {
      if (answers[q]) {
        if (answers[q] === correctAns) correct++;
        else wrong++;
      }
    });

    const total = Object.keys(answer_key).length;
    const percentage = ((correct / total) * 100).toFixed(2);
    const score = correct - wrong * 0.25; // optional negative marking

    // Step 3: Save student answers
    await pool.query(
      `
      INSERT INTO student_answers (student_id, exam_id, set_id, answers, submitted_by)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (student_id, exam_id) 
      DO UPDATE SET 
        answers = EXCLUDED.answers,
        set_id = EXCLUDED.set_id,
        submitted_by = EXCLUDED.submitted_by,
        submitted_at = NOW()
      `,
      [student_id, exam_id, set_id, answers, submitted_by]
    );

    // Step 4: Save evaluated result
    const resultRes = await pool.query(
      `
      INSERT INTO results (student_id, exam_id, set_id, total_questions, correct, wrong, score, percentage)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (student_id, exam_id)
      DO UPDATE SET
        set_id = EXCLUDED.set_id,
        correct = EXCLUDED.correct,
        wrong = EXCLUDED.wrong,
        score = EXCLUDED.score,
        percentage = EXCLUDED.percentage,
        evaluated_at = NOW()
      RETURNING *
      `,
      [student_id, exam_id, set_id, total, correct, wrong, score, percentage]
    );

    res.status(201).json({
      message: "Result submitted and evaluated successfully",
      result: resultRes.rows[0],
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
      `SELECT s.name, s.roll_number, s.school, s.class, e.title, e.year,r.*, sa.answers as student_answered,es.questions as question_set,es.answer_key as correct_answers
       FROM results r
       JOIN students s ON s.id = r.student_id
       JOIN exams e ON e.id = r.exam_id
       JOIN student_answers sa ON sa.student_id = s.id AND sa.exam_id = e.id AND sa.set_id = r.set_id
       JOIN exam_sets es ON es.id = r.set_id AND es.exam_id = e.id
       WHERE s.roll_number = $1
      `,
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
    const { school } = req.body;
    const result = await pool.query(
      `SELECT r.*, s.name, s.roll_number, s.school, s.class, e.title, e.year
       FROM results r
       JOIN students s ON s.id = r.student_id
       JOIN exams e ON e.id = r.exam_id
       WHERE s.school = $1
       ORDER BY r.score DESC`,
      [school]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching results by school:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 📄 Get results by school and class
exports.getResultBySchoolAndClass = async (req, res) => {
  try {
    const { school, class: cls } = req.params;
    const result = await pool.query(
      `SELECT r.*, s.name, s.roll_number, s.school, s.class, e.title, e.year
       FROM results r
       JOIN students s ON s.id = r.student_id
       JOIN exams e ON e.id = r.exam_id
       WHERE s.school = $1 AND s.class = $2
       ORDER BY r.created_at DESC`,
      [school, cls]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching results by school and class:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
//get results 
exports.getFullResults = async (req, res) => {
  try {
   
    const result = await pool.query(
      `SELECT r.*,s.name,s.roll_number,s.school,s.class,e.title,e.year FROM results r JOIN students s ON s.id = r.student_id JOIN exams e ON e.id = r.exam_id ORDER BY r.score DESC`,
   
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching results:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};