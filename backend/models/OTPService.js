const mongoose = require('mongoose');

// Simple in-memory OTP store (could be Redis in production)
const otpStore = {};

const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes

class OTPService {
  static saveOTP(phone, otp) {
    otpStore[phone] = {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY
    };
  }

  static verifyOTP(phone, otp) {
    const stored = otpStore[phone];
    if (!stored) return false;
    
    if (Date.now() > stored.expiresAt) {
      delete otpStore[phone];
      return false;
    }
    
    if (stored.otp === otp) {
      delete otpStore[phone];
      return true;
    }
    
    return false;
  }

  static deleteOTP(phone) {
    delete otpStore[phone];
  }
}

module.exports = OTPService;
