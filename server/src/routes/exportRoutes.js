const express = require('express');
const router = express.Router();
const {
  exportCustomers,
  exportEnquiries,
  exportEnquiryItems,
  exportAllCombined
} = require('../controllers/exportController');
const { requireAdminKey } = require('../middleware/auth');

// All export routes are secured by admin authentication key
router.use(requireAdminKey);

router.get('/customers', exportCustomers);
router.get('/enquiries', exportEnquiries);
router.get('/enquiry-items', exportEnquiryItems);
router.get('/all', exportAllCombined);

module.exports = router;
