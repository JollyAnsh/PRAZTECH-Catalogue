const express = require('express');
const router = express.Router();
const { submitContactForm } = require('../controllers/contactController');
const { contactLimiter } = require('../middleware/rateLimiter');

// Public factory-direct contact form submission endpoint
router.post('/', contactLimiter, submitContactForm);

module.exports = router;
