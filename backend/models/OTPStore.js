const mongoose = require('mongoose');

const otpStoreSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  otp: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // TTL: auto-delete after 10 minutes
  }
});

const OTPStore = mongoose.model('OTPStore', otpStoreSchema);

class OTPServiceDB {
  static async saveOTP(phone, otp) {
    try {
      await OTPStore.findOneAndUpdate(
        { phone },
        { phone, otp, attempts: 0, createdAt: new Date() },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Error saving OTP to DB:', error);
      throw error;
    }
  }

  static async verifyOTP(phone, otp) {
    try {
      const stored = await OTPStore.findOne({ phone });
      
      if (!stored) {
        return { isValid: false, reason: 'OTP_NOT_FOUND' };
      }

      // Check if expired (10 min)
      const elapsed = Date.now() - stored.createdAt.getTime();
      if (elapsed > 10 * 60 * 1000) {
        await OTPStore.deleteOne({ phone });
        return { isValid: false, reason: 'OTP_EXPIRED' };
      }

      // Increment attempts
      stored.attempts += 1;

      // Fail after 5 incorrect attempts
      if (stored.attempts > 5) {
        await OTPStore.deleteOne({ phone });
        return { isValid: false, reason: 'TOO_MANY_ATTEMPTS' };
      }

      // Check if OTP matches
      if (stored.otp === otp) {
        await OTPStore.deleteOne({ phone });
        return { isValid: true, reason: 'SUCCESS' };
      }

      await stored.save();
      return { isValid: false, reason: 'INVALID_OTP' };
    } catch (error) {
      console.error('Error verifying OTP from DB:', error);
      return { isValid: false, reason: 'OTP_NOT_FOUND' };
    }
  }

  static async deleteOTP(phone) {
    try {
      await OTPStore.deleteOne({ phone });
    } catch (error) {
      console.error('Error deleting OTP:', error);
    }
  }
}

module.exports = OTPServiceDB;
