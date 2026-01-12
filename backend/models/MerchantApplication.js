const mongoose = require('mongoose');

const merchantApplicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    index: true,
    match: /^\d{10}$/
  },
  ownerName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
  },
  businessName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  businessCategory: {
    type: String,
    required: true,
    enum: ['Barber', 'Salon', 'Clinic', 'Repair', 'Other'],
    index: true
  },
  businessDescription: {
    type: String,
    trim: true
  },
  location: {
    pincode: {
      type: String,
      required: true,
      match: /^\d{6}$/
    },
    area: {
      type: String,
      required: true,
      trim: true
    },
    fullAddress: {
      type: String,
      required: true,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  merchantId: {
    type: String,
    default: null,
    sparse: true
  },
  // Timestamps for traceability
  appliedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  // Admin who processed the application
  processedBy: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
merchantApplicationSchema.index({ phone: 1, status: 1 });
merchantApplicationSchema.index({ status: 1, appliedAt: -1 });

// Pre-save hook - simplified
merchantApplicationSchema.pre('save', async function(next) {
  try {
    // Ensure location object exists
    if (!this.location) {
      this.location = {};
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('MerchantApplication', merchantApplicationSchema);
