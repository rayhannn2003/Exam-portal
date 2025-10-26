CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- bcrypt hashed
    role TEXT CHECK (role IN ('superadmin','admin')) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO admins (username, password, role)
VALUES ('superadmin', crypt('admin1', gen_salt('bf')), 'superadmin');


-- CREATE TABLE exams_archived (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     title TEXT NOT NULL,
--     year INT NOT NULL,
--     question_count INT ,
--     answer_key JSONB, -- e.g. { "1": "A", "2": "C", ... }
--     created_at TIMESTAMP DEFAULT NOW()
-- );

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE students
ADD COLUMN password TEXT;

-- Exams table
CREATE TABLE exams_archived (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class TEXT NOT NULL,
    title TEXT NOT NULL,
    year INT NOT NULL,
    question_count INT DEFAULT 60,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Exam sets table
CREATE TABLE exam_sets_archived (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    set_name TEXT NOT NULL,                 -- e.g., "A", "B", "C", "D"
    answer_key JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (exam_id, set_name)
);
Store raw answers submitted (optional, for audit)
CREATE TABLE student_answers_archived (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    set_id UUID NOT NULL REFERENCES exam_sets(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,                  -- {"1": "A", "2": "C", ...}
    submitted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (student_id, exam_id)
);

-- Store evaluated result
CREATE TABLE results_archived (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    set_id UUID NOT NULL REFERENCES exam_sets(id) ON DELETE CASCADE,
    total_questions INT NOT NULL,
    correct INT NOT NULL,
    wrong INT NOT NULL,
    score INT NOT NULL,                      -- correct count
    percentage DECIMAL(5,2) NOT NULL,
    rank INT,                                -- computed later
    evaluated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (student_id, exam_id)
);
alter table students
add column father_name varchar(40),
add  column mother_name varchar(40),
    add column class_roll varchar(25);

alter table exam_sets
add column  questions JSONB;

delete from students
where class = 'six';

-- ✅ Student Answers Table
CREATE TABLE student_answers_archived (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    set_id UUID NOT NULL REFERENCES exam_sets(id) ON DELETE CASCADE,
    answers JSONB , -- Stores submitted answers in JSON format { "1": "A", "2": "C", ... }
    submitted_by varchar(40),
    submitted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (student_id, exam_id) -- Ensures a student can only submit once per exam (update if re-submitted)
);

update exams
set class = '10'
where id='6651e49a-483c-4c71-95fe-aaccfc75fa52';

ALTER TABLE results
ALTER COLUMN score TYPE NUMERIC(5,2);

alter table admins
add column name varchar(40);

ALTER TABLE students
ADD COLUMN registered_by UUID REFERENCES admins(id);
drop table exam_sets;
ALTER TABLE results RENAME TO results_archived;
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_name TEXT NOT NULL,
    year INT ,
    question_count INT DEFAULT 60,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE exam_class (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    class_name TEXT NOT NULL,
    questions JSONB ,   -- {"1": "What is 2+2?", "2": "Capital of France?" ...}
    answer_key JSONB ,  -- {"1": "A", "2": "C" ...}
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (exam_id, class_name)
);

CREATE TABLE student_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES exam_class(id) ON DELETE CASCADE,
    answers JSONB ,      -- {"1": "B", "2": "C" ...}
    submitted_by VARCHAR(40),
    submitted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (student_id, exam_id)
);
CREATE TABLE results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES exam_class(id) ON DELETE CASCADE,
    total_questions INT ,
    correct INT ,
    wrong INT ,
    score NUMERIC(5,2) ,
    percentage DECIMAL(5,2) ,
    rank INT,
    evaluated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (student_id, exam_id)
);


create table students {
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    school TEXT NOT NULL,
    father_name VARCHAR(40),
    mother_name VARCHAR(40),
    class_roll VARCHAR(25),
    class TEXT NOT NULL, -- 7 
    password TEXT,
    registered_by UUID REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT NOW()
}
