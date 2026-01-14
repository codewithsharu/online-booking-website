const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
require('dotenv').config();

// Import Models
const User = require('./models/User');
const MerchantInfo = require('./models/MerchantInfo');
const OTPService = require('./models/OTPService');

const app = express();
app.use(express.json());
app.use(cors());

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Environment Variables
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const MONGODB_URI = process.env.MONGODB_URI;
const SMS_API_URL = process.env.SMS_API_URL || 'http://cloud.smsindiahub.in/vendorsms/pushsms.aspx';
const SMS_API_KEY = process.env.SMS_API_KEY || 'f1af4eb84ee84103bb7ea19cb9459ccf';
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'SMSHUB';
const SMS_GWID = process.env.SMS_GWID || '2';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Test accounts (bypass OTP for testing)
const TEST_ACCOUNTS = {
  '7816072521': { role: 'user', name: 'Test User' },
  '7816072522': { role: 'merchant', name: 'Test Merchant', merchantId: 'TEST_MERCHANT_001' }
};

// Approved SMS template (must match provider's template)
const SMS_TEMPLATE = 'Welcome to the WaitSmart powered by SMSINDIAHUB. Your OTP for registration is {{OTP}}';

// SMS API Error Code Mapping
const SMS_ERROR_CODES = {
  '000': 'OTP sent successfully',
  '001': 'Login details cannot be blank',
  '003': 'Sender cannot be blank',
  '004': 'Message text cannot be blank',
  '005': 'Message data cannot be blank',
  '006': 'Generic error occurred',
  '007': 'Username or password is invalid',
  '008': 'Account not active',
  '009': 'Account locked, contact your account manager',
  '010': 'API restriction',
  '011': 'IP address restriction',
  '012': 'Invalid length of message text',
  '013': 'Mobile numbers not valid',
  '014': 'Account locked due to spam message, contact support',
  '015': 'Sender ID not valid',
  '017': 'Group ID not valid',
  '018': 'Multi message to group is not supported',
  '019': 'Schedule date is not valid',
  '020': 'Message or mobile number cannot be blank',
  '021': 'Insufficient credits',
  '022': 'Invalid job ID',
  '023': 'Parameter missing',
  '024': 'Invalid template or template mismatch',
  '025': 'Field cannot be blank or empty',
  '026': 'Invalid date range',
  '027': 'Invalid opt-in user',
  '028': 'Invalid data',
  '029': 'Email cannot be blank',
  '030': 'Password cannot be blank',
  '031': 'Username cannot be blank',
  '032': 'Mobile number cannot be blank',
  '033': 'Username already exists',
  '034': 'Mobile number already exists',
  '035': 'Email ID already exists',
  '036': 'Email ID cannot be blank'
};

// Normalize phone numbers to 10-digit (India) format
const normalizePhone = (rawPhone) => {
  const digits = (rawPhone || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2); // strip country code if present
  }
  if (digits.length === 10) {
    return digits;
  }
  return null;
};

// MongoDB Connection
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// MongoDB connection event listeners
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📴 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

// JWT Verification Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

// ==================== OTP ENDPOINTS ====================

// Send OTP
app.post('/api/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const normalizedPhone = normalizePhone(phone);

    // Check if it's a test account - bypass OTP
    if (TEST_ACCOUNTS[normalizedPhone]) {
      console.log(`🧪 Test account detected: ${normalizedPhone} - Using bypass OTP: 1111`);
      OTPService.saveOTP(normalizedPhone, '1111');
      return res.json({ 
        success: true, 
        message: 'OTP sent successfully (Test Account)',
        isTestAccount: true
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    OTPService.saveOTP(normalizedPhone, otp);

    // Use approved template exactly as registered with provider
    const message = SMS_TEMPLATE.replace('{{OTP}}', otp);

    // Use APIKey-based SMS endpoint (works with provided example)
    const smsUrl = `${SMS_API_URL}?APIKey=${SMS_API_KEY}&msisdn=91${normalizedPhone}&sid=${SMS_SENDER_ID}&msg=${encodeURIComponent(message)}&fl=0&gwid=${SMS_GWID}`;

    const smsResponse = await axios.get(smsUrl);
    let smsData = smsResponse.data;
    let smsJson = {};
    
    // Parse response - could be JSON or plain text
    if (typeof smsData === 'string') {
      try {
        smsJson = JSON.parse(smsData);
      } catch {
        smsJson = { rawResponse: smsData };
      }
    } else {
      smsJson = smsData;
    }
    
    console.log(`📱 OTP sent to ${normalizedPhone}: ${otp}`);
    console.log(`📤 SMS API response [${smsResponse.status}]:`, smsJson);
    
    // Check for error in response
    const errorCode = smsJson.ErrorCode || smsJson.error_code || '';
    const errorMessage = SMS_ERROR_CODES[errorCode] || smsJson.ErrorMessage || 'Unknown error';
    
    // Error codes that indicate failure
    const failureCodes = ['021', '013', '012', '011', '010', '009', '008', '007', '006', '005', '004', '003', '001'];
    
    if (failureCodes.includes(errorCode)) {
      console.error(`❌ SMS API error [${errorCode}]: ${errorMessage}`);
      return res.status(500).json({ 
        error: errorMessage,
        errorCode,
        details: 'Failed to send OTP. Please try again later.'
      });
    }
    
    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      errorCode,
      errorMessage
    });
  } catch (error) {
    console.error('Error sending OTP:', error?.response?.data || error.message || error);
    res.status(500).json({ 
      error: 'Failed to send OTP',
      details: error?.response?.data || error.message || 'Network error'
    });
  }
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const normalizedPhone = normalizePhone(phone);

    // Keep basic presence check but don't hard-fail on format
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }

    // Check if it's a test account - accept OTP 1111
    const testAccount = TEST_ACCOUNTS[normalizedPhone];
    let verifyResult = { isValid: false };
    
    if (testAccount && otp === '1111') {
      verifyResult.isValid = true;
      verifyResult.reason = 'SUCCESS';
      console.log(`🧪 Test account OTP accepted: ${normalizedPhone}`);
    } else {
      // Regular OTP verification with detailed response
      verifyResult = OTPService.verifyOTP(normalizedPhone, otp);
    }
    
    if (!verifyResult.isValid) {
      const errorMessages = {
        'OTP_EXPIRED': 'OTP has expired. Please request a new OTP.',
        'OTP_NOT_FOUND': 'OTP not found. Please request a new OTP.',
        'INVALID_OTP': 'Invalid OTP. Please enter the correct code.',
        'TOO_MANY_ATTEMPTS': 'Too many incorrect attempts. Please request a new OTP.'
      };
      
      const errorMessage = errorMessages[verifyResult.reason] || 'Invalid or expired OTP';
      console.log(`❌ OTP verification failed [${verifyResult.reason}] for ${normalizedPhone}`);
      
      return res.status(400).json({ 
        error: errorMessage,
        reason: verifyResult.reason
      });
    }

    // Find or create user
    let user = await User.findOne({ phone: normalizedPhone });
    let isFirstTime = false;
    
    if (!user) {
      if (testAccount) {
        // Create test account with pre-filled data
        user = await User.create({
          phone: normalizedPhone,
          role: testAccount.role,
          name: testAccount.name,
          merchantId: testAccount.merchantId || null
        });
        
        console.log(`🧪 Test account created: ${normalizedPhone} (${testAccount.role})`);
        
        // If merchant test account, create approved application and profile
        if (testAccount.role === 'merchant' && testAccount.merchantId) {
          // Create approved merchant application
          const existingApp = await MerchantInfo.findOne({ phone: normalizedPhone });
          let applicationIdForTest = existingApp?.applicationId || Date.now().toString();

          if (!existingApp) {
            await MerchantInfo.create({
              phone: normalizedPhone,
              merchantId: testAccount.merchantId,
              status: 'approved',
              ownerName: testAccount.name,
              shopName: 'Test Business',
              pincode: '560001',
              shopAddress: 'Test Address',
              approvedAt: new Date(),
              processedBy: 'admin',
              shopCategory: 'Testing'
            });
            console.log(`✅ Test merchant application created and approved`);
          } else if (existingApp.status !== 'approved' || !existingApp.merchantId) {
            existingApp.status = 'approved';
            existingApp.merchantId = testAccount.merchantId;
            existingApp.approvedAt = new Date();
            existingApp.processedBy = 'admin';
            await existingApp.save();
          }
          
          // Create merchant details snapshot with editable fields placeholder
          // No separate details document now; data stored in MerchantInfo
        }
      } else {
        // Regular new user
        user = await User.create({
          phone: normalizedPhone,
          role: 'user',
          name: null
        });
        isFirstTime = true;
        console.log(`✨ New user created: ${normalizedPhone}`);
      }
    }

    // Check if user has a name
    const hasName = !!user.name;

    // Generate JWT token
    const token = jwt.sign(
      { 
        phone: user.phone, 
        role: user.role,
        merchantId: user.merchantId 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ Login successful: ${phone} (${user.role})`);
    res.json({ 
      success: true, 
      token, 
      role: user.role,
      isFirstTime,
      hasName,
      merchantId: user.merchantId
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// ==================== USER ENDPOINTS ====================

// Get user info
app.get('/api/user', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.user.phone }).select('-__v');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

// Save user name
app.post('/api/save-name', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const user = await User.findOneAndUpdate(
      { phone: req.user.phone },
      { name: name.trim(), updatedAt: Date.now() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`✅ Name saved for ${req.user.phone}: ${name}`);
    res.json({ success: true, message: 'Name saved successfully', user });
  } catch (error) {
    console.error('Error saving name:', error);
    res.status(500).json({ error: 'Failed to save name' });
  }
});

// ==================== MERCHANT APPLICATION ENDPOINTS ====================

// Submit merchant application
app.post('/api/merchant/apply', verifyToken, async (req, res) => {
  try {
    const { ownerName, shopName, pincode, shopAddress } = req.body;
    
    if (!ownerName || !shopName || !pincode || !shopAddress) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    // If info exists, update to pending with application fields; else create
    let info = await MerchantInfo.findOne({ phone: req.user.phone });
    if (!info) {
      info = await MerchantInfo.create({
        phone: req.user.phone,
        ownerName: ownerName.trim(),
        shopName: shopName.trim(),
        pincode: pincode.trim(),
        shopAddress: shopAddress.trim(),
        status: 'pending',
        appliedAt: new Date()
      });
    } else {
      info.ownerName = ownerName.trim();
      info.shopName = shopName.trim();
      info.pincode = pincode.trim();
      info.shopAddress = shopAddress.trim();
      info.status = 'pending';
      info.appliedAt = new Date();
      info.rejectedAt = null;
      info.rejectionReason = null;
      await info.save();
    }

    // Ensure user's role is merchant (locked until approved via status)
    await User.findOneAndUpdate(
      { phone: req.user.phone },
      { role: 'merchant', updatedAt: Date.now() }
    );

    console.log(`📝 Merchant application submitted by ${req.user.phone}`);
    res.json({ 
      success: true, 
      message: 'Application submitted successfully', 
      application: info 
    });
  } catch (error) {
    console.error('Error submitting merchant application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Get merchant application status
app.get('/api/merchant/status', verifyToken, async (req, res) => {
  try {
    const application = await MerchantInfo.findOne({ phone: req.user.phone }).select('-__v').lean();
    
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
    console.error('Error fetching merchant status:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});
// ==================== CLEAR CACHE ENDPOINT ====================

// Clear all browser session data
app.get('/api/clear', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Clear all browser storage: localStorage, sessionStorage, cookies',
      timestamp: new Date().toISOString(),
      instructions: {
        localStorage: 'localStorage.clear()',
        sessionStorage: 'sessionStorage.clear()',
        cookies: 'document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`));'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear data' });
  }
});
// ==================== ADMIN ENDPOINTS ====================

// Admin login
app.post('/api/admin-login', (req, res) => {
  try {
    const { password } = req.body;
    
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid admin password' });
    }

    const token = jwt.sign({ phone: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    
    console.log('✅ Admin logged in');
    res.json({ success: true, token, role: 'admin' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get pending merchant applications
app.get('/api/admin/merchants/pending', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const pending = await MerchantInfo.find({ status: 'pending' })
    .sort({ appliedAt: -1 })
    .select('-__v')
    .lean();

    res.json({ applications: pending });
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Approve merchant application
app.post('/api/admin/merchants/approve', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const { phone } = req.body; // approve by phone
    
    const application = await MerchantInfo.findOne({ phone });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.status === 'approved') {
      return res.status(400).json({ error: 'Application already approved' });
    }

    // Generate merchant ID
    const merchantId = 'MER' + Date.now().toString().slice(-8);
    
    // Update application
    application.status = 'approved';
    application.merchantId = merchantId;
    application.approvedAt = new Date();
    application.processedBy = req.user.phone;
    await application.save();

    // Update user role
    await User.findOneAndUpdate(
      { phone: application.phone },
      { 
        role: 'merchant',
        merchantId,
        updatedAt: Date.now()
      }
    );

    console.log(`✅ Approved merchant ${phone}, assigned ID: ${merchantId}`);
    res.json({ 
      success: true, 
      message: 'Application approved', 
      merchantId,
      application 
    });
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ error: 'Failed to approve application' });
  }
});

// Reject merchant application
app.post('/api/admin/merchants/reject', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const { phone, reason } = req.body;
    
    const application = await MerchantInfo.findOne({ phone });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.status = 'rejected';
    application.rejectedAt = new Date();
    application.rejectionReason = reason || 'Not specified';
    application.processedBy = req.user.phone;
    await application.save();

    console.log(`❌ Rejected merchant application ${applicationId}`);
    res.json({ success: true, message: 'Application rejected' });
  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({ error: 'Failed to reject application' });
  }
});

// ==================== MERCHANT PROFILE ENDPOINTS ====================

// Upload shop image to Cloudinary
app.post('/api/merchant/upload-image', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'merchant') {
      return res.status(403).json({ error: 'Only merchants can upload shop images' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'merchant-shops',
          public_id: `shop_${req.user.merchantId}_${Date.now()}`,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;
    console.log(`✅ Image uploaded for merchant ${req.user.merchantId}: ${result.secure_url}`);
    
    res.json({ 
      success: true, 
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Create or update merchant details (editable fields only)
app.post('/api/merchant/profile', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'merchant') {
      return res.status(403).json({ error: 'Only merchants can manage profiles' });
    }

    const {
      shopCategory,
      shopDescription,
      shopImage,
      city,
      state,
      openingTime,
      closingTime,
      workingDays,
      slotDuration,
      advanceBookingDays,
      simultaneousBookings,
      services,
      contact,
      socialMedia,
      tags
    } = req.body;

    const details = await MerchantInfo.findOne({ phone: req.user.phone });

    if (!details) {
      return res.status(404).json({ error: 'Merchant details not found. Please contact support.' });
    }

    if (details.status !== 'approved') {
      return res.status(403).json({ error: 'Profile editing is locked until approval' });
    }

    const existingWorkingHours = details.workingHours || {};
    const existingLocation = details.location || {};
    const existingContact = details.contact || {};
    const existingSocial = details.socialMedia || {};

    if (shopCategory) details.shopCategory = shopCategory;
    if (shopDescription) details.shopDescription = shopDescription.trim();
    if (shopImage) details.images = [shopImage];

    if (city || state) {
      details.location = {
        city: city || existingLocation.city,
        state: state || existingLocation.state
      };
    }

    if (openingTime || closingTime || workingDays) {
      details.workingHours = {
        openingTime: openingTime || existingWorkingHours.openingTime,
        closingTime: closingTime || existingWorkingHours.closingTime,
        workingDays: workingDays || existingWorkingHours.workingDays
      };
    }

    if (slotDuration) details.slotDuration = parseInt(slotDuration, 10);
    if (advanceBookingDays) details.advanceBookingDays = parseInt(advanceBookingDays, 10);
    if (simultaneousBookings) details.simultaneousBookings = parseInt(simultaneousBookings, 10);

    if (Array.isArray(services)) {
      details.services = services.map((svc) => {
        if (typeof svc === 'string') {
          return { name: svc };
        }
        if (svc && typeof svc === 'object') {
          return {
            name: svc.name,
            price: svc.price,
            duration: svc.duration,
            description: svc.description,
            isActive: svc.isActive !== undefined ? svc.isActive : true
          };
        }
        return null;
      }).filter(Boolean);
    }
    if (contact) details.contact = { ...existingContact, ...contact };
    if (socialMedia) details.socialMedia = { ...existingSocial, ...socialMedia };
    if (tags) details.tags = tags;

    await details.save();

    console.log(`✅ Merchant details saved for ${req.user.merchantId}`);
    res.json({ 
      success: true, 
      message: 'Details saved successfully', 
      details 
    });
  } catch (error) {
    console.error('Error saving merchant details:', error);
    res.status(500).json({ error: 'Failed to save merchant details' });
  }
});

// Get own merchant details (unified MerchantInfo)
app.get('/api/merchant/profile', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'merchant') {
      return res.status(403).json({ error: 'Only merchants can access profiles' });
    }

    const details = await MerchantInfo.findOne({ phone: req.user.phone }).select('-__v').lean();
    
    if (!details) {
      return res.json({ hasProfile: false, merchantId: req.user.merchantId, status: 'pending' });
    }
    
    res.json({ hasProfile: true, details });
  } catch (error) {
    console.error('Error fetching merchant profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update merchant profile (only editable fields)
app.put('/api/merchant/profile', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'merchant') {
      return res.status(403).json({ error: 'Only merchants can update profiles' });
    }

    const {
      shopCategory,
      shopDescription,
      shopImage,
      city,
      state,
      openingTime,
      closingTime,
      workingDays,
      slotDuration,
      advanceBookingDays,
      simultaneousBookings,
      services,
      contact,
      socialMedia,
      tags
    } = req.body;

    // Find existing details (editable data store)
    const details = await MerchantInfo.findOne({ phone: req.user.phone });

    if (!details) {
      return res.status(404).json({ error: 'Merchant details not found' });
    }

    if (details.status !== 'approved') {
      return res.status(403).json({ error: 'Profile editing is locked until approval' });
    }

    const existingWorkingHours = details.workingHours || {};
    const existingLocation = details.location || {};
    const existingContact = details.contact || {};
    const existingSocial = details.socialMedia || {};

    if (req.body.shopName) details.shopName = req.body.shopName.trim();
    if (req.body.pincode) details.pincode = String(req.body.pincode).trim();
    if (req.body.shopAddress) details.shopAddress = req.body.shopAddress.trim();

    // Only update editable fields; application data remains immutable
    if (shopCategory) details.shopCategory = shopCategory;
    if (shopDescription) details.shopDescription = shopDescription.trim();
    if (shopImage) details.images = [shopImage];

    if (city || state) {
      details.location = {
        city: city || existingLocation.city,
        state: state || existingLocation.state
      };
    }

    if (openingTime || closingTime || workingDays) {
      details.workingHours = {
        openingTime: openingTime || existingWorkingHours.openingTime,
        closingTime: closingTime || existingWorkingHours.closingTime,
        workingDays: workingDays || existingWorkingHours.workingDays
      };
    }

    if (slotDuration) details.slotDuration = parseInt(slotDuration, 10);
    if (advanceBookingDays) details.advanceBookingDays = parseInt(advanceBookingDays, 10);
    if (simultaneousBookings) details.simultaneousBookings = parseInt(simultaneousBookings, 10);

    if (Array.isArray(services)) {
      details.services = services.map((svc) => {
        if (typeof svc === 'string') return { name: svc };
        if (svc && typeof svc === 'object') return {
          name: svc.name,
          price: svc.price,
          duration: svc.duration,
          description: svc.description,
          isActive: svc.isActive !== undefined ? svc.isActive : true
        };
        return null;
      }).filter(Boolean);
    }
    if (contact) details.contact = { ...existingContact, ...contact };
    if (socialMedia) details.socialMedia = { ...existingSocial, ...socialMedia };
    if (tags) details.tags = tags;

    await details.save();

    console.log(`✅ Merchant details updated (editable fields): ${req.user.merchantId}`);
    res.json({
      success: true,
      message: 'Merchant details updated successfully',
      details
    });
  } catch (error) {
    console.error('Error updating merchant details:', error);
    res.status(500).json({ error: 'Failed to update merchant details' });
  }
});

// Get merchant details by ID (public)
app.get('/api/merchant/profile/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;
    
    const details = await MerchantInfo.findOne({ merchantId, status: 'approved', isActive: true })
    .select('-__v -createdAt -updatedAt')
    .lean();
    
    if (!details) {
      return res.status(404).json({ error: 'Merchant profile not found' });
    }
    
    res.json({ profile: details });
  } catch (error) {
    console.error('Error fetching merchant profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Search merchants (public)
// Advanced merchant search by pincode or merchantId
app.get('/api/merchants/search-advanced', async (req, res) => {
  try {
    const { type, value } = req.query;

    if (!type || !value) {
      return res.status(400).json({ error: 'Search type and value are required' });
    }

    let filter = { status: 'approved' };

    if (type === 'pincode') {
      filter.pincode = value.trim();
    } else if (type === 'merchantId') {
      filter.merchantId = value.trim().toUpperCase();
    } else {
      return res.status(400).json({ error: 'Invalid search type. Use "pincode" or "merchantId"' });
    }

    const merchants = await MerchantInfo.find(filter)
      .select('merchantId shopName ownerName phone pincode shopAddress shopCategory shopDescription contact socialMedia')
      .lean();

    res.json({ merchants });
  } catch (error) {
    console.error('Error in advanced search:', error);
    res.status(500).json({ error: 'Failed to search merchants' });
  }
});

app.get('/api/merchants/search', async (req, res) => {
  try {
    const { category, pincode, area, query, page = 1, limit = 20 } = req.query;
    const numericLimit = parseInt(limit, 10);
    const numericPage = parseInt(page, 10);
    
    let filter = { isActive: true };
    
    if (category) filter.shopCategory = category;
    if (pincode) filter['applicationData.pincode'] = pincode;
    if (area) filter['location.city'] = new RegExp(area, 'i');
    if (query) {
      filter.$or = [
        { 'applicationData.shopName': new RegExp(query, 'i') },
        { shopDescription: new RegExp(query, 'i') },
        { tags: new RegExp(query, 'i') }
      ];
    }

    const merchants = await MerchantInfo.find({ ...filter, status: 'approved' })
      .select('merchantId applicationData shopCategory shopDescription images location workingHours tags slotDuration')
      .sort({ createdAt: -1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit)
      .lean();

    const total = await MerchantInfo.countDocuments({ ...filter, status: 'approved' });

    res.json({ 
      merchants,
      pagination: {
        total,
        page: numericPage,
        pages: Math.ceil(total / numericLimit)
      }
    });
  } catch (error) {
    console.error('Error searching merchants:', error);
    res.status(500).json({ error: 'Failed to search merchants' });
  }
});

// Admin test page
app.get('/api/admin', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    // Fetch all users
    const users = await User.find({}).select('phone name role merchantId isActive createdAt').lean();
    const userCount = await User.countDocuments();
    const merchantCount = await User.countDocuments({ role: 'merchant' });
    const pendingCount = await MerchantInfo.countDocuments({ status: 'pending' });
    
    res.json({ 
      message: 'Admin dashboard',
      data: users,
      stats: {
        totalUsers: userCount,
        totalMerchants: merchantCount,
        pendingApplications: pendingCount
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Delete user (admin only)
app.delete('/api/admin/users/:phone', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    const deletedUser = await User.findOneAndDelete({ phone });

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`🗑️  User deleted by admin: ${phone}`);
    res.json({ success: true, message: 'User deleted successfully', user: deletedUser });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Start server
app.listen(PORT, HOST, () => {
  console.log('\n' + '═'.repeat(70));
  console.log('🚀 SERVER STARTED SUCCESSFULLY');
  console.log('═'.repeat(70));
  console.log(`📍 Local:           http://localhost:${PORT}`);
  console.log(`📍 Network:         http://${HOST}:${PORT}`);
  console.log(`🔐 JWT Secret:      ${JWT_SECRET.substring(0, 20)}...`);
  console.log(`📧 SMS API:         ${SMS_API_URL}`);
  console.log(`🔑 SMS API Key:     ${SMS_API_KEY.substring(0, 10)}...`);
  console.log(`☁️  Cloudinary:      ${process.env.CLOUDINARY_CLOUD_NAME || 'Not configured'}`);
  console.log(`🗄️  MongoDB:         ${MONGODB_URI ? '✅ Connected' : '❌ Not configured'}`);
  console.log(`👤 Admin Password:  ${ADMIN_PASSWORD === 'admin123' ? '⚠️  DEFAULT (Change in production!)' : '✅ Custom'}`);
  console.log(`⏰ Started at:      ${new Date().toISOString()}`);
  console.log('═'.repeat(70));
  console.log('\n📋 Available Endpoints:');
  console.log(`   POST /api/send-otp                  - Send OTP to phone`);
  console.log(`   POST /api/verify-otp                - Verify OTP`);
  console.log(`   GET  /api/clear                     - Clear browser session data`);
  console.log(`   POST /api/admin-login               - Admin login`);
  console.log(`   GET  /api/user                      - Get user info (protected)`);
  console.log(`   POST /api/save-name                 - Save user name (protected)`);
  console.log(`   POST /api/merchant/apply            - Submit merchant application (protected)`);
  console.log(`   GET  /api/merchant/status           - Get merchant application status (protected)`);
  console.log(`   POST /api/merchant/profile          - Create/update merchant profile (merchant)`);
  console.log(`   GET  /api/merchant/profile          - Get own merchant profile (merchant)`);
  console.log(`   GET  /api/merchant/profile/:id      - Get merchant profile by ID (public)`);
  console.log(`   GET  /api/merchants/search          - Search merchants (public)`);
  console.log(`   GET  /api/merchants/search-advanced - Search by pincode or merchantId (public)`);
  console.log(`   POST /api/merchant/upload-image     - Upload shop image (merchant)`);
  console.log(`   GET  /api/admin/merchants/pending   - Get pending applications (admin)`);
  console.log(`   POST /api/admin/merchants/approve   - Approve application (admin)`);
  console.log(`   POST /api/admin/merchants/reject    - Reject application (admin)`);
  console.log(`   GET  /api/admin                     - Admin dashboard (protected)`);
  console.log('═'.repeat(70) + '\n');
});
