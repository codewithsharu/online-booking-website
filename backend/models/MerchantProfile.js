const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
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
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: true });

const merchantProfileSchema = new mongoose.Schema({
  merchantId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    index: true
  },
  applicationId: {
    type: String,
    required: true,
    index: true
  },
  
  // Shop Information
  shopName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  shopCategory: {
    type: String,
    required: true,
    enum: ['Barber', 'Salon', 'Clinic', 'Repair', 'Other'],
    index: true
  },
  shopDescription: {
    type: String,
    trim: true
  },
  shopImage: {
    type: String,
    default: null
  },
  shopImages: [{
    type: String
  }],
  
  // Location Details
  location: {
    pincode: {
      type: String,
      required: true,
      match: /^\d{6}$/,
      index: true
    },
    area: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    fullAddress: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Working Hours
  workingHours: {
    openingTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    closingTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    workingDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    holidays: [{
      date: Date,
      reason: String
    }]
  },
  
  // Booking Configuration
  slotDuration: {
    type: Number,
    required: true,
    enum: [10, 15, 30, 45, 60],
    comment: 'Duration in minutes'
  },
  advanceBookingDays: {
    type: Number,
    default: 7,
    comment: 'How many days in advance customers can book'
  },
  simultaneousBookings: {
    type: Number,
    default: 1,
    comment: 'Number of simultaneous bookings allowed'
  },
  
  // Services
  services: [serviceSchema],
  
  // Contact Information
  contact: {
    phone: String,
    alternatePhone: String,
    email: String,
    whatsapp: String
  },
  
  // Social Media
  socialMedia: {
    facebook: String,
    instagram: String,
    website: String
  },
  
  // Business Stats
  stats: {
    totalBookings: {
      type: Number,
      default: 0
    },
    completedBookings: {
      type: Number,
      default: 0
    },
    cancelledBookings: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  
  // Profile Status
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Featured/Premium
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  
  // SEO & Discovery
  tags: [{
    type: String,
    trim: true
  }],
  searchKeywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
merchantProfileSchema.index({ merchantId: 1, isActive: 1 });
merchantProfileSchema.index({ 'location.pincode': 1, shopCategory: 1 });
merchantProfileSchema.index({ 'location.area': 1, isActive: 1 });
merchantProfileSchema.index({ shopName: 'text', shopDescription: 'text' });
merchantProfileSchema.index({ tags: 1 });
merchantProfileSchema.index({ isFeatured: -1, 'stats.rating': -1 });

// Pre-save hook to mark profile as complete
merchantProfileSchema.pre('save', function(next) {
  const requiredFields = [
    this.shopName,
    this.shopCategory,
    this.location.pincode,
    this.location.area,
    this.location.fullAddress,
    this.workingHours.openingTime,
    this.workingHours.closingTime,
    this.slotDuration
  ];
  
  this.isProfileComplete = requiredFields.every(field => field != null && field !== '');
  next();
});

module.exports = mongoose.model('MerchantProfile', merchantProfileSchema);
