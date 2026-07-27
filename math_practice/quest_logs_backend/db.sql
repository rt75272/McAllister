-- Quest telemetry schema for Render PostgreSQL

CREATE TABLE IF NOT EXISTS students (
  student_id BIGSERIAL PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quest_logs (
  log_id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  operation VARCHAR(40) NOT NULL,
  problem_asked TEXT NOT NULL,
  student_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_to_solve_seconds NUMERIC(8,2) NOT NULL CHECK (time_to_solve_seconds >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quest_logs_student_time
  ON quest_logs (student_id, created_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_students_updated_at ON students;
CREATE TRIGGER trg_students_updated_at
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
