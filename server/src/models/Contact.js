const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 150
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 30
  },
  company: {
    type: String,
    trim: true,
    maxlength: 150
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 3000
  },
  emailDelivered: {
    type: Boolean,
    default: false
  },
  deliveryError: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
