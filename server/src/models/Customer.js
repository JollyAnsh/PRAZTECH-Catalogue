const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  company: { type: String, trim: true, default: '' },
  email: { type: String, required: true, trim: true, lowercase: true },
  emailNormalized: { type: String, required: true, index: true },
  phone: { type: String, required: true, trim: true },
  phoneNormalized: { type: String, required: true, index: true },
  whatsapp: { type: String, trim: true, default: '' },
  country: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  address: { type: String, trim: true, default: '' },
  gstin: { type: String, trim: true, default: '' },
  enquiryCount: { type: Number, default: 1 },
  enquiryIds: [{ type: String }]
}, {
  timestamps: true
});

const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

module.exports = Customer;
