# Vercel Deployment Guide

## 🎯 Overview

This guide will help you deploy your appointment booking system to Vercel with both frontend and backend working seamlessly.

## 📋 Pre-Deployment Checklist

- [ ] SMS India Hub API key ready
- [ ] Strong JWT secret generated
- [ ] Secure admin password chosen
- [ ] GitHub account with repository access
- [ ] Vercel account created (free tier works)

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Code

✅ Already done! Your project is configured with:
- `vercel.json` - Deployment configuration
- `.gitignore` - Excludes sensitive files
- Unified environment variables
- Optimized build scripts

### Step 2: Push to GitHub

```bash
# Initialize git (if not done)
cd "f:\appointment booking"
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Full-stack appointment booking system"

# Add remote repository
git remote add origin https://github.com/codewithsharu/online-booking-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)

1. **Login to Vercel:**
   - Go to https://vercel.com
   - Sign in with GitHub

2. **Import Project:**
   - Click "Add New Project"
   - Select "Import Git Repository"
   - Choose `codewithsharu/online-booking-website`

3. **Configure Project:**
   - Framework Preset: `Other` (we have custom config)
   - Root Directory: `./` (leave as is)
   - Build Command: (leave default)
   - Output Directory: (leave default)

4. **Add Environment Variables:**
   Click "Environment Variables" and add:

   ```
   JWT_SECRET = your_strong_random_secret_minimum_32_characters
   ADMIN_PASSWORD = your_secure_admin_password
   SMS_API_URL = http://cloud.smsindiahub.in/vendorsms/pushsms.aspx
   SMS_API_KEY = f1af4eb84ee84103bb7ea19cb9459ccf
   SMS_SENDER_ID = SMSHUB
   SMS_GWID = 2
   REACT_APP_API_URL = /api
   NODE_ENV = production
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

#### Option B: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login
vercel login

# Deploy
cd "f:\appointment booking"
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? online-booking-website
# - Directory? ./ 
# - Override settings? N

# Add environment variables via CLI
vercel env add JWT_SECRET
# (paste your secret when prompted)
# Select all environments

# Repeat for all variables:
vercel env add ADMIN_PASSWORD
vercel env add SMS_API_URL
vercel env add SMS_API_KEY
vercel env add SMS_SENDER_ID
vercel env add SMS_GWID
vercel env add REACT_APP_API_URL
# (enter: /api)

# Deploy to production
vercel --prod
```

### Step 4: Verify Deployment

1. **Check Build Logs:**
   - Go to Vercel dashboard
   - Click on your deployment
   - Check "Building" and "Deployment" logs
   - Look for any errors

2. **Test Frontend:**
   - Open your Vercel URL: `https://your-project.vercel.app`
   - Should see login page
   - Check browser console for errors (F12)

3. **Test Backend API:**
   - Test endpoint: `https://your-project.vercel.app/api/send-otp`
   - Use Postman or curl:
   ```bash
   curl -X POST https://your-project.vercel.app/api/send-otp \
     -H "Content-Type: application/json" \
     -d '{"phone":"917816072525"}'
   ```

4. **Test Full Flow:**
   - Enter phone number on login page
   - Click "Send OTP"
   - Check if OTP is sent
   - Verify OTP and login

## 🔧 Configuration Details

### vercel.json Explained

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",  // Builds React app
      "config": { "distDir": "build" }
    },
    {
      "src": "backend/server.js",
      "use": "@vercel/node"  // Deploys as serverless function
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"  // API routes to backend
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"  // All other routes to frontend
    }
  ]
}
```

### Environment Variables

**Production Values (Vercel):**
- `REACT_APP_API_URL=/api` ← Use relative path
- `NODE_ENV=production` ← Enables optimizations

**Local Development:**
- `REACT_APP_API_URL=http://localhost:3000/api`
- `NODE_ENV=development`

## 🔄 Continuous Deployment

Once set up, Vercel automatically:
- ✅ Deploys on every push to `main` branch
- ✅ Creates preview deployments for pull requests
- ✅ Runs build checks
- ✅ Provides deployment URLs

To deploy updates:
```bash
git add .
git commit -m "Your update message"
git push origin main
# Vercel deploys automatically!
```

## 🐛 Common Issues & Solutions

### Issue: Build Fails

**Solution:**
```bash
# Test build locally first
cd frontend
npm run build

cd ../backend
npm install
```

### Issue: API Returns 404

**Cause:** Environment variables not set  
**Solution:**
1. Go to Vercel dashboard
2. Settings > Environment Variables
3. Add missing variables
4. Redeploy: Deployments > ... > Redeploy

### Issue: CORS Errors

**Cause:** CORS configuration  
**Solution:** Update backend/server.js:
```javascript
app.use(cors({
  origin: ['https://your-domain.vercel.app'],
  credentials: true
}));
```

### Issue: SMS Not Sending

**Cause:** SMS API key invalid or rate limit  
**Solution:**
1. Verify SMS_API_KEY in Vercel env vars
2. Check SMS provider dashboard
3. OTP is still stored in memory for testing

### Issue: JWT Token Errors

**Cause:** JWT_SECRET not set or mismatch  
**Solution:**
1. Verify JWT_SECRET in Vercel env vars
2. Must be same across all deployments
3. Redeploy after adding

## 📊 Monitoring Your Deployment

### Vercel Dashboard

**Analytics:**
- View page visits
- Monitor API calls
- Check response times

**Logs:**
- Real-time function logs
- Error tracking
- Build logs

**Access:**
- Go to dashboard.vercel.com
- Select your project
- Click on tabs: Analytics, Logs, Settings

### Setting Up Monitoring

```bash
# Install Vercel CLI
npm install -g vercel

# View logs in real-time
vercel logs your-project-name --follow

# View specific deployment logs
vercel logs your-deployment-url
```

## 🔒 Security Checklist

Before going live:
- [ ] Changed JWT_SECRET from default
- [ ] Set strong ADMIN_PASSWORD
- [ ] Verified SMS_API_KEY is correct
- [ ] Added rate limiting (optional but recommended)
- [ ] Tested OTP expiration
- [ ] Reviewed CORS settings
- [ ] Enabled HTTPS (automatic on Vercel)
- [ ] Set up error monitoring
- [ ] Configured custom domain (optional)

## 🌐 Custom Domain Setup

1. **Buy a domain** (Namecheap, GoDaddy, etc.)

2. **Add to Vercel:**
   - Go to your project
   - Settings > Domains
   - Add domain: `yourdomain.com`

3. **Configure DNS:**
   - Add A record: `76.76.21.21`
   - Add CNAME: `cname.vercel-dns.com`

4. **Update environment:**
   ```bash
   vercel env add REACT_APP_API_URL production
   # Enter: https://yourdomain.com/api
   ```

5. **Redeploy**

## 🎉 You're Live!

Your appointment booking system is now deployed and accessible worldwide!

**Share your deployment:**
- Frontend: `https://your-project.vercel.app`
- API: `https://your-project.vercel.app/api`

## 🆘 Need Help?

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- GitHub Issues: https://github.com/codewithsharu/online-booking-website/issues

---

Happy Deploying! 🚀
