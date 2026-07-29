# 📚 LIB-MAN: College Library Management System

LIB-MAN is a production-ready, multi-user Library Management Web Application engineered for colleges, universities, and educational institutions.

## 🚀 Technology Stack
- **Backend**: Python 3, FastAPI, Motor (Async Driver), Pydantic v2, PyMongo, JWT Auth (passlib/bcrypt).
- **Frontend**: React 18, Vite, Tailwind CSS v3, Recharts, Lucide Icons.
- **Database**: MongoDB (MongoDB Atlas or Local MongoDB `mongodb://localhost:27017/libman_db` ready for **MongoDB Compass**).

---

## 🏛️ Core System Modules

1. **Authentication & Role-Based Access Control (RBAC)**
   - Supports 3 roles: **Administrator**, **Library Staff**, and **Student/Faculty Member**.
   - Includes quick-role switcher in header for easy evaluation.

2. **Module 1: Acquisition & Cataloguing**
   - Accession Register logs, book inventory, instant ISBN metadata auto-lookup, vendor details, Purchase Orders (POs), and invoicing.

3. **Module 2: Circulation (Issue, Return & Fines)**
   - Book check-outs, return processing, hold reservations, and **automated daily fine calculations ($2.00/day)**.

4. **Module 3: OPAC (Online Public Access Catalogue)**
   - Public search portal with real-time filtering by Title, Author, Subject, ISBN, Accession Number, and Shelf Location.

5. **Module 4: Serial Control**
   - Magazine and academic journal subscriptions, non-receipt issue reminders, daily newspaper receipt log, and bound volume registry.

6. **Module 5: MIS Reports & Analytics**
   - Executive dashboard with interactive Recharts graphics covering document utilization rates, budget consumption, loss/withdrawal audit trail, and exportable Accession Register reports.

---

## 🛠️ Quick Start Guide

### 1. Database & Seed Data (MongoDB Compass Ready)
Ensure your MongoDB instance is running locally at `mongodb://localhost:27017` (or set `MONGODB_URI` in `.env`).

Seed initial demo data into MongoDB:
```bash
cd backend
python3 seed.py
```
> **MongoDB Compass Connection String**: `mongodb://localhost:27017`  
> Open MongoDB Compass and explore database: `libman_db` (Collections: `users`, `books`, `circulations`, `acquisitions`, `serials`, `mis_logs`).

### 2. Start Backend API (FastAPI)
```bash
cd backend
pip3 install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Documentation (Swagger UI): `http://localhost:8000/docs`

### 3. Start Frontend UI (React + Tailwind)
```bash
cd frontend
npm install
npm run dev
```
- Frontend UI: `http://localhost:3000`

---

## 🔐 Credentials & Demo Accounts
- **Admin**: `admin@libman.edu` (Pass: `admin123`)
- **Library Staff**: `staff@libman.edu` (Pass: `staff123`)
- **Student**: `student@libman.edu` (Pass: `student123`)
# labrary-manegment-system
