const mongoose = require('mongoose');

const catalogueItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  modelNo: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  selectedSubModel: { type: mongoose.Schema.Types.Mixed },
  quantity: { type: Number, required: true, min: 1 },
  notes: { type: String, default: '' },
  productSnapshot: { type: mongoose.Schema.Types.Mixed }
}, { _id: true });

const customItemSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  specifications: { type: String, default: '' },
  dimensions: { type: String, default: '' },
  material: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  intendedApplication: { type: String, default: '' },
  notes: { type: String, default: '' },
  attachmentName: { type: String, default: '' },
  attachmentUrl: { type: String, default: '' }
}, { _id: true });

const enquirySchema = new mongoose.Schema({
  referenceNumber: { type: String, required: true, unique: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerSnapshot: {
    fullName: { type: String, required: true },
    company: { type: String, default: '' },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    whatsapp: { type: String, default: '' },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, default: '' },
    gstin: { type: String, default: '' }
  },
  catalogueItems: [catalogueItemSchema],
  customItems: [customItemSchema],
  generalNotes: { type: String, default: '' },
  status: {
    type: String,
    enum: [
      'Review Pending',
      'Quotation Dispatched',
      'Blueprint Review',
      'Order Confirmed',
      'Closed',
      'New',
      'Contacted',
      'Quotation Sent',
      'Completed'
    ],
    default: 'Review Pending',
    index: true
  },
  pdfUrl: { type: String, default: '' },
  consent: {
    accepted: { type: Boolean, required: true },
    timestamp: { type: Date, default: Date.now },
    policyVersion: { type: String, default: '1.0' }
  },
  notificationStatus: {
    customerEmailSent: { type: Boolean, default: false },
    businessEmailSent: { type: Boolean, default: false },
    errors: [{ type: String }]
  },
  submittedAt: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema);

module.exports = Enquiry;
