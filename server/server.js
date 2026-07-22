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

// Test Database Connection and Initialize Tables
async function initDb() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database!');

    // Initialize Complaints Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        issue TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database table "complaints" is ready.');

    // Initialize Messages Table (for backward compatibility)
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

// Serve Client Frontend (if dist folder exists) or API Landing Page
const clientDist = path.join(__dirname, '../client/dist');
const fs = require('fs');

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  // Fallback API Landing Page
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PTCL-Style Telecom API Server</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; margin: 40px; line-height: 1.6; color: #1e293b; background: #f8fafc; }
            .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; max-width: 650px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            h1 { color: #008060; margin-top: 0; }
            code { background: #f1f5f9; color: #0f172a; padding: 4px 8px; border-radius: 6px; font-size: 0.9em; font-family: monospace; }
            a { color: #008060; font-weight: 600; text-decoration: none; }
            a:hover { text-decoration: underline; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>🚀 PTCL Practice Telecom Server</h1>
            <p>Express Backend Server connected to <strong>Railway PostgreSQL</strong> database.</p>
            <h3>Active API Endpoints:</h3>
            <ul>
              <li><a href="/api/health"><code>GET /api/health</code></a> - Server & DB Connection Health Status</li>
              <li><a href="/api/complaints"><code>GET /api/complaints</code></a> - List All Saved Complaints</li>
              <li><code>POST /api/complaints</code> - Submit New Complaint (Name, Phone Number, Issue)</li>
            </ul>
          </div>
        </body>
      </html>
    `);
  });
}

// --- API Endpoints ---

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

// GET all complaints
app.get('/api/complaints', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM complaints ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new complaint
app.post('/api/complaints', async (req, res) => {
  const { name, phone_number, issue } = req.body;

  // Server-side validation
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (!phone_number || !phone_number.trim()) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }
  if (!issue || !issue.trim()) {
    return res.status(400).json({ error: 'Complaint/Issue details are required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO complaints (name, phone_number, issue) VALUES ($1, $2, $3) RETURNING *',
      [name.trim(), phone_number.trim(), issue.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Complaint submitted and saved successfully!',
      complaint: result.rows[0]
    });
  } catch (err) {
    console.error('Failed to insert complaint:', err);
    res.status(500).json({ error: 'Failed to record complaint in database: ' + err.message });
  }
});

// GET all messages (Legacy)
app.get('/api/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new message (Legacy)
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

// Start Express Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
