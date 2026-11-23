const express = require('express');
const router = express.Router();
const {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const { requireAdminAuth } = require('../middleware/auth');

// All Customer Directory endpoints require Administrative Authentication
router.use(requireAdminAuth);

router.get('/', getCustomers);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

module.exports = router;
