# Quick Reference Guide

## ✅ What Was Done

### 1. Backend Environment Variables
Created [backend/.env](backend/.env) with:
- `PORT=3000` - Server port
- `HOST=0.0.0.0` - Allow network access
- `JWT_SECRET` - Token signing secret
- `ADMIN_PASSWORD` - Admin login password
- `SMS_API_URL` - SMS provider endpoint
- `SMS_API_KEY` - Your SMS API key
- `SMS_SENDER_ID` - Sender ID for SMS
- `SMS_GWID` - Gateway ID

### 2. Frontend Environment Variables  
Updated [frontend/.env](frontend/.env) with:
- `PORT=5656` - Frontend dev server port
- `REACT_APP_API_URL=http://localhost:3000/api` - Backend API URL

### 3. Code Updates
Updated [backend/server.js](backend/server.js):
- ✅ All hardcoded values replaced with environment variables
- ✅ Better error logging and startup info
- ✅ Fallback values for missing env vars
- ✅ Clean endpoint documentation on startup

### 4. Documentation
- ✅ Created `.env.example` files for both frontend and backend
- ✅ Created comprehensive README.md
- ✅ Added security notes and production warnings

## 🎯 Current Status

✅ Backend running on: http://localhost:3000
✅ Frontend running on: http://localhost:5656
✅ Environment variables properly configured
✅ All URLs centralized in .env files
✅ No hardcoded secrets in code
✅ Ready for development and testing

## 🔄 How to Use Different Environments

### Local Development (Current Setup)
```env
# frontend/.env
REACT_APP_API_URL=http://localhost:3000/api
```

### Network Testing (Mobile/Other Devices)
1. Find your PC IP: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update frontend/.env:
```env
REACT_APP_API_URL=http://192.168.1.5:3000/api
```
3. Restart frontend: `npm start`
4. Access from mobile: http://192.168.1.5:5656

### Production Deployment
1. Update backend/.env:
```env
JWT_SECRET=super_secure_random_string_here
ADMIN_PASSWORD=strong_password_here
SMS_API_KEY=your_production_api_key
```

2. Update frontend/.env:
```env
REACT_APP_API_URL=https://your-domain.com/api
```

## 🧪 Test the Setup

1. Open http://localhost:5656
2. Enter phone number (without country code)
3. Click "Send OTP"
4. Check backend terminal for OTP
5. Enter OTP and verify

## 📌 Important Files

| File | Purpose |
|------|---------|
| `backend/.env` | Backend configuration (SECRET - don't commit!) |
| `backend/.env.example` | Backend template (safe to commit) |
| `frontend/.env` | Frontend configuration (can commit if no secrets) |
| `frontend/.env.example` | Frontend template (safe to commit) |
| `backend/server.js` | Updated to use env vars |
| `README.md` | Full documentation |

## 🚨 Security Checklist for Production

- [ ] Change JWT_SECRET to strong random string
- [ ] Change ADMIN_PASSWORD to secure password  
- [ ] Add .env to .gitignore (don't commit secrets!)
- [ ] Use environment-specific .env files
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Implement OTP expiration
- [ ] Add request validation
- [ ] Use secure secret management (Azure Key Vault, AWS Secrets Manager, etc.)

## 💡 Pro Tips

1. **Never commit .env files** - Add to .gitignore
2. **Use .env.example** - Template for team members
3. **Environment-specific configs** - .env.development, .env.production
4. **Restart after .env changes** - Frontend needs restart to pick up REACT_APP_* changes
5. **Validate env vars on startup** - Check required vars exist before starting server
