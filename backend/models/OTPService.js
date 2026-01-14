const mongoose = require('mongoose');

// Simple in-memory OTP store (could be Redis in production)
const otpStore = {};

const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes - increased from 5 to prevent premature expiry

class OTPService {
  static saveOTP(phone, otp) {
    otpStore[phone] = {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY,
      createdAt: Date.now(),
      attempts: 0
    };
  }

  static verifyOTP(phone, otp) {
    const stored = otpStore[phone];
    if (!stored) return { isValid: false, reason: 'OTP_NOT_FOUND' };
    
    // Check if expired
    if (Date.now() > stored.expiresAt) {
      delete otpStore[phone];
      return { isValid: false, reason: 'OTP_EXPIRED' };
    }
    
    // Increment attempts
    stored.attempts = (stored.attempts || 0) + 1;
    
    // Fail after 5 incorrect attempts
    if (stored.attempts > 5) {
      delete otpStore[phone];
      return { isValid: false, reason: 'TOO_MANY_ATTEMPTS' };
    }
    
    // Check if OTP matches
    if (stored.otp === otp) {
      delete otpStore[phone];
      return { isValid: true, reason: 'SUCCESS' };
    }
    
    return { isValid: false, reason: 'INVALID_OTP' };
  }

  static getOTPInfo(phone) {
    const stored = otpStore[phone];
    if (!stored) return null;
    
    const now = Date.now();
    const timeRemaining = Math.max(0, stored.expiresAt - now);
    const secondsRemaining = Math.ceil(timeRemaining / 1000);
    const isExpired = now > stored.expiresAt;
    
    return {
      secondsRemaining,
      isExpired,
      attempts: stored.attempts || 0,
      maxAttempts: 5
    };
  }

  static deleteOTP(phone) {
    delete otpStore[phone];
  }
}


module.exports = OTPService;
