const pool = require("../models/db");
// ✅ Submit answers + auto-evaluate (optimized)
/*format : {
"roll_number":"101202",
"answers": {
    "1": "A",
    "2": "C",
    "3": "B",
    "4": "D"
......

  },
  "submitted_by":"rayhan"
}*/
exports.submitResult = async (req, res) => {
  try {
    const {
      roll_number,
      answers,
      score,
      score_percentage,
      total_questions,
      student_info,
      success // optional from frontend
    } = req.body;

    console.log("📥 Received OMR result data:", {
      roll_number,
      score,
      score_percentage,
      total_questions,
      answers_count: answers ? answers.length : 0,
      student_info
    });

    // 1️⃣ Validate
    if (!roll_number || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid payload structure" });
    }

    // 2️⃣ Fetch student, exam, and class info
    const queryRes = await pool.query(
      `
      SELECT 
        s.id AS student_id,
        e.id AS exam_id,
        ec.id AS class_id
      FROM students s
      JOIN exams e ON e.id = (
        SELECT id FROM exams 
        WHERE year = EXTRACT(YEAR FROM NOW()) 
        ORDER BY created_at DESC LIMIT 1
      )
      JOIN exam_class ec ON ec.exam_id = e.id 
      WHERE s.roll_number = $1
      LIMIT 1
      `,
      [roll_number]
    );

    if (queryRes.rowCount === 0) {
      return res.status(404).json({ message: "Student not found or exam not configured" });
    }

    const { student_id, exam_id, class_id } = queryRes.rows[0];

    // 3️⃣ Convert answers array to object for storage (key = question_no)
    // OMR API sends: [{question: 1, student_answer: "B", correct_answer: "C", result: "Incorrect"}]
    const formattedAnswers = {};
    answers.forEach(a => {
      formattedAnswers[a.question] = a.student_answer || null;
    });

    // Count correct & wrong from OMR API response
    const correct = answers.filter(a => a.result === "Correct").length;
    const wrong = answers.filter(a => a.result === "Incorrect").length;

    console.log("📊 Calculated stats:", { correct, wrong, total: answers.length });

    // 4️⃣ Store student answers
    await pool.query(
      `
      INSERT INTO student_answers (student_id, exam_id, class_id, answers, submitted_by)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (student_id, exam_id)
      DO UPDATE SET 
        answers = EXCLUDED.answers,
        class_id = EXCLUDED.class_id,
        submitted_by = EXCLUDED.submitted_by,
        submitted_at = NOW()
      `,
      [student_id, exam_id, class_id, JSON.stringify(formattedAnswers), "OMR_Scanner"]
    );

    // 5️⃣ Store evaluated results
    const resultRes = await pool.query(
      `
      INSERT INTO results (
        student_id, exam_id, class_id,
        total_questions, correct, wrong,
        score, percentage, evaluated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (student_id, exam_id)
      DO UPDATE SET
        class_id = EXCLUDED.class_id,
        total_questions = EXCLUDED.total_questions,
        correct = EXCLUDED.correct,
        wrong = EXCLUDED.wrong,
        score = EXCLUDED.score,
        percentage = EXCLUDED.percentage,
        evaluated_at = NOW()
      RETURNING *
      `,
      [
        student_id,
        exam_id,
        class_id,
        total_questions || answers.length,
        correct,
        wrong,
        score || 0,
        score_percentage || 0
      ]
    );

    console.log("✅ Result saved successfully:", resultRes.rows[0]);

    // 6️⃣ Respond success
    res.status(201).json({
      message: "OMR result submitted successfully",
      result: resultRes.rows[0]
    });

  } catch (err) {
    console.error("❌ Error in submitResult:", err.message);
    console.error("❌ Error details:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



// ✏️ Edit submitted result (re-evaluate with new answers)
exports.editSubmittedResult = async (req, res) => {
  try {
    const { student_id, exam_id, class_id, answers } = req.body;

    const keyRes = await pool.query(
      "SELECT answer_key FROM exam_class WHERE id = $1 AND exam_id = $2",
      [class_id, exam_id]
    );
    if (keyRes.rowCount === 0) return res.status(400).json({ message: "Invalid exam/class" });

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
      `UPDATE student_answers SET answers = $4 WHERE student_id = $1 AND exam_id = $2 AND class_id = $3`,
      [student_id, exam_id, class_id, answers]
    );

    const result = await pool.query(
      `UPDATE results SET total_questions=$4, correct=$5, wrong=$6, score=$7, percentage=$8
       WHERE student_id=$1 AND exam_id=$2 AND class_id=$3 RETURNING *`,
      [student_id, exam_id, class_id, total, correct, wrong, correct, percentage]
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
      `SELECT s.name, s.roll_number, s.school, s.class, e.exam_name, e.year,r.*, sa.answers as student_answered,ec.questions as question_set,ec.answer_key as correct_answers
       FROM results r
       JOIN students s ON s.id = r.student_id
       JOIN exams e ON e.id = r.exam_id
       JOIN student_answers sa ON sa.student_id = s.id AND sa.exam_id = e.id AND sa.class_id = r.class_id
       JOIN exam_class ec ON ec.class_name = s.class AND ec.exam_id = '8ae9128a-717f-4d71-b8e5-a150a3f14812' 
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
      `SELECT r.*, s.name, s.roll_number, s.school, s.class, e.exam_name, e.year
       FROM results r
       JOIN students s ON s.id = r.student_id
       JOIN exams e ON e.id = r.exam_id
       WHERE s.class = $1
       ORDER BY r.evaluated_at DESC`,
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
      `SELECT r.*, s.name, s.roll_number, s.school, s.class, e.exam_name, e.year
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
      `SELECT r.*, s.name, s.roll_number, s.school, s.class, e.exam_name, e.year
       FROM results r
       JOIN students s ON s.id = r.student_id
       JOIN exams e ON e.id = r.exam_id
       WHERE s.school = $1 AND s.class = $2
       ORDER BY r.evaluated_at DESC`,
      [school, cls]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching results by school and class:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
//get results 
// ✅ Submit detailed results from OMR service
exports.submitDetailedResult = async (req, res) => {
  try {
    const { student_id, exam_id, class_id, answers, submitted_by, correct_count, wrong_count, total_questions } = req.body;

    // Validate input
    if (!student_id || !exam_id || !class_id || !answers) {
      return res.status(400).json({ message: "Missing required fields: student_id, exam_id, class_id, answers" });
    }

    // Calculate percentage
    const percentage = total_questions > 0 ? ((correct_count / total_questions) * 100).toFixed(2) : 0;
    const score = correct_count - wrong_count * 0.25; // optional negative marking

    // Step 1: Save student answers
    await pool.query(
      `
      INSERT INTO student_answers (student_id, exam_id, class_id, answers, submitted_by)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (student_id, exam_id) 
      DO UPDATE SET 
        answers = EXCLUDED.answers,
        class_id = EXCLUDED.class_id,
        submitted_by = EXCLUDED.submitted_by,
        submitted_at = NOW()
      `,
      [student_id, exam_id, class_id, answers, submitted_by]
    );

    // Step 2: Save evaluated result
    const resultRes = await pool.query(
      `
      INSERT INTO results (student_id, exam_id, class_id, total_questions, correct, wrong, score, percentage)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (student_id, exam_id)
      DO UPDATE SET
        class_id = EXCLUDED.class_id,
        correct = EXCLUDED.correct,
        wrong = EXCLUDED.wrong,
        score = EXCLUDED.score,
        percentage = EXCLUDED.percentage,
        evaluated_at = NOW()
      RETURNING *
      `,
      [student_id, exam_id, class_id, total_questions, correct_count, wrong_count, score, percentage]
    );

    res.status(201).json({
      message: "Detailed result submitted and evaluated successfully",
      result: resultRes.rows[0],
    });

  } catch (err) {
    console.error("Error submitting detailed result:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFullResults = async (req, res) => {
  try {
   
    const result = await pool.query(
      `SELECT r.*,s.name,s.roll_number,s.school,s.class,e.exam_name,e.year FROM results r JOIN students s ON s.id = r.student_id JOIN exams e ON e.id = r.exam_id ORDER BY r.score DESC`,
   
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching results:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

//markForScholarship
exports.markForScholarship = async (req, res) => {
  try {
    const { student_id } = req.params;
    const result = await pool.query("UPDATE results SET scholarship = true WHERE student_id = $1", [student_id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error marking for scholarship:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

//unmarkForScholarship
exports.unmarkForScholarship = async (req, res) => {
  try {
    const { student_id } = req.params;
    const result = await pool.query("UPDATE results SET scholarship = false WHERE student_id = $1", [student_id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error unmarking for scholarship:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
//getScholarshipResults
exports.getScholarshipResults = async (req, res) => {
  try {
    const result = await pool.query("SELECT s.name,s.roll_number,s.school,s.class,e.exam_name,e.year,r.* FROM results r JOIN students s ON s.id = r.student_id JOIN exams e ON e.id = r.exam_id WHERE r.scholarship = true");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching scholarship results:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/*`
      INSERT INTO results (
        student_id, exam_id, class_id,
        total_questions, correct, wrong,
        score, percentage, evaluated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (student_id, exam_id)
      DO UPDATE SET
        class_id = EXCLUDED.class_id,
        total_questions = EXCLUDED.total_questions,
        correct = EXCLUDED.correct,
        wrong = EXCLUDED.wrong,
        score = EXCLUDED.score,
        percentage = EXCLUDED.percentage,
        evaluated_at = NOW()
      RETURNING *
      `,*/

//api for manual submit result to the results table with roll_number and correct_count, wrong_count, total_questions=60
exports.manualSubmitResult = async (req, res) => {
  try { 
    const { roll_number, correct_count, wrong_count = 0 } = req.body;

    if (!roll_number || correct_count === undefined || correct_count === null) {
      return res.status(400).json({ message: "Missing required fields: roll_number, correct_count" });
    }

    // 1) Find the student, latest exam and class mapping
    const queryRes = await pool.query(
      `
      SELECT 
        s.id AS student_id,
        e.id AS exam_id,
        ec.id AS class_id,
        e.question_count AS total_questions
      FROM students s
      JOIN exams e ON e.id = (
        SELECT id FROM exams 
        ORDER BY created_at DESC 
        LIMIT 1
      )
      JOIN exam_class ec ON ec.exam_id = e.id AND ec.class_name = s.class
      WHERE s.roll_number = $1
      LIMIT 1
      `,
      [roll_number]
    );

    if (queryRes.rowCount === 0) {
      return res.status(404).json({ message: "Student not found or exam/class not configured" });
    }

    const { student_id, exam_id, class_id, total_questions } = queryRes.rows[0];

    // 2) Compute score and percentage (no negative marking for manual entry)
    const tq = Number(total_questions) || 60;
    const correct = Number(correct_count) || 0;
    const wrong = Number(wrong_count) || 0;
    const score = correct;
    const percentage = tq > 0 ? Number(((correct / tq) * 100).toFixed(2)) : 0;

    // 3) Insert/Update results table only
    const resultRes = await pool.query(
      `
      INSERT INTO results (
        student_id, exam_id, class_id,
        total_questions, correct, wrong,
        score, percentage, evaluated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (student_id, exam_id)
      DO UPDATE SET
        class_id = EXCLUDED.class_id,
        total_questions = EXCLUDED.total_questions,
        correct = EXCLUDED.correct,
        wrong = EXCLUDED.wrong,
        score = EXCLUDED.score,
        percentage = EXCLUDED.percentage,
        evaluated_at = NOW()
      RETURNING *
      `,
      [student_id, exam_id, class_id, tq, correct, wrong, score, percentage]
    );

    return res.status(201).json({
      message: "Manual result submitted successfully",
      result: resultRes.rows[0]
    });
  } catch (err) {
    console.error("Error in manualSubmitResult:", err.message);
    console.error("Error details:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

    