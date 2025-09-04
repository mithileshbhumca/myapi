const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Temporary "database"
const users = [];

const SECRET_KEY = "MY_SECRET_KEY"; // change this in production

// ✅ Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Token missing" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}


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
  const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: "1h" });

  res.json({ success: true, message: "Login successful!", token});
});

// ✅ Fetch Users API
app.get('/users', authenticateToken, (req, res) => {
  res.json(users);
});

// ✅ Render requires dynamic port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));

// app.listen(3000, () => console.log('🚀 API running on http://localhost:3000'));
