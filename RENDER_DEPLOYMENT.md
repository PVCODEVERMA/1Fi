# LAMF LMS - Render Deployment Guide

## 🚀 Deployment Issues & Fixes

### Issue: "No matching version found for jsonwebtokena^9.1.2"

**Problem**: Render can't find package version because of typo in package name or corrupted node_modules.

**Solutions**:

#### Solution 1: Clean Install on Render
```bash
# In Render build command, use:
rm -rf node_modules package-lock.json && npm install
```

#### Solution 2: Clear Cache & Reinstall Locally
```bash
# On your machine:
cd server
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
git add package-lock.json
git commit -m "Fix: Clean node_modules and package-lock.json"
git push
```

---

## 📋 Complete Render Deployment Setup

### Step 1: Create New Web Service on Render

1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect GitHub repository
4. Select your repo branch: `mohit/dev/1Fi`

---

### Step 2: Configure Server (Backend)

**Name**: `lamf-lms-backend`

**Environment**: `Node`

**Build Command**:
```bash
cd server && rm -rf node_modules package-lock.json && npm install
```

**Start Command**:
```bash
node server/src/index.js
```

**Environment Variables**:
```
MONGODB_URI=mongodb+srv://ma7693849_db_user:1DhSb34lg8QgBgZO@1fi.efrqqhx.mongodb.net/lamf_lms?appName=1Fi&retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_123456789
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-render-url.onrender.com
API_VERSION=v1
LOG_LEVEL=info
```

---

### Step 3: Configure Client (Frontend)

**Name**: `lamf-lms-frontend`

**Environment**: `Static Site`

**Build Command**:
```bash
cd client && npm install && npm run build
```

**Publish Directory**: `client/build`

**Environment Variables**:
```
REACT_APP_API_URL=https://your-backend-render-url.onrender.com
REACT_APP_ENV=production
```

---

### Step 4: Environment Variables Explained

#### Backend (.env)
```dotenv
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?options

# Security
JWT_SECRET=complex-random-string-min-32-characters-recommended
NODE_ENV=production

# Server
PORT=5000

# CORS (Allow frontend domain)
CORS_ORIGIN=https://lamf-lms-frontend-xxx.onrender.com

# Logging
LOG_LEVEL=info
```

#### Frontend (.env)
```dotenv
# Must start with REACT_APP_
REACT_APP_API_URL=https://lamf-lms-backend-xxx.onrender.com
REACT_APP_ENV=production
```

---

## ✅ Checklist Before Deployment

- [ ] MongoDB Atlas cluster is running
- [ ] Database user credentials are correct
- [ ] CORS_ORIGIN set to frontend URL (not localhost)
- [ ] JWT_SECRET is secure (min 32 characters)
- [ ] NODE_ENV=production
- [ ] REACT_APP_API_URL points to backend Render URL
- [ ] All dependencies in package.json are correct
- [ ] No typos in package names
- [ ] .gitignore includes .env files
- [ ] package-lock.json is committed

---

## 🔧 Common Render Deployment Errors

### Error 1: "No matching version found for..."
**Cause**: Corrupted package-lock.json or npm cache
**Fix**: 
```bash
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git push
```

### Error 2: "Cannot find module 'jsonwebtoken'"
**Cause**: Dependencies not installed
**Fix**: Make sure `npm install` is in build command

### Error 3: "PORT not available"
**Cause**: Using hardcoded port in code
**Fix**: Use `process.env.PORT || 5000` in server

### Error 4: "CORS error" in browser
**Cause**: CORS_ORIGIN doesn't match frontend URL
**Fix**: Update CORS_ORIGIN to actual Render frontend URL

### Error 5: "MongoDB connection refused"
**Cause**: Render IP not whitelisted in MongoDB Atlas
**Fix**: In MongoDB Atlas:
  1. Go to Network Access
  2. Click "Add IP Address"
  3. Select "Allow Access from Anywhere" (0.0.0.0/0)
  4. Or add Render's IP range

---

## 📊 Verify Deployment

### Test Backend
```bash
curl https://your-backend-url.onrender.com/api/health
# Should return: { "status": "Server is running", ... }
```

### Test Frontend
```bash
# Visit: https://your-frontend-url.onrender.com
# Should load app and connect to backend
```

### Check Logs
1. Go to Render dashboard
2. Click your service
3. Click "Logs" tab
4. Watch real-time logs

---

## 🚀 How to Redeploy

### From Render Dashboard
1. Go to service
2. Click "Manual Deploy" → "Deploy latest commit"

### From Git
```bash
git commit -m "Update: deployment fix"
git push
# Render auto-deploys when you push to selected branch
```

---

## 📌 Free Tier Limits (Render)

- **Auto-sleep**: Service sleeps after 15 min inactivity (wake up ~30 sec)
- **Build minutes**: 500/month
- **Bandwidth**: 100GB/month
- **Database**: Use MongoDB Atlas (free tier available)

**Note**: Upgrade to Pro ($12/month) to remove auto-sleep

---

## 🔐 Production Security Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Enable HTTPS (Render auto-enables)
- [ ] Set NODE_ENV=production
- [ ] Enable MongoDB password authentication
- [ ] Add IP whitelist to MongoDB
- [ ] Use environment variables (never hardcode secrets)
- [ ] Enable rate limiting on APIs
- [ ] Add logging and monitoring
- [ ] Backup MongoDB regularly
- [ ] Set up error tracking (Sentry optional)

---

## 📞 Support

If deployment fails:

1. Check Render build logs
2. Verify all environment variables
3. Test locally with same config
4. Check MongoDB connection
5. Contact Render support: support@render.com

---

**Last Updated**: December 22, 2025
**Status**: Production Ready
