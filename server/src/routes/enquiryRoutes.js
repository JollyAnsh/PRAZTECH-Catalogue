const express = require('express');
const router = express.Router();
const {
  createEnquiry,
  getAllEnquiries,
  getEnquiryByReference,
  downloadEnquiryPDF,
  updateEnquiry,
  deleteEnquiry
} = require('../controllers/enquiryController');
const { enquiryLimiter } = require('../middleware/rateLimiter');
const { requireAdminAuth } = require('../middleware/auth');

// Public Customer Quotation & Lookup Endpoints
router.post('/', enquiryLimiter, createEnquiry);
router.get('/:reference', getEnquiryByReference);
router.get('/:reference/download', downloadEnquiryPDF);

// Administrative Quotation Management Endpoints (Protected)
router.get('/', requireAdminAuth, getAllEnquiries);
router.put('/:reference', requireAdminAuth, updateEnquiry);
router.delete('/:reference', requireAdminAuth, deleteEnquiry);

module.exports = router;
