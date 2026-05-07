const express = require('express');
const sql = require('mssql');

const app = express();
app.use(express.json());

// ✅ SQL Server Config
const config = {
  user: 'admin',
  password: 'Password123',
  server: 'database-1.crysswk8kh05.ap-south-1.rds.amazonaws.com', // remove "cluster"
  database: 'master',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

// ✅ Connect to SQL Server
sql.connect(config)
  .then(() => {
    console.log('✅ Connected to RDS SQL Server');
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err);
  });

// 🏠 Home route
app.get('/', (req, res) => {
  res.send('AWS Assignment App Running 🚀');
});

// ❤️ Health check
app.get('/health', (req, res) => {
  res.send('OK');
});

// 🗄️ Create table
app.get('/init', async (req, res) => {
  try {
    await sql.query(`
      IF NOT EXISTS (
        SELECT * FROM sysobjects WHERE name='users' AND xtype='U'
      )
      CREATE TABLE users (
        id INT PRIMARY KEY IDENTITY(1,1),
        name NVARCHAR(255)
      )
    `);

    res.send('✅ Table Created Successfully');
  } catch (err) {
    console.error('❌ Table creation error:', err);
    res.status(500).send(err.message);
  }
});

// ➕ Insert user
app.post('/add', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send('Name is required');
    }

    await sql.query`
      INSERT INTO users (name)
      VALUES (${name})
    `;

    res.send('✅ User added');
  } catch (err) {
    console.error('❌ Insert error:', err);
    res.status(500).send(err.message);
  }
});

// 📄 Fetch users
app.get('/users', async (req, res) => {
  try {
    const result = await sql.query('SELECT * FROM users');
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Fetch error:', err);
    res.status(500).send(err.message);
  }
});

// 🚀 Start server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});