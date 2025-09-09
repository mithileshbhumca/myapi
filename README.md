# 🚀 MyAPI Backend – Authentication System with JWT + MongoDB

This is the **backend server** for authentication, built with **Node.js, Express, MongoDB, JWT**.  
It provides secure authentication with **access + refresh tokens**, token expiry handling, and user management APIs.

---

## ✨ Features
- 🔑 User signup & login with JWT
- 🔒 Secure password hashing (bcrypt)
- ⏳ Access token (15 min) & Refresh token (7 days)
- 🔄 Refresh token endpoint for renewing access token
- ⛔ Handles refresh token expiry (auto logout client-side)
- 🛠 Extendable API (add more protected endpoints)

---

## 📂 Project Structure
backend/
├── index.js # Main Express server
├── models/User.js # MongoDB user schema
├── routes/auth.js # Signup, login, refresh APIs
├── .env # Secrets and DB URL
└── package.json



---

## ⚙️ Setup
1. Clone repo:
   ```bash
   git clone https://github.com/your-repo/myapi.git
   cd backend
2. Install dependencies:
npm install
3. Create .env:
MONGO_URI=mongodb+srv://your-cluster-url
ACCESS_TOKEN_SECRET=your-access-secret
REFRESH_TOKEN_SECRET=your-refresh-secret
4. Start server:
   node index.js
Runs at http://localhost:5000

🔥 API Endpoints

Public APIs

POST /signup → Register user

POST /login → Get access + refresh token

POST /refresh → Get new access token

Protected APIs

GET /users → List users (requires Authorization: Bearer <token>)

🚀 Future Enhancements

Role-based access (Admin/User)

Password reset with email OTP

Secure refresh tokens using HttpOnly cookies

Deployment to AWS / Render / Heroku
