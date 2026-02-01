const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Booking Identification
  bookingId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // User Information
  userId: {
    type: String,
    required: true,
    index: true
  },
  userPhone: {
    type: String,
    required: true,
    match: /^\d{10}$/
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Merchant Information
  merchantId: {
    type: String,
    required: true,
    index: true
  },
  merchantPhone: {
    type: String,
    required: true
  },
  shopName: {
    type: String,
    required: true,
    trim: true
  },
  shopAddress: {
    type: String,
    trim: true
  },
  
  // Booking Details
  service: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      default: null
    },
    duration: {
      type: Number,
      default: null,
      comment: 'Duration in minutes'
    }
  },
  
  // Date & Time
  bookingDate: {
    type: Date,
    required: true,
    index: true
  },
  timeSlot: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    comment: 'Format: HH:MM'
  },
  endTime: {
    type: String,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending',
    index: true
  },
  
  // Cancellation
  cancelledAt: {
    type: Date,
    default: null
  },
  cancelledBy: {
    type: String,
    enum: ['user', 'merchant', null],
    default: null
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  
  // Notes
  userNote: {
    type: String,
    trim: true,
    maxlength: 500
  },
  merchantNote: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
bookingSchema.index({ userPhone: 1, status: 1 });
bookingSchema.index({ merchantId: 1, bookingDate: 1 });
bookingSchema.index({ merchantId: 1, status: 1 });
bookingSchema.index({ bookingDate: 1, timeSlot: 1, merchantId: 1 });

// Pre-save hook to update timestamps
bookingSchema.pre('save', function() {
  this.updatedAt = new Date();
});

module.exports = mongoose.model('Booking', bookingSchema);
