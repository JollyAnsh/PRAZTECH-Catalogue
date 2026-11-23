const Customer = require('../models/Customer');
const Enquiry = require('../models/Enquiry');
const { getDBStatus } = require('../config/db');

// GET /api/customers - List all customers
const getCustomers = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const customers = await Customer.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: customers.length, data: customers });
    }

    return res.json({ success: true, count: 0, data: [] });
  } catch (error) {
    next(error);
  }
};

// POST /api/customers - Create a customer manually
const createCustomer = async (req, res, next) => {
  try {
    const {
      fullName,
      company = '',
      email,
      phone,
      whatsapp = '',
      country = 'India',
      state = '',
      city = '',
      address = '',
      gstin = ''
    } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and phone are required.'
      });
    }

    const emailNormalized = email.trim().toLowerCase();
    const phoneNormalized = phone.replace(/[^0-9+]/g, '');

    if (getDBStatus()) {
      const existing = await Customer.findOne({
        $or: [{ emailNormalized }, { phoneNormalized }]
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'A customer with this email or phone number already exists.',
          data: existing
        });
      }

      const newCustomer = await Customer.create({
        fullName: fullName.trim(),
        company: company.trim(),
        email: email.trim(),
        emailNormalized,
        phone: phone.trim(),
        phoneNormalized,
        whatsapp: (whatsapp || phone).trim(),
        country: country.trim(),
        state: state.trim(),
        city: city.trim(),
        address: address.trim(),
        gstin: gstin.trim(),
        enquiryCount: 0,
        enquiryIds: []
      });

      return res.status(201).json({ success: true, data: newCustomer });
    }

    return res.status(503).json({
      success: false,
      message: 'Database is not connected. Customer creation requires MongoDB Atlas.'
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/customers/:id - Update customer details
const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (getDBStatus()) {
      if (updates.email) {
        updates.emailNormalized = updates.email.trim().toLowerCase();
      }
      if (updates.phone) {
        updates.phoneNormalized = updates.phone.replace(/[^0-9+]/g, '');
      }

      const updated = await Customer.findByIdAndUpdate(id, updates, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }

      return res.json({ success: true, data: updated });
    }

    return res.status(503).json({ success: false, message: 'Database not connected.' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/customers/:id - Delete customer
const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const deleted = await Customer.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }

      return res.json({ success: true, message: 'Customer deleted successfully.' });
    }

    return res.status(503).json({ success: false, message: 'Database not connected.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
