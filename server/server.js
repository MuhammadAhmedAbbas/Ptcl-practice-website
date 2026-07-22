const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection Pool Setup
const isLocalDb = process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDb ? false : { rejectUnauthorized: false }
});

// Test Database Connection and Initialize Table
async function initDb() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database!');
    
    // Create sample table if it doesn't exist (Step 5)
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database table "messages" is ready.');
    client.release();
  } catch (err) {
    console.error('Database connection error:', err.message);
  }
}

initDb();

// Homepage Route (GET /)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Express + Railway PostgreSQL API</title>
        <style>
          body { font-family: system-ui, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
          .card { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; max-width: 600px; }
          code { background: #e9ecef; padding: 2px 6px; border-radius: 4px; }
          a { color: #0066cc; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🚀 Express Server is Running!</h1>
          <p>Welcome! Your backend server is active and connected to Railway PostgreSQL.</p>
          <h3>Available Endpoints:</h3>
          <ul>
            <li><a href="/api/health"><code>GET /api/health</code></a> - Health check & DB status</li>
            <li><a href="/api/messages"><code>GET /api/messages</code></a> - Fetch all messages</li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// --- API Endpoints (Step 6) ---

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      message: 'Server and Database are connected!',
      dbTime: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET all messages
app.get('/api/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new message
app.post('/api/messages', async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO messages (content) VALUES ($1) RETURNING *',
      [content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a message
app.delete('/api/messages/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM messages WHERE id = $1', [id]);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express Server (Step 1)
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
