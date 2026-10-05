# 🚀 LIB-MAN Enterprise: Deployment Guide

## Production Environment Prerequisites
- Node.js 18.x or 20.x LTS
- MongoDB Atlas or self-hosted MongoDB 6.0+ cluster
- Domain with SSL/TLS certificate

## Environment Variables (`.env.production`)
```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://library.yourinstitution.edu
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/libman_prod?retryWrites=true&w=majority
JWT_SECRET=production_enterprise_super_secure_key_2026
SUPER_ADMIN_ID=admin
SUPER_ADMIN_PASSWORD=your_strong_admin_password
```

## PM2 & Docker Deployment

### A. PM2 Process Manager
```bash
cd next-frontend
npm ci
npm run build
pm2 start npm --name "libman-enterprise" -- start
```

### B. Docker Container
```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```
