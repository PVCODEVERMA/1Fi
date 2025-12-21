# Production Deployment Guide

## Quick Deployment

### 1. Backend Setup

```bash
cd server
npm install --production
npm start
```

Backend runs on `http://localhost:5000`

### 2. Frontend Deployment

The production frontend build is already created in `client/build/`

**Option A: Serve with Node**
```bash
npx serve -s client/build
```

**Option B: Serve with Any HTTP Server**
- Copy `client/build/` to your web server
- Point your web server root to this folder
- Ensure API_URL points to your backend

**Option C: Docker**
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY client/build ./build
EXPOSE 3000
CMD ["npx", "serve", "-s", "build"]
```

### 3. Environment Configuration

Update `.env` files for production:

**server/.env**
```
MONGODB_URI=mongodb://prod-host:27017/lamf_lms
JWT_SECRET=generate_secure_random_key
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

**client/.env** (or rebuild with new API_URL)
```
REACT_APP_API_URL=https://api.yourdomain.com
```

### 4. Start Services

```bash
# Terminal 1: MongoDB
mongod --dbpath /data/db

# Terminal 2: Backend
cd server && npm start

# Terminal 3: Frontend
npx serve -s client/build
```

## Checklist

- [ ] MongoDB running
- [ ] Backend running on port 5000
- [ ] Frontend served and accessible
- [ ] API calls reaching backend
- [ ] Login working with demo credentials
- [ ] Database contains sample data

## Demo Credentials

```
Email: borrower1@example.com
Password: user@123
```

## Troubleshooting

**502 Bad Gateway**: Backend not running
**CORS Error**: Update CORS_ORIGIN in server/.env
**404 Not Found**: Frontend not serving correctly
**Connection refused**: MongoDB not running
