const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Temporary "database"
const users = [];

// ✅ Test API
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from API!' });
});

// ✅ Signup API
app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: "User already exists" });
  }

  users.push({ name, email, password });
  res.json({ success: true, message: "User registered successfully!" });
});

// ✅ Login API
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  res.json({ success: true, message: "Login successful!", token: "abc123" });
});

// ✅ Fetch Users API
app.get('/users', (req, res) => {
  res.json(users);
});

app.listen(3000, () => console.log('🚀 API running on http://localhost:3000'));
