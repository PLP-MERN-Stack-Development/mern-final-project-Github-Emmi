# 🚀 Quick Deployment Guide

## TL;DR - Deploy in 10 Minutes

### 1. Prepare (2 minutes)

```bash
cd backend
chmod +x pre-deploy-check.sh
./pre-deploy-check.sh
```

### 2. Push to GitHub (1 minute)

```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 3. Deploy to Render (7 minutes)

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   ```
   Name: emmidev-codebridge-api
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```
5. Add environment variables (see below)
6. Click **"Create Web Service"**

### 4. Essential Environment Variables

**Minimum required:**
```bash
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=click_generate
SESSION_SECRET=click_generate
FRONTEND_URL=https://your-frontend-url.vercel.app
```

**Get your Render URL, then update:**
```bash
GITHUB_CALLBACK_URL=https://your-api.onrender.com/api/auth/github/callback
LINKEDIN_CALLBACK_URL=https://your-api.onrender.com/api/auth/linkedin/callback
```

---

## MongoDB Atlas Setup (5 minutes)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free M0 cluster
3. Create database user
4. Network Access → Add IP: `0.0.0.0/0`
5. Copy connection string
6. Paste as `MONGODB_URI` in Render

---

## Testing Deployment

```bash
# Health check
curl https://your-api.onrender.com/health

# Should return:
# {"status":"OK","message":"EmmiDev-CodeBridge API is running"}
```

---

## Common Issues

**"Cannot connect to MongoDB"**
→ Check IP whitelist in MongoDB Atlas (must be `0.0.0.0/0`)

**"CORS Error"**
→ Verify `FRONTEND_URL` matches your deployed frontend exactly

**"OAuth redirect mismatch"**
→ Update callback URLs in GitHub/LinkedIn with your Render URL

---

## Full Documentation

See **[RENDER_DEPLOYMENT_GUIDE.md](../RENDER_DEPLOYMENT_GUIDE.md)** for complete step-by-step instructions.

---

## Support

- Render Docs: https://render.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Issues: Check deployment guide troubleshooting section
