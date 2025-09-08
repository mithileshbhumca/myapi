require('dotenv').config(); // load env variables at top

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('./models/User');

const app = express();
app.use(cors());
app.use(bodyParser.json());


// ✅ Load from .env
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;
const REFRESH_TOKEN_EXPIRY = "7d";


// ✅ Connect MongoDB
mongoose.connect(MONGO_URI,
    { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

// ✅ Middleware to verify JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Token missing" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
             if (err.name === "TokenExpiredError") {
                return res.status(401).json({ error: "Token expired" });
            }
            return res.status(403).json({ error: "Invalid token" });
        }
        req.user = user;
        next();
    });
}

// ✅ Test API
app.get('/hello', (req, res) => {
    res.json({ message: 'Hello from API with MongoDB & JWT!' });
});

// ✅ Signup API
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.json({ success: true, message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Login API
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });
        // Access token (short life)
        const accessToken = jwt.sign({ email: user.email, id: user._id }, SECRET_KEY, { expiresIn: "15m" });
        // Refresh token (longer life)
        const refreshToken = jwt.sign({ email: user.email, id: user._id }, SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRY });
        // Compute expiry time (in seconds)
        const decoded = jwt.decode(refreshToken);
        const refreshTokenExpiry = decoded.exp - decoded.iat; // duration in seconds

        res.json({ success: true, message: "Login successful!", accessToken, refreshToken, refreshTokenExpiry });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Protected Users API
app.get('/users', authenticateToken, async (req, res) => {
    const users = await User.find({}, { password: 0 }); // hide password
    res.json(users);
});

// ✅ refresh token API

app.post('/refresh', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: "Refresh token missing" });

    jwt.verify(refreshToken, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid refresh token" });

        const newAccessToken = jwt.sign({ email: user.email, id: user.id }, SECRET_KEY, { expiresIn: "15m" });
        res.json({ accessToken: newAccessToken });
    });
});


// ✅ Render requires dynamic port
app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
