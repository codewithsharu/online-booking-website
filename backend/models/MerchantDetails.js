const mongoose = require('mongoose');

const merchantDetailsSchema = new mongoose.Schema({
  merchantId: {
    type: String,
    required: true,
    unique: true
  },
  applicationId: {
    type: String,
    required: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    index: true,
    match: /^\d{10}$/
  },
  approvedAt: {
    type: Date,
    default: Date.now
  },
  // Immutable data copied from the approved application
  applicationData: {
    ownerName: { type: String, required: true, trim: true },
    shopName: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    shopAddress: { type: String, required: true, trim: true }
  },
  // Editable merchant-managed fields (post-approval)
  shopCategory: { type: String, trim: true },
  shopDescription: { type: String, trim: true },
  images: [{ type: String }],
  location: {
    city: { type: String, trim: true },
    state: { type: String, trim: true }
  },
  workingHours: {
    openingTime: { type: String },
    closingTime: { type: String },
    workingDays: [{ type: String }]
  },
  slotDuration: { type: Number },
  advanceBookingDays: { type: Number, default: 7 },
  simultaneousBookings: { type: Number, default: 1 },
  services: [
    {
      name: { type: String, trim: true },
      price: { type: Number, default: null },
      duration: { type: Number, default: null },
      description: { type: String, trim: true },
      isActive: { type: Boolean, default: true }
    }
  ],
  contact: {
    phone: { type: String, trim: true },
    alternatePhone: { type: String, trim: true },
    email: { type: String, trim: true },
    whatsapp: { type: String, trim: true }
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    website: String
  },
  tags: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

merchantDetailsSchema.index({ merchantId: 1 });
merchantDetailsSchema.index({ applicationId: 1 });
merchantDetailsSchema.index({ phone: 1 });
merchantDetailsSchema.index({ 'applicationData.pincode': 1 });
merchantDetailsSchema.index({ 'applicationData.shopName': 'text', shopDescription: 'text' });

module.exports = mongoose.model('MerchantDetails', merchantDetailsSchema);
