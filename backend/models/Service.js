const mongoose = require('mongoose');

const CATEGORIES = [
  'Barber',
  'Salon',
  'Hospital',
  'Gym',
  'Clinic',
  'Spa',
  'Dental',
  'Physiotherapy',
  'Repair',
  'Tutor',
  'Photography',
  'Consulting'
];

const timeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
  endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ }
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  // Merchant reference
  merchantId: { type: String, required: true, index: true },
  merchantPhone: { type: String, required: true },
  shopName: { type: String, required: true, trim: true },
  ownerName: { type: String, trim: true },

  // Service details
  serviceName: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { 
    type: String, 
    required: true, 
    enum: CATEGORIES, 
    index: true 
  },
  price: { type: Number, default: 0 },
  duration: { type: Number, default: 30, comment: 'Duration in minutes' },

  // Location (auto-fetched from merchant profile)
  pincode: { type: String, required: true, match: /^\d{5,6}$/, index: true },
  area: { type: String, trim: true },
  shopAddress: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },

  // Availability
  availableDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  timeSlots: [timeSlotSchema],
  slotDuration: { type: Number, default: 30, enum: [10, 15, 20, 30, 45, 60] },
  maxBookingsPerSlot: { type: Number, default: 1 },

  // Status
  isPublished: { type: Boolean, default: true, index: true },
  isActive: { type: Boolean, default: true },

  // Timestamps
  publishedAt: { type: Date, default: Date.now },
  stoppedAt: { type: Date, default: null }
}, { timestamps: true });

// Compound indexes for efficient searching
serviceSchema.index({ pincode: 1, category: 1, isPublished: 1 });
serviceSchema.index({ merchantId: 1, isPublished: 1 });
serviceSchema.index({ serviceName: 'text', description: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
module.exports.CATEGORIES = CATEGORIES;
