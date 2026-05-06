const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

// 🔐 DB Config (keep same for now)
const db = mysql.createConnection({
  host: "database-1.cluster-crysswk8kh05.ap-south-1.rds.amazonaws.com",
  user: "admin",
  password: "password", // make sure this is correct
  database: "testdb"
});

// ✅ Connect to DB
db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err.message);
  } else {
    console.log("✅ Connected to RDS");
  }
});

// 🏠 Home route
app.get('/', (req, res) => {
  res.send("AWS Assignment App Running 🚀");
});

// ❤️ Health check (important for AWS)
app.get('/health', (req, res) => {
  res.send("OK");
});

// 🗄️ Create table
app.get('/init', (req, res) => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255)
    )
  `;

  db.query(query, (err) => {
    if (err) {
      console.error("❌ Table creation error:", err.message);
      return res.status(500).send("Error creating table: " + err.message);
    }
    res.send("✅ Table Created Successfully");
  });
});

// ➕ Insert user
app.post('/add', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).send("Name is required");
  }

  db.query("INSERT INTO users (name) VALUES (?)", [name], (err) => {
    if (err) {
      console.error("❌ Insert error:", err.message);
      return res.status(500).send("Insert failed: " + err.message);
    }
    res.send("✅ User added");
  });
});

// 📄 Fetch users
app.get('/users', (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) {
      console.error("❌ Fetch error:", err.message);
      return res.status(500).send("Fetch failed: " + err.message);
    }
    res.json(result);
  });
});

// 🚀 Start server (AWS compatible)
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});