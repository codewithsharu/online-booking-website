# 🏥 Online Appointment Booking System

Full-stack appointment booking web application with SMS OTP authentication. Built with React and Node.js, optimized for Vercel deployment.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/codewithsharu/online-booking-website)

## ✨ Features

- 📱 **SMS OTP Authentication** - Secure login via SMS India Hub API
- 🔐 **JWT Sessions** - Token-based authentication
- 👨‍💼 **Admin Dashboard** - Separate admin panel with password login
- 📲 **Mobile Responsive** - Works seamlessly on all devices
- ⚡ **Fast Deployment** - One-click Vercel deployment
- 🔒 **Secure** - Environment-based configuration

## 🛠️ Tech Stack

**Frontend:**
- React 18
- React Router v6
- Modern CSS

**Backend:**
- Node.js + Express
- JWT Authentication
- Axios (SMS API integration)
- CORS enabled

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/codewithsharu/online-booking-website.git
   cd online-booking-website
   ```

2. **Set up environment variables**
   ```bash
   # Copy example file
   cp .env.example .env
   
   # Edit .env and add your SMS API key
   ```

3. **Install and run backend**
   ```bash
   cd backend
   npm install
   npm start
   # Runs on http://localhost:3000
   ```

4. **Install and run frontend**
   ```bash
   cd frontend
   npm install
   npm start
   # Runs on http://localhost:5656
   ```

## 🌐 Deploy to Vercel

### One-Click Deploy

Click the button above or visit:
https://vercel.com/new/clone?repository-url=https://github.com/codewithsharu/online-booking-website

### Manual Deploy

1. **Push to GitHub** (already done! ✅)

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Select your repository
   - Click Import

3. **Add Environment Variables**
   ```
   JWT_SECRET=your_strong_secret
   ADMIN_PASSWORD=your_password
   SMS_API_KEY=your_sms_api_key
   SMS_API_URL=http://cloud.smsindiahub.in/vendorsms/pushsms.aspx
   SMS_SENDER_ID=SMSHUB
   SMS_GWID=2
   REACT_APP_API_URL=/api
   ```

4. **Deploy!** 🚀

📖 **Full deployment guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)

## 📁 Project Structure

```
online-booking-website/
├── frontend/              # React application
│   ├── public/
│   ├── src/
│   │   ├── App.js        # Main app component
│   │   ├── Login.js      # OTP login
│   │   ├── Home.js       # User home
│   │   ├── Admin.js      # Admin dashboard
│   │   └── ...
│   └── package.json
├── backend/              # Express API
│   ├── server.js         # API server
│   └── package.json
├── vercel.json           # Vercel config
├── .env.example          # Environment template
├── .gitignore
└── README.md
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/send-otp` | Send OTP to phone |
| POST | `/api/verify-otp` | Verify OTP |
| POST | `/api/admin-login` | Admin login |
| GET | `/api/user` | Get user (protected) |
| GET | `/api/admin` | Admin data (protected) |

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

```env
# Security
JWT_SECRET=your_jwt_secret
ADMIN_PASSWORD=your_admin_password

# SMS API
SMS_API_URL=http://cloud.smsindiahub.in/vendorsms/pushsms.aspx
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=SMSHUB
SMS_GWID=2

# Frontend
REACT_APP_API_URL=http://localhost:3000/api  # Local
# REACT_APP_API_URL=/api  # Production
```

## 📱 Phone Number Format

- Must include country code (12 digits)
- Example: `917816072525` (91 = India)
- Frontend auto-adds country code

## 🛡️ Security

**Production Checklist:**
- ✅ Strong JWT_SECRET (32+ characters)
- ✅ Secure ADMIN_PASSWORD
- ✅ HTTPS enabled (automatic on Vercel)
- ✅ Environment variables in Vercel dashboard
- ✅ `.env` files in `.gitignore`

## 📚 Documentation

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Local development setup
- [DEPLOYMENT.md](DEPLOYMENT.md) - Vercel deployment guide
- [DEPLOY_NOW.txt](DEPLOY_NOW.txt) - Quick deployment checklist

## 🐛 Troubleshooting

**API 404 Error?**
- Check `REACT_APP_API_URL` in environment
- Should be `/api` for Vercel
- Should be `http://localhost:3000/api` for local

**SMS Not Sending?**
- Verify `SMS_API_KEY` is correct
- Check SMS provider account
- OTP is logged in console for testing

**Build Failing?**
- Check Vercel build logs
- Verify all environment variables are set
- Test build locally: `npm run build`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use for personal and commercial projects

## 👨‍💻 Author

**Sharu**
- GitHub: [@codewithsharu](https://github.com/codewithsharu)
- Repository: [online-booking-website](https://github.com/codewithsharu/online-booking-website)

## 🙏 Acknowledgments

- SMS India Hub for SMS services
- Vercel for hosting platform
- React team for the framework

---

⭐ **Star this repo** if you find it helpful!

🚀 **Deploy now** and have your booking system live in minutes!

📧 **Issues?** Open an issue on GitHub

---

Made with ❤️ by [Sharu](https://github.com/codewithsharu)
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
