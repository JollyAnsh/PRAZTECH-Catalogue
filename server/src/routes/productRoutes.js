const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  compareProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  uploadMiddleware
} = require('../controllers/productController');
const { requireAdminAuth } = require('../middleware/auth');

// Public Product Catalogue Endpoints
router.get('/', getProducts);
router.post('/compare', compareProducts);
router.get('/:slug', getProductBySlug);

// Administrative Management Endpoints (Protected)
router.post('/upload-image', requireAdminAuth, uploadMiddleware, uploadProductImage);
router.post('/', requireAdminAuth, createProduct);
router.put('/:slug', requireAdminAuth, updateProduct);
router.delete('/:slug', requireAdminAuth, deleteProduct);

module.exports = router;
