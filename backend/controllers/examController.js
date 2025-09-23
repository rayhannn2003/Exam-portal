const pool = require("../models/db");

// ✅ Create exam
exports.createExam = async (req, res) => {
  try {
    const { class: examClass, title,question_count, year } = req.body;

    if (!examClass || !title || !year) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO exams (class, title, question_count, year)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [examClass, title, question_count, year]
    );

    res.status(201).json({
      message: "Exam created successfully",
      exam: result.rows[0],
    });
  } catch (err) {
    console.error("Error creating exam:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Add exam set
exports.addExamSet = async (req, res) => {
  try {
    const { examId } = req.params;
    const { set_name, answer_key, questions } = req.body;

    if (!set_name || !answer_key || !questions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO exam_sets (exam_id, set_name, questions, answer_key)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (exam_id, set_name) 
       DO UPDATE SET 
         questions = EXCLUDED.questions,
         answer_key = EXCLUDED.answer_key,
         created_at = NOW()
       RETURNING *`,
      [examId, set_name, JSON.stringify(questions), JSON.stringify(answer_key)]
    );

    res.status(201).json({
      message: "Exam set added/updated successfully",
      examSet: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "Set already exists for this exam" });
    }
    console.error("❌ Error adding exam set:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Get exam with sets
exports.getExamWithSets = async (req, res) => {
  try {
    const { examId } = req.params;

    const examResult = await pool.query(`SELECT * FROM exams WHERE id = $1`, [examId]);
    if (examResult.rowCount === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const setsResult = await pool.query(`SELECT * FROM exam_sets WHERE exam_id = $1`, [examId]);

    res.status(200).json({
      ...examResult.rows[0],
      sets: setsResult.rows,
    });
  } catch (err) {
    console.error("Error fetching exam:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all exams (summary list)
exports.getAllExams = async (_req, res) => {
  try {
    const result = await pool.query(`SELECT 
  e.id,
  e.class,
  e.title,
  e.year,
  e.created_at,
  COUNT(es.id) AS set_count,
  COALESCE(JSON_AGG(es.set_name) FILTER (WHERE es.id IS NOT NULL), '[]') AS set_names
FROM exams e
LEFT JOIN exam_sets es ON e.id = es.exam_id
GROUP BY e.id
ORDER BY e.year DESC, e.created_at DESC;`);
    
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching exams:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✏️ Edit exam
exports.editExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { class: examClass, title, question_count, year } = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (examClass !== undefined) { fields.push(`class = $${idx++}`); values.push(examClass); }
    if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
    if (question_count !== undefined) { fields.push(`question_count = $${idx++}`); values.push(question_count); }
    if (year !== undefined) { fields.push(`year = $${idx++}`); values.push(year); }

    if (fields.length === 0) return res.status(400).json({ message: "No fields to update" });

    values.push(examId);

    const result = await pool.query(
      `UPDATE exams SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rowCount === 0) return res.status(404).json({ message: "Exam not found" });
    res.json({ message: "Exam updated", exam: result.rows[0] });
  } catch (err) {
    console.error("Error editing exam:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✏️ Edit exam set
exports.editExamSet = async (req, res) => {
  try {
    const { examId, setId } = req.params;
    const { set_name, answer_key, questions } = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (set_name !== undefined) { 
      fields.push(`set_name = $${idx++}`); 
      values.push(set_name); 
    }
    if (answer_key !== undefined) { 
      fields.push(`answer_key = $${idx++}`); 
      values.push(JSON.stringify(answer_key)); 
    }
    if (questions !== undefined) { 
      fields.push(`questions = $${idx++}`); 
      values.push(JSON.stringify(questions)); 
    }

    if (fields.length === 0) return res.status(400).json({ message: "No fields to update" });

    values.push(setId, examId);

    const result = await pool.query(
      `UPDATE exam_sets SET ${fields.join(", ")} WHERE id = $${idx} AND exam_id = $${idx + 1} RETURNING *`,
      values
    );

    if (result.rowCount === 0) return res.status(404).json({ message: "Exam set not found" });
    res.json({ message: "Exam set updated successfully", examSet: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "Duplicate set name for this exam" });
    }
    console.error("Error editing exam set:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 🗑️ Delete exam (and related data)
exports.deleteExam = async (req, res) => {
  const client = await pool.connect();
  try {
    const { examId } = req.params;

    await client.query("BEGIN");

    // Delete dependent rows (only from tables that exist)
    try {
      await client.query("DELETE FROM student_answers WHERE exam_id = $1", [examId]);
    } catch (err) {
      // Table doesn't exist, continue
      console.log("student_answers table doesn't exist, skipping...");
    }
    
    try {
      await client.query("DELETE FROM results WHERE exam_id = $1", [examId]);
    } catch (err) {
      // Table doesn't exist, continue
      console.log("results table doesn't exist, skipping...");
    }
    
    // Delete exam sets
    await client.query("DELETE FROM exam_sets WHERE exam_id = $1", [examId]);

    // Delete the exam
    const delExam = await client.query("DELETE FROM exams WHERE id = $1 RETURNING id", [examId]);
    if (delExam.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Exam not found" });
    }
    
    await client.query("COMMIT");
    res.json({ message: "Exam deleted successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error deleting exam:", err.message);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// 🗑️ Delete exam set (and related data)
exports.deleteExamSet = async (req, res) => {
  const client = await pool.connect();
  try {
    const { examId, setId } = req.params;

    await client.query("BEGIN");

    // Delete dependent rows (only from tables that exist)
    try {
      await client.query("DELETE FROM student_answers WHERE exam_id = $1 AND set_id = $2", [examId, setId]);
    } catch (err) {
      // Table doesn't exist, continue
      console.log("student_answers table doesn't exist, skipping...");
    }
    
    try {
      await client.query("DELETE FROM results WHERE exam_id = $1 AND set_id = $2", [examId, setId]);
    } catch (err) {
      // Table doesn't exist, continue
      console.log("results table doesn't exist, skipping...");
    }

    // Delete the exam set
    const delSet = await client.query(
      "DELETE FROM exam_sets WHERE id = $1 AND exam_id = $2 RETURNING id",
      [setId, examId]
    );

    if (delSet.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Exam set not found" });
    }

    await client.query("COMMIT");
    res.json({ message: "Exam set deleted successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error deleting exam set:", err.message);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};
