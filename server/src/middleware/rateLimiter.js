const rateLimit = require('express-rate-limit');

// Enquiry submission rate limit: 15 submissions per hour per IP
const enquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many enquiry submissions from this IP. Please wait an hour before submitting again.'
  }
});

// General API rate limit: 300 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});

// Administrative login rate limit: 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many administrative login attempts. Please wait 15 minutes before trying again.'
  }
});

// Contact form rate limit: 5 submissions per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many contact messages submitted from this IP. Please wait 15 minutes before submitting again.'
  }
});

module.exports = { enquiryLimiter, apiLimiter, loginLimiter, contactLimiter };
