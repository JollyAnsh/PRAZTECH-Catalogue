const fs = require('fs');
const path = require('path');
const Category = require('../models/Category');
const { getDBStatus } = require('../config/db');

const localCategoriesFile = path.join(__dirname, '../../data/categories.json');

const getCategories = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
      return res.json({ success: true, data: categories });
    }

    if (fs.existsSync(localCategoriesFile)) {
      const cats = JSON.parse(fs.readFileSync(localCategoriesFile, 'utf8'));
      return res.json({ success: true, data: cats });
    }

    res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories };
