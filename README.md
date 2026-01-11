# Appointment Booking System

## 🚀 Quick Start

### Backend Setup
1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update `SMS_API_KEY` with your actual API key
   - Change `JWT_SECRET` and `ADMIN_PASSWORD` for production

4. Start the server:
   ```bash
   npm start
   ```
   Server will run on http://localhost:3000

### Frontend Setup
1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update `REACT_APP_API_URL` if needed:
     - Local: `http://localhost:3000/api`
     - Network: `http://YOUR_PC_IP:3000/api`

4. Start the development server:
   ```bash
   npm start
   ```
   Frontend will run on http://localhost:5656

## 📁 Environment Variables

### Backend (.env)
```env
PORT=3000                    # Server port
HOST=0.0.0.0                # Server host (0.0.0.0 for network access)
JWT_SECRET=your_secret       # JWT signing secret (change in production!)
ADMIN_PASSWORD=admin123      # Admin login password (change in production!)
SMS_API_URL=...             # SMS provider API URL
SMS_API_KEY=...             # Your SMS API key
SMS_SENDER_ID=SMSHUB        # SMS sender ID
SMS_GWID=2                  # SMS gateway ID
```

### Frontend (.env)
```env
PORT=5656                           # Frontend dev server port
REACT_APP_API_URL=http://localhost:3000/api  # Backend API URL
```

## 🔧 Network Testing (Mobile/Other Devices)

1. Find your PC's IP address:
   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.5)
   ```

2. Update frontend `.env`:
   ```env
   REACT_APP_API_URL=http://192.168.1.5:3000/api
   ```

3. Restart frontend dev server

4. Access from mobile: http://192.168.1.5:5656

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/send-otp` | Send OTP to phone | No |
| POST | `/api/verify-otp` | Verify OTP and login | No |
| POST | `/api/admin-login` | Admin login | No |
| GET | `/api/user` | Get user info | Yes (JWT) |
| GET | `/api/admin` | Admin dashboard | Yes (Admin JWT) |

## 🔐 Security Notes

**IMPORTANT FOR PRODUCTION:**
- Change `JWT_SECRET` to a strong random string
- Change `ADMIN_PASSWORD` to a secure password
- Use HTTPS
- Add rate limiting
- Implement OTP expiration
- Store sensitive data in secure vault (not .env in repo)
- Add input validation and sanitization

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- JWT for authentication
- Axios for SMS API calls
- CORS enabled

**Frontend:**
- React 18
- React Router v6
- Fetch API

## 📝 Phone Number Format

Phone numbers must be 12 digits including country code:
- Example: `917816072525` (91 = India country code)
- Frontend automatically prepends `91`

## 🐛 Troubleshooting

**404 Error on /send-otp:**
- Ensure backend is running on correct port
- Check `REACT_APP_API_URL` includes `/api` suffix
- Restart frontend after changing `.env`

**SMS Not Sending:**
- Verify `SMS_API_KEY` is correct
- Check SMS provider account status
- OTP is still stored in memory for testing even if SMS fails

**CORS Errors:**
- Backend has CORS enabled by default
- Ensure backend is accessible from frontend URL
