const fs = require('fs');
const path = require('path');

let productsCache = null;
let productById = null;
let productByModel = null;
let productBySlug = null;

const initProductIndex = () => {
  if (productsCache) return;
  try {
    const productsPath = path.join(__dirname, '../../data/products.json');
    if (fs.existsSync(productsPath)) {
      productsCache = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
      productById = new Map();
      productByModel = new Map();
      productBySlug = new Map();

      productsCache.forEach(p => {
        if (p.id) productById.set(p.id, p);
        if (p.slug) productBySlug.set(p.slug.toLowerCase(), p);
        if (p.modelNo) productByModel.set(p.modelNo.toLowerCase().trim(), p);
      });
    }
  } catch (err) {
    console.error('Failed to load products index for image resolver:', err.message);
  }
};

/**
 * Resolves the absolute path to a product image (PNG/JPG).
 * Prioritizes user-provided photos in client/public/images/products/,
 * falling back to server/data/thumbnails/.
 * 
 * @param {Object} item - Catalogue item from enquiry
 * @returns {string|null} - Absolute path to image or null
 */
const resolveProductImagePath = (item) => {
  if (!item) return null;
  initProductIndex();

  let matchedProduct = null;
  if (productById && item.productId && productById.has(item.productId)) {
    matchedProduct = productById.get(item.productId);
  } else if (productByModel && item.modelNo && productByModel.has(item.modelNo.toLowerCase().trim())) {
    matchedProduct = productByModel.get(item.modelNo.toLowerCase().trim());
  } else if (productBySlug && item.slug && productBySlug.has(item.slug.toLowerCase().trim())) {
    matchedProduct = productBySlug.get(item.slug.toLowerCase().trim());
  }

  // Derive slug
  let slug = item.slug || (matchedProduct && matchedProduct.slug) || '';
  if (!slug && item.productId) {
    slug = item.productId.replace(/^prod-\d+-/, '');
  }
  if (!slug && item.modelNo) {
    slug = item.modelNo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  // Check submodel image first if item specified a submodel
  if (item.subModel) {
    if (item.subModel.image) {
      const explicitSmPath = path.join(__dirname, '../../../client/public', item.subModel.image);
      if (fs.existsSync(explicitSmPath)) {
        return explicitSmPath;
      }
    }
    const smCode = (item.subModel.modelNo || item.subModel.sku || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (smCode) {
      const smCandidates = [
        path.join(__dirname, `../../../client/public/images/products/${slug}-${smCode}.jpg`),
        path.join(__dirname, `../../../client/public/images/products/${slug}-${smCode}.png`),
        path.join(__dirname, `../../../client/public/images/products/${smCode}.jpg`),
        path.join(__dirname, `../../../client/public/images/products/${smCode}.png`)
      ];
      for (const smCandidate of smCandidates) {
        if (fs.existsSync(smCandidate)) {
          return smCandidate;
        }
      }
    }
  }

  const modelRaw = item.modelNo ? item.modelNo.trim() : '';

  // Candidate paths in order of preference:
  const candidatePaths = [
    // 1. User-placed photos in client/public/images/products/
    path.join(__dirname, `../../../client/public/images/products/${slug}.png`),
    path.join(__dirname, `../../../client/public/images/products/${slug}.jpg`),
    path.join(__dirname, `../../../client/public/images/products/${slug}.jpeg`),
    path.join(__dirname, `../../../client/public/images/products/${slug}.webp`),
    modelRaw ? path.join(__dirname, `../../../client/public/images/products/${modelRaw}.png`) : null,
    modelRaw ? path.join(__dirname, `../../../client/public/images/products/${modelRaw}.jpg`) : null,

    // 2. Client public images folder
    path.join(__dirname, `../../../client/public/images/${slug}.png`),
    path.join(__dirname, `../../../client/public/images/${slug}.jpg`),

    // 3. Pre-generated server-side thumbnails
    path.join(__dirname, `../../data/thumbnails/${slug}.png`),

    // 4. Client thumbnails
    path.join(__dirname, `../../../client/public/images/thumbnails/${slug}.png`)
  ].filter(Boolean);

  for (const cPath of candidatePaths) {
    if (fs.existsSync(cPath)) {
      return cPath;
    }
  }

  return null;
};

module.exports = {
  resolveProductImagePath
};
