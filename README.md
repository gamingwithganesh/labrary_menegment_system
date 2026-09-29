# 📚 LIB-MAN Enterprise: Production Library Management System

[![Production Build](https://img.shields.io/badge/Build-Passing-emerald.svg)](#)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-indigo.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-purple.svg)](https://tailwindcss.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%2F%20Mongoose-green.svg)](https://mongoosejs.com/)
[![License](https://img.shields.io/badge/License-MIT-slate.svg)](#)

**LIB-MAN Enterprise** is a complete, production-ready, cloud-enabled Library Management System designed for colleges, universities, and multi-campus academic institutions.

---

## 🚀 Key Modules & Architecture

1. **OPAC (Online Public Access Catalog)**:
   - Real-time catalog search by Title, Author, ISBN, or Subject Category.
   - Availability tracking (available copy counts, rack locations, return due dates).
   - Instant book reservation and hold placement.
2. **Cataloguing & Smart Tagging**:
   - Accession registration form with automated barcode & ISO/IEC 18004 2D QR Code label generation.
   - Vendor purchase orders (POs) management and item verification.
3. **Circulation Desk & Fine Calculation**:
   - Fast book issue and return processing.
   - Automated overdue fine computation (₹10/day standard rate).
   - Borrower verification and active loan tracking.
4. **Student Portal & Digital BT Pass**:
   - Borrower ticket pass (BT Card) with scannable QR verification at `/verify-pass`.
   - Personal issued books dashboard, return due dates, and 1-click renewal requests.
5. **Periodicals & Serials Control**:
   - Journal subscriptions, ISSN codes, arrival issue logs, and publisher renewal tracker.
6. **Executive MIS Analytics**:
   - Dynamic real-time metrics computed directly from database holdings, circulation logs, and overdue records.
   - Interactive Recharts monthly comparison charts and departmental utilization breakdown.
7. **Institutional Governance & User Management**:
   - Role-Based Access Control (RBAC) with bcrypt password hashing and JWT authentication.
   - Campus user directory and library configuration settings.
8. **Super Admin SaaS Multi-College Control**:
   - Multi-tenant college onboarding, pricing tiers (₹12,000, ₹15,000, ₹20,000), duration control (6/12/24 Months), live ping monitors, and global broadcast announcements.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (Turbopack, App Router)](https://nextjs.org/)
- **UI Engine**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide Icons](https://lucide.dev/)
- **Visual Analytics**: [Recharts](https://recharts.org/)
- **Authentication & Security**: [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Database Layer**: [Mongoose](https://mongoosejs.com/) with connection pooling and resilient in-memory storage fallback.
- **Tagging Engine**: [qrcode](https://github.com/soldair/node-qrcode)

---

## ⚡ Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-org/library-management-system.git
cd library-management-system/next-frontend
npm install
```

### 2. Environment Variables Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your environment variables:
```env
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/libman_db
JWT_SECRET=your_super_secret_jwt_key_2026
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 Default Accounts

The system automatically initializes default accounts on first run:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@libman.edu` | `admin123` | SaaS Multi-College Master Panel & Global Broadcasts |
| **Admin** | `admin@libman.edu` | `admin123` | Campus User Management, System Settings & All Modules |
| **Librarian** | `librarian@libman.edu` | `admin123` | OPAC, Cataloguing, Circulation Desk, Serials, MIS |
| **Student/Faculty** | `student@libman.edu` | `admin123` | Digital BT Card Pass, My Books, OPAC Search |

> **Note**: Change passwords immediately upon initial production deployment.

---

## 🧪 Testing & Production Build

### Run Automated End-to-End Test Suite
```bash
npm test
```
Runs 23 comprehensive tests covering:
- Health check endpoint verification
- Authentication & JWT issuance
- Invalid credential rejection (401)
- Book cataloging, search, and deletion
- Circulation issue and return workflow
- Overdue fine calculation
- Executive MIS metrics computation
- Super Admin multi-college SaaS controls

### Production Build
```bash
npm run build
npm start
```

---

## 📦 Database Backup & Recovery

Create a snapshot backup of all catalog records, circulation logs, and user directory:
```bash
npm run backup
```
Backups are saved to `backups/libman_backup_<timestamp>.json`.

---

## 🚢 Deployment

For detailed production deployment instructions with Vercel, Docker, or Ubuntu NGINX/PM2, refer to [DEPLOYMENT.md](file:///Users/ganeshhome/Documents/Projects/labrary-manegment-system/DEPLOYMENT.md).

---

## 📄 License
Released under the MIT License.
