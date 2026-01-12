const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, default: null },
  duration: { type: Number, default: null },
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, { _id: false });

const workingHoursSchema = new mongoose.Schema({
  openingTime: { type: String },
  closingTime: { type: String },
  workingDays: [{ type: String }]
}, { _id: false });

const socialSchema = new mongoose.Schema({
  facebook: String,
  instagram: String,
  website: String
}, { _id: false });

const contactSchema = new mongoose.Schema({
  phone: { type: String, trim: true },
  alternatePhone: { type: String, trim: true },
  email: { type: String, trim: true },
  whatsapp: { type: String, trim: true }
}, { _id: false });

const locationSchema = new mongoose.Schema({
  city: { type: String, trim: true },
  state: { type: String, trim: true }
}, { _id: false });

const merchantInfoSchema = new mongoose.Schema({
  // identity
  phone: { type: String, required: true, index: true, unique: true, match: /^\d{10}$/ },
  merchantId: { type: String, default: null, index: true, sparse: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },

  // application (4 fields)
  ownerName: { type: String, required: true, trim: true },
  shopName: { type: String, required: true, trim: true, index: true },
  pincode: { type: String, required: true, match: /^\d{5,6}$/ },
  shopAddress: { type: String, required: true, trim: true },

  // timestamps of decision
  appliedAt: { type: Date, default: Date.now, required: true },
  approvedAt: { type: Date, default: null },
  rejectedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: null },
  processedBy: { type: String, default: null },

  // unlocked after approval
  shopCategory: { type: String, trim: true },
  shopDescription: { type: String, trim: true },
  images: [{ type: String }],
  location: locationSchema,
  workingHours: workingHoursSchema,
  slotDuration: { type: Number },
  advanceBookingDays: { type: Number, default: 7 },
  simultaneousBookings: { type: Number, default: 1 },
  services: [serviceSchema],
  contact: contactSchema,
  socialMedia: socialSchema,
  tags: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

merchantInfoSchema.index({ shopName: 'text', shopDescription: 'text' });
merchantInfoSchema.index({ pincode: 1 });

module.exports = mongoose.model('MerchantInfo', merchantInfoSchema);
