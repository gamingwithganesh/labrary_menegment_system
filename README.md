# 📚 LIB-MAN: College Library Management System

LIB-MAN is a web-based library management application built for college and institutional library automation. It includes a React frontend and an Express backend with optional MongoDB persistence.

## 🚀 Technology Stack
- **Backend**: Node.js, Express, Mongoose, bcryptjs, jsonwebtoken, cors, dotenv
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Database**: MongoDB (optional)

## ✨ Key Features
- Role-based access and JWT authentication
- Books CRUD and inventory management
- Circulation issue/return workflows
- User-friendly frontend with dashboard and library controls
- In-memory demo mode when MongoDB is not available
- Express API with optional MongoDB persistence

## 📁 Project Structure
- `backend/` — Express backend server, JWT auth, demo data, API routes
- `frontend/` — React + Vite frontend user interface
- `README.md` — this document

## 🔧 Setup Instructions

### 1. Backend
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with these values if you want MongoDB support:
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/libman_db
JWT_SECRET=your_jwt_secret
```

If `MONGODB_URI` is not set or MongoDB is unavailable, the backend falls back to the built-in demo data.

Start the backend:
```bash
npm run start
```

The backend listens on `http://localhost:8000` by default.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## 🧪 Backend Test
From `backend/`:
```bash
npm test
```

## 🔌 API Endpoints
- `POST /api/v1/auth/login` — login with email/password
- `GET /api/v1/auth/me` — current authenticated user
- `GET /api/v1/books` — list books, with optional `search` and `subject`
- `POST /api/v1/books` — add a new book
- `PUT /api/v1/books/:id` — update a book
- `DELETE /api/v1/books/:id` — delete a book
- `GET /api/v1/circulation` — get all circulation records
- `POST /api/v1/circulation/issue` — issue a book
- `POST /api/v1/circulation/return` — return a book

## 👤 Demo Accounts
Use these accounts for local testing:
- **Administrator**: `admin@libman.edu` / `admin123`
- **Library Staff**: `staff@libman.edu` / `staff123`
- **Student/Faculty**: `student@libman.edu` / `student123`

## 📝 Notes
- The frontend is built with Vite and Tailwind CSS.
- The backend can persist data to MongoDB when `MONGODB_URI` is configured.
- If MongoDB is unavailable, the backend still works with in-memory demo storage.

## 📌 Recommended Workflow
1. Start MongoDB locally or provide a MongoDB URI.
2. Run the backend from `backend/`.
3. Run the frontend from `frontend/`.
4. Open the frontend URL and log in with one of the demo accounts.

---

## 💡 Contact
For customization or deployment, edit `backend/server.js` and `frontend/src` as needed.

