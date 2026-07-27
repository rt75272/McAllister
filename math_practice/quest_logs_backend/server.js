const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const ALLOWED_OPERATIONS = new Set([
  'addition',
  'subtraction',
  'multiplication',
  'division',
  'fraction',
  'decimal',
  'ratio',
  'integer',
  'algebra',
  'geometry',
  'other',
]);

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.status(200).json({ ok: true, db: 'connected' });
  } catch (err) {
    console.error('Health check failed:', err);
    return res.status(500).json({ ok: false, db: 'disconnected' });
  }
});

app.post('/api/logs/quest', async (req, res) => {
  try {
    const {
      student_id,
      operation,
      problem_asked,
      student_answer,
      is_correct,
      time_to_solve_seconds,
    } = req.body || {};

    const idNum = Number(student_id);
    const op = typeof operation === 'string' ? operation.trim().toLowerCase() : '';
    const prompt = typeof problem_asked === 'string' ? problem_asked.trim() : '';
    const answer = typeof student_answer === 'string' ? student_answer.trim() : '';
    const timeNum = Number(time_to_solve_seconds);

    if (!Number.isInteger(idNum) || idNum <= 0) {
      return res.status(400).json({ error: 'student_id must be a positive integer' });
    }
    if (!op) {
      return res.status(400).json({ error: 'operation is required' });
    }
    if (!ALLOWED_OPERATIONS.has(op)) {
      return res.status(400).json({ error: 'operation is invalid' });
    }
    if (!prompt) {
      return res.status(400).json({ error: 'problem_asked is required' });
    }
    if (!answer) {
      return res.status(400).json({ error: 'student_answer is required' });
    }
    if (typeof is_correct !== 'boolean') {
      return res.status(400).json({ error: 'is_correct must be boolean' });
    }
    if (!Number.isFinite(timeNum) || timeNum < 0) {
      return res.status(400).json({ error: 'time_to_solve_seconds must be a non-negative number' });
    }

    const sql = `
      INSERT INTO quest_logs
        (student_id, operation, problem_asked, student_answer, is_correct, time_to_solve_seconds)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING log_id, student_id, operation, is_correct, time_to_solve_seconds, created_at;
    `;

    const values = [idNum, op, prompt, answer, is_correct, timeNum];
    const result = await pool.query(sql, values);

    return res.status(201).json({
      message: 'Quest attempt logged successfully',
      log: result.rows[0],
    });
  } catch (err) {
    console.error('POST /api/logs/quest failed:', err);

    if (err.code === '23503') {
      return res.status(400).json({ error: 'student_id does not exist' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`Quest logs backend listening on port ${port}`);
});
