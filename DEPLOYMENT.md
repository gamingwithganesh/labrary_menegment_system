# 🚀 Production Deployment Guide: LIB-MAN Enterprise

This guide covers complete step-by-step instructions for deploying LIB-MAN Enterprise in production environments for colleges, universities, or multi-tenant SaaS providers.

---

## 🏗️ Architecture Overview

LIB-MAN Enterprise is built on a unified Next.js fullstack architecture:
- **Frontend Layer**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion, Lucide Icons, Recharts.
- **Backend API Layer**: Next.js Server Route Handlers (`app/api/...`), JWT Authentication (`jsonwebtoken`), Password Hashing (`bcryptjs`).
- **Database Layer**: MongoDB via Mongoose with Connection Pooling & in-memory resilient fallback adapter.

---

## 📋 Pre-Deployment Checklist

- [x] Node.js 18.17+ or 20+ installed
- [x] MongoDB Atlas URI or self-hosted MongoDB instance (Optional: system runs with built-in high-performance fallback store)
- [x] Generated a strong 256-bit `JWT_SECRET`
- [x] Configured environment variables in `.env` or cloud provider dashboard
- [x] Validated production build (`npm run build`)
- [x] Verified automated tests (`npm test`)

---

## 🌐 Deployment Option 1: Vercel / Netlify (Recommended Serverless Deployment)

### Step 1: Import Project
1. Push repository to GitHub/GitLab.
2. In the Vercel / Netlify dashboard, select **New Project** and choose the repository.
3. Set **Root Directory** to `next-frontend` (if deploying from monorepo) or repository root.

### Step 2: Configure Environment Variables
In the Environment Variables settings, configure:
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://library.yourcollege.edu
MONGODB_URI=mongodb+srv://<db_user>:<db_pass>@cluster.mongodb.net/libman_production?retryWrites=true&w=majority
JWT_SECRET=YOUR_SUPER_SECURE_RANDOM_JWT_KEY_MIN_32_CHARS
DEFAULT_FINE_PER_DAY=10
DEFAULT_LOAN_DAYS=14
```

### Step 3: Deploy
Click **Deploy**. Next.js will automatically build and serve the application globally with edge caching.

---

## 🐳 Deployment Option 2: Docker Container

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run the Docker image:
```bash
docker build -t libman-enterprise:latest .
docker run -d -p 3000:3000 --env-file .env.production --name libman-app libman-enterprise:latest
```

---

## 🖥️ Deployment Option 3: VPS / Dedicated Server (Ubuntu / Debian with PM2 & NGINX)

### Step 1: Install Node.js, Git & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git
sudo npm install -g pm2
```

### Step 2: Clone and Build
```bash
git clone https://github.com/your-org/library-management-system.git /var/www/libman
cd /var/www/libman/next-frontend
npm install --production=false
cp .env.example .env
# Edit .env with your production credentials
nano .env
npm run build
```

### Step 3: Start Application with PM2
```bash
pm2 start npm --name "libman-production" -- start
pm2 save
pm2 startup
```

### Step 4: Configure NGINX Reverse Proxy & SSL
Create `/etc/nginx/sites-available/library.yourcollege.edu`:
```nginx
server {
    server_name library.yourcollege.edu;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and acquire SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/library.yourcollege.edu /etc/nginx/sites-enabled/
sudo certbot --nginx -d library.yourcollege.edu
sudo systemctl restart nginx
```

---

## 🔒 Security Best Practices for Production

1. **Rotate Default Passwords**: Change the default admin password (`admin123`) immediately after initial setup.
2. **Secrets Protection**: Never commit `.env` or `.env.production` files.
3. **CORS & HTTP Headers**: All Next.js API routes enforce secure content types, JSON sanitization, and strip password hashes.
4. **Rate Limiting**: When deploying behind NGINX or Cloudflare, enable WAF/rate-limiting on `/api/auth/login`.
5. **Database Backups**: Run `npm run backup` or set up automated MongoDB Atlas daily automated snapshot backups.

---

## 🩺 Post-Deployment Verification

Check system health:
```bash
curl -i https://library.yourcollege.edu/api/health
```
Expected response:
```json
{
  "success": true,
  "message": "System is healthy and operational",
  "data": {
    "status": "healthy",
    "system": "LIB-MAN Enterprise Library Management System",
    "version": "2.0.0",
    "database": {
      "connected": true
    }
  }
}
```
