# Online Booking Website

Full-stack appointment booking system with SMS OTP authentication, built with React and Node.js. Optimized for Vercel deployment.

## 🚀 Live Demo

**Frontend**: [Your Vercel URL]  
**Backend API**: [Your Vercel URL]/api

## 📋 Features

- 📱 SMS OTP Authentication (SMS India Hub)
- 🔐 JWT-based user sessions
- 👨‍💼 Admin dashboard with password login
- 📲 Mobile-responsive design
- ⚡ Fast deployment on Vercel
- 🔒 Secure environment variable management

## 🛠️ Tech Stack

**Frontend:**
- React 18
- React Router v6
- Fetch API

**Backend:**
- Node.js + Express
- JWT Authentication
- Axios for SMS API
- CORS enabled

## 📁 Project Structure

```
online-booking-website/
├── frontend/           # React application
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── Login.js
│   │   ├── Home.js
│   │   ├── Admin.js
│   │   └── ...
│   └── package.json
├── backend/            # Express API server
│   ├── server.js
│   └── package.json
├── vercel.json         # Vercel deployment config
├── .env.example        # Environment variables template
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ installed
- SMS India Hub API key
- Git installed

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/codewithsharu/online-booking-website.git
   cd online-booking-website
   ```

2. **Setup environment variables:**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your SMS API key and other configs
   ```

3. **Install and run backend:**
   ```bash
   cd backend
   npm install
   npm start
   # Backend runs on http://localhost:3000
   ```

4. **Install and run frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   # Frontend runs on http://localhost:5656
   ```

5. **Access the application:**
   - Frontend: http://localhost:5656
   - Backend API: http://localhost:3000/api

## 🌐 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/codewithsharu/online-booking-website)

### Manual Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set Environment Variables in Vercel Dashboard:**
   - Go to your project on Vercel
   - Navigate to: Settings > Environment Variables
   - Add all variables from `.env.example`:
     - `JWT_SECRET`
     - `ADMIN_PASSWORD`
     - `SMS_API_URL`
     - `SMS_API_KEY`
     - `SMS_SENDER_ID`
     - `SMS_GWID`
     - `REACT_APP_API_URL=/api` (Use relative path for production)

5. **Redeploy after adding environment variables:**
   ```bash
   vercel --prod
   ```

## 🔐 Environment Variables

Create a `.env` file in the root directory (use `.env.example` as template):

```env
# Security
JWT_SECRET=your_strong_random_secret_here
ADMIN_PASSWORD=your_admin_password

# SMS API Configuration
SMS_API_URL=http://cloud.smsindiahub.in/vendorsms/pushsms.aspx
SMS_API_KEY=your_sms_api_key_here
SMS_SENDER_ID=SMSHUB
SMS_GWID=2

# Frontend API URL
REACT_APP_API_URL=http://localhost:3000/api  # Local development
# REACT_APP_API_URL=/api  # Production (Vercel)
```

### Vercel Environment Variables Setup

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable with appropriate scope (Production, Preview, Development)

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/send-otp` | Send OTP to phone number | No |
| POST | `/api/verify-otp` | Verify OTP and login | No |
| POST | `/api/admin-login` | Admin authentication | No |
| GET | `/api/user` | Get user profile | JWT |
| GET | `/api/admin` | Admin dashboard | Admin JWT |

## 📱 Phone Number Format

- Phone numbers must include country code (12 digits)
- Example: `917816072525` (91 = India)
- Frontend automatically adds country code

## 🔧 Configuration Files

### `vercel.json`
Configures Vercel to serve both frontend and backend:
- Routes API requests to `/api/*` to backend
- Serves frontend static files for all other routes
- Enables serverless function deployment

### `.gitignore`
Excludes sensitive files from version control:
- `.env` files (secrets)
- `node_modules/`
- Build outputs
- Logs and cache files

## 🛡️ Security Best Practices

**For Production:**
- ✅ Change `JWT_SECRET` to a strong random string (32+ characters)
- ✅ Use a secure `ADMIN_PASSWORD`
- ✅ Enable HTTPS (automatic on Vercel)
- ✅ Add rate limiting for API endpoints
- ✅ Implement OTP expiration (e.g., 5 minutes)
- ✅ Use environment variables for all secrets
- ✅ Never commit `.env` files to git
- ✅ Enable CORS only for your domain
- ✅ Add input validation and sanitization
- ✅ Monitor API usage and logs

## 📝 Development Workflow

1. **Create a new feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and test locally**

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add your feature"
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request on GitHub**

5. **Deploy to Vercel:**
   - Vercel automatically deploys on push to main branch
   - Preview deployments for pull requests

## 🐛 Troubleshooting

### API 404 Errors
- Ensure `REACT_APP_API_URL` is correct
- For Vercel, use `/api` (relative path)
- For local dev, use `http://localhost:3000/api`
- Restart frontend after changing env vars

### SMS Not Sending
- Verify SMS_API_KEY is correct
- Check SMS provider account status
- OTP is logged in backend console for testing

### Vercel Build Failures
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify environment variables are set correctly

### CORS Issues
- Backend CORS is enabled for all origins by default
- Restrict in production to your domain only

## 📊 Monitoring & Logs

**Vercel Dashboard:**
- View deployment logs
- Monitor function invocations
- Check error rates
- View analytics

**Local Development:**
- Backend logs: Terminal running `npm start` in backend folder
- Frontend logs: Browser console (F12)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Sharu**
- GitHub: [@codewithsharu](https://github.com/codewithsharu)

## 🙏 Acknowledgments

- SMS India Hub for SMS API services
- Vercel for hosting platform
- React team for the amazing framework

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: [your-email@example.com]

---

Made with ❤️ by [Sharu](https://github.com/codewithsharu)
