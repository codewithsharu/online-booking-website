const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Environment Variables with fallbacks
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const SMS_API_URL = process.env.SMS_API_URL || 'http://cloud.smsindiahub.in/vendorsms/pushsms.aspx';
const SMS_API_KEY = process.env.SMS_API_KEY || 'f1af4eb84ee84103bb7ea19cb9459ccf';
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'SMSHUB';
const SMS_GWID = process.env.SMS_GWID || '2';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let otpStore = {};
let users = {};

// Send OTP
app.post('/api/send-otp', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] ⏳ /api/send-otp request received`);
  
  try {
    const { phone } = req.body;
    console.log(`[${timestamp}] 📞 Phone received: ${phone}`);
    
    if (!phone) {
      console.log(`[${timestamp}] ❌ Phone is missing or empty`);
      return res.status(400).json({ error: 'Phone number required' });
    }
    
    if (!/^\d{12}$/.test(phone)) {
      console.log(`[${timestamp}] ❌ Phone format invalid (must be 12 digits with country code): ${phone}`);
      return res.status(400).json({ error: 'Invalid phone format (expected 12 digits with 91)' });
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = otp;
    console.log(`[${timestamp}] 🔐 OTP generated: ${otp} for phone ${phone}`);
    
    const msg = `Welcome to the xyz powered by SMSINDIAHUB. Your OTP for registration is ${otp}`;
    const url = `${SMS_API_URL}?APIKey=${SMS_API_KEY}&msisdn=${phone}&sid=${SMS_SENDER_ID}&msg=${encodeURIComponent(msg)}&fl=0&gwid=${SMS_GWID}`;
    
    console.log(`[${timestamp}] 📧 Attempting SMS API call to: ${SMS_API_URL}`);
    console.log(`[${timestamp}] 📋 Full URL: ${url}`);
    
    try {
      const smsRes = await axios.get(url, { timeout: 8000 });
      console.log(`[${timestamp}] ✅ SMS API Response Status: ${smsRes.status}`);
      console.log(`[${timestamp}] 📧 SMS API Response Body:`, smsRes.data);
      console.log(`[${timestamp}] ✅ OTP sent successfully to ${phone}`);
      
      return res.json({ success: true, message: 'OTP sent successfully', otp: otp });
    } catch (smsError) {
      console.log(`[${timestamp}] ⚠️ SMS API call failed: ${smsError.message}`);
      console.log(`[${timestamp}] 📧 SMS Error Code: ${smsError.code}`);
      console.log(`[${timestamp}] 📧 SMS Response Status: ${smsError.response?.status}`);
      console.log(`[${timestamp}] 📧 SMS Response Data:`, smsError.response?.data);
      console.log(`[${timestamp}] ⚠️ But OTP is stored in memory for verification: ${otp}`);
      
      // Even if SMS fails, OTP is stored, so we return success for testing
      return res.json({ success: true, message: 'OTP generated (SMS delivery may have issues)', otp: otp, smsStatus: smsError.message });
    }
  } catch (error) {
    console.error(`[${timestamp}] ❌ Unexpected error in /api/send-otp:`, error.message);
    console.error(`[${timestamp}] Stack:`, error.stack);
    res.status(500).json({ error: 'Server error processing OTP request', details: error.message });
  }
});

// Verify OTP
app.post('/api/verify-otp', (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] ⏳ /api/verify-otp request received`);
  
  try {
    const { phone, otp } = req.body;
    console.log(`[${timestamp}] 📞 Phone: ${phone}, OTP: ${otp}`);
    
    if (!phone || !otp) {
      console.log(`[${timestamp}] ❌ Phone or OTP missing`);
      return res.status(400).json({ error: 'Phone and OTP required' });
    }
    
    const storedOtp = otpStore[phone];
    console.log(`[${timestamp}] 🔍 Checking OTP - Stored: ${storedOtp}, Provided: ${otp}`);
    
    if (!storedOtp) {
      console.log(`[${timestamp}] ❌ No OTP found for phone ${phone}. Did you call /api/send-otp first?`);
      return res.status(400).json({ error: 'OTP not found. Request a new OTP first.' });
    }
    
    if (storedOtp !== otp) {
      console.log(`[${timestamp}] ❌ OTP mismatch - Expected: ${storedOtp}, Got: ${otp}`);
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    console.log(`[${timestamp}] ✅ OTP verified successfully for ${phone}`);
    
    users[phone] = { phone, role: 'user', verifiedAt: timestamp };
    const token = jwt.sign({ phone, role: 'user' }, JWT_SECRET);
    delete otpStore[phone];
    
    console.log(`[${timestamp}] ✅ User registered: ${phone}, Token issued`);
    res.json({ success: true, token, role: 'user', message: 'Phone verified successfully' });
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ Unexpected error in /api/verify-otp:`, error.message);
    console.error(`[${timestamp}] Stack:`, error.stack);
    res.status(500).json({ error: 'Server error verifying OTP', details: error.message });
  }
});

// Admin Login
app.post('/api/admin-login', (req, res) => {
  try {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      const token = jwt.sign({ role: 'admin' }, JWT_SECRET);
      res.json({ token, role: 'admin' });
    } else {
      res.status(400).json({ error: 'Invalid password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get user
app.get('/api/user', verifyToken, (req, res) => {
  res.json({ phone: req.user.phone, role: req.user.role });
});

// Admin test page
app.get('/api/admin', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  res.json({ message: 'Admin page', data: users });
});

app.listen(PORT, HOST, () => {
  console.log('\n' + '═'.repeat(70));
  console.log('🚀 SERVER STARTED SUCCESSFULLY');
  console.log('═'.repeat(70));
  console.log(`📍 Local:           http://localhost:${PORT}`);
  console.log(`📍 Network:         http://${HOST}:${PORT}`);
  console.log(`🔐 JWT Secret:      ${JWT_SECRET.substring(0, 20)}...`);
  console.log(`📧 SMS API:         ${SMS_API_URL}`);
  console.log(`🔑 SMS API Key:     ${SMS_API_KEY.substring(0, 10)}...`);
  console.log(`👤 Admin Password:  ${ADMIN_PASSWORD === 'admin123' ? '⚠️  DEFAULT (Change in production!)' : '✅ Custom'}`);
  console.log(`⏰ Started at:      ${new Date().toISOString()}`);
  console.log('═'.repeat(70));
  console.log('\n📋 Available Endpoints:');
  console.log(`   POST /api/send-otp      - Send OTP to phone`);
  console.log(`   POST /api/verify-otp    - Verify OTP`);
  console.log(`   POST /api/admin-login   - Admin login`);
  console.log(`   GET  /api/user          - Get user info (protected)`);
  console.log(`   GET  /api/admin         - Admin dashboard (protected)`);
  console.log('═'.repeat(70) + '\n');
});
