const express = require('express');
const sql = require('mssql');

const {
SecretsManagerClient,
GetSecretValueCommand
} = require('@aws-sdk/client-secrets-manager');

const app = express();
app.use(express.json());

// ✅ AWS Secrets Manager
async function getDBConfig() {
const client = new SecretsManagerClient({
region: process.env.AWS_REGION || 'ap-south-1'
});

const response = await client.send(
new GetSecretValueCommand({
SecretId: process.env.SECRET_NAME || 'myapp/rds'
})
);

return JSON.parse(response.SecretString);
}

// ✅ Start App
async function startServer() {
try {
// Get secret from AWS Secrets Manager
const secret = await getDBConfig();


// SQL Server Config
const config = {
  user: secret.username,
  password: secret.password,
  server: secret.host,
  database: secret.database,
  port: parseInt(secret.port),
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

// Connect to SQL Server
await sql.connect(config);

console.log('✅ Connected to RDS SQL Server');

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


} catch (err) {
console.error('❌ Startup error:', err);
}
}

startServer();