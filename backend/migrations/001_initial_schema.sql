BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin'
        CHECK (role IN ('admin', 'superadmin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    father_name TEXT,
    mother_name TEXT,
    school TEXT NOT NULL,
    class TEXT NOT NULL,
    class_roll TEXT,
    email_id TEXT,
    gender TEXT,
    phone TEXT,
    roll_number TEXT NOT NULL UNIQUE,
    payment_status BOOLEAN NOT NULL DEFAULT FALSE,
    entry_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    password TEXT NOT NULL,
    registered_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_name TEXT NOT NULL,
    year INTEGER NOT NULL,
    question_count INTEGER NOT NULL DEFAULT 60
        CHECK (question_count > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exam_class (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    class_name TEXT NOT NULL,
    questions JSONB NOT NULL DEFAULT '{}'::JSONB,
    answer_key JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (exam_id, class_name)
);

CREATE TABLE student_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES exam_class(id) ON DELETE CASCADE,
    answers JSONB NOT NULL DEFAULT '{}'::JSONB,
    submitted_by TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, exam_id)
);

CREATE TABLE results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES exam_class(id) ON DELETE CASCADE,
    total_questions INTEGER,
    correct INTEGER,
    wrong INTEGER,
    score NUMERIC(8, 2),
    percentage NUMERIC(5, 2),
    rank INTEGER,
    scholarship BOOLEAN NOT NULL DEFAULT FALSE,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, exam_id)
);

CREATE INDEX students_class_idx ON students(class);
CREATE INDEX students_school_idx ON students(school);
CREATE INDEX students_registered_by_idx ON students(registered_by);
CREATE INDEX exam_class_exam_id_idx ON exam_class(exam_id);
CREATE INDEX results_exam_id_idx ON results(exam_id);
CREATE INDEX results_class_id_idx ON results(class_id);
CREATE INDEX results_scholarship_idx ON results(scholarship)
    WHERE scholarship = TRUE;

COMMIT;

