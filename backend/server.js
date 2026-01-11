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
const MerchantApplication = require('./models/MerchantApplication');
const MerchantProfile = require('./models/MerchantProfile');
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

// Approved SMS template (must match provider's template)
const SMS_TEMPLATE = 'Welcome to the xyz powered by SMSINDIAHUB. Your OTP for registration is {{OTP}}';

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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    OTPService.saveOTP(normalizedPhone, otp);

    // Use approved template exactly as registered with provider
    const message = SMS_TEMPLATE.replace('{{OTP}}', otp);

    // Use APIKey-based SMS endpoint (works with provided example)
    const smsUrl = `${SMS_API_URL}?APIKey=${SMS_API_KEY}&msisdn=91${normalizedPhone}&sid=${SMS_SENDER_ID}&msg=${encodeURIComponent(message)}&fl=0&gwid=${SMS_GWID}`;

    const smsResponse = await axios.get(smsUrl);
    const smsData = typeof smsResponse.data === 'string' ? smsResponse.data : JSON.stringify(smsResponse.data);
    console.log(`📱 OTP sent to ${normalizedPhone}: ${otp}`);
    console.log(`📤 SMS API response [${smsResponse.status}]: ${smsData}`);
    
    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      smsApiStatus: smsResponse.status,
      smsApiData: smsData
    });
  } catch (error) {
    console.error('Error sending OTP:', error?.response?.data || error.message || error);
    res.status(500).json({ 
      error: 'Failed to send OTP',
      details: error?.response?.data || error.message || 'Unknown error'
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

    const isValid = OTPService.verifyOTP(normalizedPhone, otp);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Find or create user
    let user = await User.findOne({ phone: normalizedPhone });
    let isFirstTime = false;
    
    if (!user) {
      user = await User.create({
        phone: normalizedPhone,
        role: 'user',
        name: null
      });
      isFirstTime = true;
      console.log(`✨ New user created: ${normalizedPhone}`);
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
    const { ownerName, email, businessName, businessCategory, businessDescription, pincode, area, fullAddress } = req.body;
    
    if (!ownerName || !businessName || !businessCategory || !pincode || !area || !fullAddress) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    // Check if user already has an application
    const existingApp = await MerchantApplication.findOne({ phone: req.user.phone, isActive: true });
    if (existingApp) {
      return res.status(400).json({ 
        error: 'You already have an active application',
        status: existingApp.status 
      });
    }

    const applicationId = Date.now().toString();
    
    const application = await MerchantApplication.create({
      applicationId,
      phone: req.user.phone,
      ownerName: ownerName.trim(),
      email: email?.trim() || '',
      businessName: businessName.trim(),
      businessCategory,
      businessDescription: businessDescription?.trim() || '',
      location: {
        pincode,
        area: area.trim(),
        fullAddress: fullAddress.trim()
      },
      status: 'pending',
      appliedAt: new Date()
    });

    console.log(`📝 Merchant application submitted: ${applicationId} by ${req.user.phone}`);
    res.json({ 
      success: true, 
      message: 'Application submitted successfully', 
      applicationId,
      application 
    });
  } catch (error) {
    console.error('Error submitting merchant application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Get merchant application status
app.get('/api/merchant/status', verifyToken, async (req, res) => {
  try {
    const application = await MerchantApplication.findOne({ 
      phone: req.user.phone,
      isActive: true 
    }).select('-__v').lean();
    
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
    const pending = await MerchantApplication.find({ 
      status: 'pending',
      isActive: true 
    })
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
    const { applicationId } = req.body;
    
    const application = await MerchantApplication.findOne({ applicationId });
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

    // Create merchant profile with application data
    await MerchantProfile.create({
      merchantId,
      phone: application.phone,
      applicationId: application.applicationId,
      shopName: application.businessName,
      shopCategory: application.businessCategory,
      shopDescription: application.businessDescription,
      location: {
        pincode: application.location.pincode,
        area: application.location.area,
        fullAddress: application.location.fullAddress
      },
      workingHours: {
        openingTime: '09:00',
        closingTime: '18:00',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      slotDuration: 30,
      services: [],
      contact: {
        phone: application.phone,
        email: application.email
      }
    });

    console.log(`✅ Approved merchant application ${applicationId}, assigned ID: ${merchantId}`);
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
    const { applicationId, reason } = req.body;
    
    const application = await MerchantApplication.findOne({ applicationId });
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

// Create or update merchant profile
app.post('/api/merchant/profile', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'merchant') {
      return res.status(403).json({ error: 'Only merchants can manage profiles' });
    }

    const { 
      shopName, shopCategory, shopDescription, shopImage,
      pincode, area, fullAddress, city, state,
      openingTime, closingTime, workingDays,
      slotDuration, advanceBookingDays, simultaneousBookings,
      services, contact, socialMedia, tags
    } = req.body;
    
    // Validate required fields
    if (!shopName || !shopCategory || !pincode || !area || !fullAddress || !openingTime || !closingTime || !slotDuration) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    // Find or update profile
    let profile = await MerchantProfile.findOne({ merchantId: req.user.merchantId });

    if (profile) {
      // Update existing profile
      profile.shopName = shopName.trim();
      profile.shopCategory = shopCategory;
      profile.shopDescription = shopDescription?.trim();
      profile.shopImage = shopImage;
      
      profile.location = {
        pincode,
        area: area.trim(),
        fullAddress: fullAddress.trim(),
        city: city?.trim(),
        state: state?.trim()
      };
      
      profile.workingHours = {
        openingTime,
        closingTime,
        workingDays: workingDays || profile.workingHours.workingDays
      };
      
      profile.slotDuration = parseInt(slotDuration);
      profile.advanceBookingDays = advanceBookingDays || profile.advanceBookingDays;
      profile.simultaneousBookings = simultaneousBookings || profile.simultaneousBookings;
      
      if (services) profile.services = services;
      if (contact) profile.contact = { ...profile.contact, ...contact };
      if (socialMedia) profile.socialMedia = { ...profile.socialMedia, ...socialMedia };
      if (tags) profile.tags = tags;
      
      profile.updatedAt = Date.now();
      await profile.save();

      console.log(`✅ Profile updated for merchant ${req.user.merchantId}`);
    } else {
      // This shouldn't happen as profile is created on approval, but handle it
      return res.status(404).json({ error: 'Profile not found. Please contact support.' });
    }
    
    res.json({ 
      success: true, 
      message: 'Profile saved successfully', 
      profile 
    });
  } catch (error) {
    console.error('Error saving merchant profile:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Get own merchant profile
app.get('/api/merchant/profile', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'merchant') {
      return res.status(403).json({ error: 'Only merchants can access profiles' });
    }

    const profile = await MerchantProfile.findOne({ 
      merchantId: req.user.merchantId,
      isActive: true 
    }).select('-__v').lean();
    
    if (!profile) {
      return res.json({ hasProfile: false, merchantId: req.user.merchantId });
    }
    
    res.json({ hasProfile: true, profile });
  } catch (error) {
    console.error('Error fetching merchant profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get merchant profile by ID (public)
app.get('/api/merchant/profile/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;
    
    const profile = await MerchantProfile.findOne({ 
      merchantId,
      isActive: true 
    })
    .select('-__v -createdAt -updatedAt')
    .lean();
    
    if (!profile) {
      return res.status(404).json({ error: 'Merchant profile not found' });
    }
    
    res.json({ profile });
  } catch (error) {
    console.error('Error fetching merchant profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Search merchants (public)
app.get('/api/merchants/search', async (req, res) => {
  try {
    const { category, pincode, area, query, page = 1, limit = 20 } = req.query;
    
    let filter = { isActive: true };
    
    if (category) filter.shopCategory = category;
    if (pincode) filter['location.pincode'] = pincode;
    if (area) filter['location.area'] = new RegExp(area, 'i');
    if (query) {
      filter.$or = [
        { shopName: new RegExp(query, 'i') },
        { shopDescription: new RegExp(query, 'i') },
        { tags: new RegExp(query, 'i') }
      ];
    }

    const merchants = await MerchantProfile.find(filter)
      .select('merchantId shopName shopCategory shopImage location.area location.pincode stats.rating stats.reviewCount workingHours isFeatured')
      .sort({ isFeatured: -1, 'stats.rating': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await MerchantProfile.countDocuments(filter);

    res.json({ 
      merchants,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
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
    const pendingCount = await MerchantApplication.countDocuments({ status: 'pending' });
    
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
  console.log(`   POST /api/merchant/upload-image     - Upload shop image (merchant)`);
  console.log(`   GET  /api/admin/merchants/pending   - Get pending applications (admin)`);
  console.log(`   POST /api/admin/merchants/approve   - Approve application (admin)`);
  console.log(`   POST /api/admin/merchants/reject    - Reject application (admin)`);
  console.log(`   GET  /api/admin                     - Admin dashboard (protected)`);
  console.log('═'.repeat(70) + '\n');
});
