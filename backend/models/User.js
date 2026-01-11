const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
    match: /^\d{10}$/
  },
  name: {
    type: String,
    default: null,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'merchant', 'admin'],
    default: 'user',
    index: true
  },
  merchantId: {
    type: String,
    default: null,
    sparse: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
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

// Index for faster queries
userSchema.index({ phone: 1, role: 1 });
userSchema.index({ merchantId: 1 }, { sparse: true });

module.exports = mongoose.model('User', userSchema);
