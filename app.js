const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

// 👉 Replace with your RDS details
const db = mysql.createConnection({
  host: "YOUR_RDS_ENDPOINT",
  user: "admin",
  password: "password",
  database: "testdb"
});

// Check DB connection
db.connect((err) => {
  if (err) {
    console.log("DB connection failed:", err);
  } else {
    console.log("Connected to RDS");
  }
});

// Home route
app.get('/', (req, res) => {
  res.send("AWS Assignment App Running 🚀");
});

// Create table
app.get('/init', (req, res) => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255)
    )
  `;
  
  db.query(query, (err) => {
    if (err) {
      res.send("Error creating table");
    } else {
      res.send("Table Created Successfully");
    }
  });
});

// Insert user
app.post('/add', (req, res) => {
  const { name } = req.body;

  db.query("INSERT INTO users (name) VALUES (?)", [name], (err) => {
    if (err) {
      res.send("Insert failed");
    } else {
      res.send("User added");
    }
  });
});

// Fetch users
app.get('/users', (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) {
      res.send("Fetch failed");
    } else {
      res.json(result);
    }
  });
});

// Start server
app.listen(8080, () => {
  console.log("Server running on port 8080");
});