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
  shopName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  pincode: {
    type: String,
    required: true,
    match: /^\d{6}$/
  },
  shopAddress: {
    type: String,
    required: true,
    trim: true
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

module.exports = mongoose.model('MerchantApplication', merchantApplicationSchema);
