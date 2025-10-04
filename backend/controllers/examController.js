const pool = require("../models/db");

// ✅ Create exam
exports.createExam = async (req, res) => {
  try {
    const { exam_name, question_count, year } = req.body;

    if (!exam_name || !year) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO exams (exam_name, question_count, year)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [exam_name, question_count || 60, year]
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

// ✅ Add exam class
exports.addExamClass = async (req, res) => {
  try {
    const { examId } = req.params;
    const { class_name, answer_key, questions } = req.body;

    if (!class_name || !answer_key || !questions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO exam_class (exam_id, class_name, questions, answer_key)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (exam_id, class_name) 
       DO UPDATE SET 
         questions = EXCLUDED.questions,
         answer_key = EXCLUDED.answer_key,
         created_at = NOW()
       RETURNING *`,
      [examId, class_name, JSON.stringify(questions), JSON.stringify(answer_key)]
    );

    res.status(201).json({
      message: "Exam class added/updated successfully",
      examClass: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "Class already exists for this exam" });
    }
    console.error("❌ Error adding exam class:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Get exam with classes
exports.getExamWithClasses = async (req, res) => {
  try {
    const { examId } = req.params;

    const examResult = await pool.query(`SELECT * FROM exams WHERE id = $1`, [examId]);
    if (examResult.rowCount === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const classesResult = await pool.query(`SELECT * FROM exam_class WHERE exam_id = $1`, [examId]);

    res.status(200).json({
      ...examResult.rows[0],
      classes: classesResult.rows,
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
  e.exam_name,
  e.year,
  e.question_count,
  e.created_at,
  COUNT(ec.id) AS class_count,
  COALESCE(JSON_AGG(ec.class_name) FILTER (WHERE ec.id IS NOT NULL), '[]') AS class_names
FROM exams e
LEFT JOIN exam_class ec ON e.id = ec.exam_id
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
    const { exam_name, question_count, year } = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (exam_name !== undefined) { fields.push(`exam_name = $${idx++}`); values.push(exam_name); }
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

// ✏️ Edit exam class
exports.editExamClass = async (req, res) => {
  try {
    const { examId, classId } = req.params;
    const { class_name, answer_key, questions } = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (class_name !== undefined) { 
      fields.push(`class_name = $${idx++}`); 
      values.push(class_name); 
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

    values.push(classId, examId);

    const result = await pool.query(
      `UPDATE exam_class SET ${fields.join(", ")} WHERE id = $${idx} AND exam_id = $${idx + 1} RETURNING *`,
      values
    );

    if (result.rowCount === 0) return res.status(404).json({ message: "Exam class not found" });
    res.json({ message: "Exam class updated successfully", examClass: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "Duplicate class name for this exam" });
    }
    console.error("Error editing exam class:", err.message);
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
    
    // Delete exam classes
    await client.query("DELETE FROM exam_class WHERE exam_id = $1", [examId]);

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

// 🗑️ Delete exam class (and related data)
exports.deleteExamClass = async (req, res) => {
  const client = await pool.connect();
  try {
    const { examId, classId } = req.params;

    await client.query("BEGIN");

    // Delete dependent rows (only from tables that exist)
    try {
      await client.query("DELETE FROM student_answers WHERE exam_id = $1 AND class_id = $2", [examId, classId]);
    } catch (err) {
      // Table doesn't exist, continue
      console.log("student_answers table doesn't exist, skipping...");
    }
    
    try {
      await client.query("DELETE FROM results WHERE exam_id = $1 AND class_id = $2", [examId, classId]);
    } catch (err) {
      // Table doesn't exist, continue
      console.log("results table doesn't exist, skipping...");
    }

    // Delete the exam class
    const delClass = await client.query(
      "DELETE FROM exam_class WHERE id = $1 AND exam_id = $2 RETURNING id",
      [classId, examId]
    );

    if (delClass.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Exam class not found" });
    }

    await client.query("COMMIT");
    res.json({ message: "Exam class deleted successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error deleting exam class:", err.message);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

//get full question paper for a class and exam
exports.getFullQuestionPaper = async (req, res) => {
  try {
    const { classId, examId } = req.params;
    const result = await pool.query("SELECT * FROM exam_class WHERE id = $1 AND exam_id = $2", [classId, examId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching full question paper:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

//get students details and answer key for a class and exam
exports.getStudentsDetailsWithAnswerKey = async (req, res) => {
  try {
    const { roll_number } = req.params;
    const result = await pool.query(`SELECT
      s.roll_number AS roll,
      s.name AS student_name,
      COALESCE(s.school, 'N/A') AS school_name,
      ec.class_name,
      ec.answer_key
  FROM students s
  JOIN exam_class ec
      ON ec.class_name = s.class
  WHERE s.roll_number = $1
    AND ec.exam_id = '8ae9128a-717f-4d71-b8e5-a150a3f14812';
  `, [roll_number]);
    res.json(result.rows);

  } catch (err) {
    console.error("Error fetching students details and answer key:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};