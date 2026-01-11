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
let merchantApplications = {};
let userNames = {};

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
    
    // Check if user exists and get their role
    let existingUser = users[phone];
    let role = 'user';
    let isFirstTime = false;
    
    if (existingUser) {
      role = existingUser.role;
    } else {
      users[phone] = { phone, role: 'user', verifiedAt: timestamp };
      isFirstTime = true;
    }
    
    const token = jwt.sign({ phone, role }, JWT_SECRET);
    delete otpStore[phone];
    
    console.log(`[${timestamp}] ✅ User: ${phone}, Role: ${role}, First time: ${isFirstTime}`);
    res.json({ 
      success: true, 
      token, 
      role, 
      isFirstTime,
      hasName: !!userNames[phone],
      message: 'Phone verified successfully' 
    });
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
  const user = users[req.user.phone] || { phone: req.user.phone, role: req.user.role };
  const name = userNames[req.user.phone];
  res.json({ 
    phone: req.user.phone, 
    role: req.user.role,
    name: name,
    hasName: !!name
  });
});

// Save user name
app.post('/api/save-name', verifyToken, (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    userNames[req.user.phone] = name;
    console.log(`✅ Name saved for ${req.user.phone}: ${name}`);
    res.json({ success: true, message: 'Name saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save name' });
  }
});

// Submit merchant application
app.post('/api/merchant/apply', verifyToken, (req, res) => {
  try {
    const { ownerName, email, businessName, businessCategory, businessDescription, pincode, area, fullAddress } = req.body;
    
    if (!ownerName || !businessName || !businessCategory || !pincode || !area || !fullAddress) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }
    
    const phone = req.user.phone;
    const applicationId = Date.now().toString();
    
    merchantApplications[applicationId] = {
      id: applicationId,
      phone,
      ownerName,
      email: email || '',
      businessName,
      businessCategory,
      businessDescription: businessDescription || '',
      pincode,
      area,
      fullAddress,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      merchantId: null
    };
    
    console.log(`📝 Merchant application submitted: ${applicationId} by ${phone}`);
    res.json({ success: true, message: 'Application submitted successfully', applicationId });
  } catch (error) {
    console.error('Error submitting merchant application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Get merchant application status
app.get('/api/merchant/status', verifyToken, (req, res) => {
  try {
    const phone = req.user.phone;
    const application = Object.values(merchantApplications).find(app => app.phone === phone);
    
    if (!application) {
      return res.json({ hasApplication: false });
    }
    
    res.json({ 
      hasApplication: true, 
      status: application.status,
      merchantId: application.merchantId,
      application 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// Admin: Get pending merchant applications
app.get('/api/admin/merchants/pending', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const pending = Object.values(merchantApplications).filter(app => app.status === 'pending');
    res.json({ applications: pending });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Admin: Approve merchant application
app.post('/api/admin/merchants/approve', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const { applicationId } = req.body;
    const application = merchantApplications[applicationId];
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Generate merchant ID
    const merchantId = 'MER' + Date.now().toString().slice(-8);
    
    // Update application
    application.status = 'approved';
    application.merchantId = merchantId;
    application.approvedAt = new Date().toISOString();
    
    // Update user role
    if (users[application.phone]) {
      users[application.phone].role = 'merchant';
      users[application.phone].merchantId = merchantId;
    }
    
    console.log(`✅ Approved merchant application ${applicationId}, assigned ID: ${merchantId}`);
    res.json({ success: true, message: 'Application approved', merchantId });
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ error: 'Failed to approve application' });
  }
});

// Admin: Reject merchant application
app.post('/api/admin/merchants/reject', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const { applicationId, reason } = req.body;
    const application = merchantApplications[applicationId];
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    application.status = 'rejected';
    application.rejectedAt = new Date().toISOString();
    application.rejectionReason = reason || 'Not specified';
    
    console.log(`❌ Rejected merchant application ${applicationId}`);
    res.json({ success: true, message: 'Application rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject application' });
  }
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
  console.log(`   POST /api/send-otp                  - Send OTP to phone`);
  console.log(`   POST /api/verify-otp                - Verify OTP`);
  console.log(`   POST /api/admin-login               - Admin login`);
  console.log(`   GET  /api/user                      - Get user info (protected)`);
  console.log(`   POST /api/save-name                 - Save user name (protected)`);
  console.log(`   POST /api/merchant/apply            - Submit merchant application (protected)`);
  console.log(`   GET  /api/merchant/status           - Get merchant application status (protected)`);
  console.log(`   GET  /api/admin/merchants/pending   - Get pending applications (admin)`);
  console.log(`   POST /api/admin/merchants/approve   - Approve application (admin)`);
  console.log(`   POST /api/admin/merchants/reject    - Reject application (admin)`);
  console.log(`   GET  /api/admin                     - Admin dashboard (protected)`);
  console.log('═'.repeat(70) + '\n');
});
