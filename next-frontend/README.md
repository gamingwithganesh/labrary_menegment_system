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

1. **OPAC (Online Public Access Catalog)**: Real-time search, availability tracking, and book holds.
2. **Cataloguing & Smart Tagging**: Accessioning, barcode & ISO/IEC 18004 2D QR Code sticker generator.
3. **Circulation Desk & Fine Calculation**: Fast book issue, return, and automated overdue fine computation.
4. **Student Portal & Digital BT Pass**: Borrower ticket pass (BT Card) with scannable QR verification at `/verify-pass`.
5. **Periodicals & Serials Control**: Journal subscriptions, ISSN, arrival logs, and renewal tracking.
6. **Executive MIS Analytics**: Real-time metrics computed directly from database records with interactive charts.
7. **Institutional Governance & RBAC**: Admin user management, roles, and settings.
8. **Super Admin SaaS Multi-College Control**: Multi-tenant directory, subscription tier pricing, and broadcasts.

---

## ⚡ Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Run Automated Tests
```bash
npm test
```

### Production Build
```bash
npm run build
npm start
```

### Database Backup
```bash
npm run backup
```
