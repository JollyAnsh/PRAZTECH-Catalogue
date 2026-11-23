const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  indexNumber: { type: Number, required: true },
  modelNo: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, index: true },
  categorySlug: { type: String, required: true, index: true },
  cataloguePage: { type: Number },
  tag: { type: String, default: 'bestseller' },
  description: { type: String, default: '' },
  keyFeatures: [{ type: String }],
  applications: [{ type: String }],
  setIncludes: [{ type: String }],
  sizesDetail: [{ type: String }],
  compatibility: { type: String, default: '' },
  itemSpecifics: { type: Map, of: String },
  notes: { type: String, default: '' },
  variantOptionNames: [{ type: String }],
  subModels: [mongoose.Schema.Types.Mixed],
  corrections: [{ type: String }],
  flags: [{ type: String }],
  images: [{ type: String }],
  isActive: { type: Boolean, default: true, index: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Text index for full-text search
productSchema.index({
  name: 'text',
  modelNo: 'text',
  description: 'text',
  compatibility: 'text',
  category: 'text'
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;
