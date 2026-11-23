require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Category = require('../models/Category');

const seedData = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('<username>')) {
    console.error('❌ MONGODB_URI is not configured in .env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('Connected.');

    const productsPath = path.join(__dirname, '../../data/products.json');
    const categoriesPath = path.join(__dirname, '../../data/categories.json');

    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

    console.log(`Clearing existing products and categories...`);
    await Product.deleteMany({});
    await Category.deleteMany({});

    console.log(`Inserting ${categories.length} categories...`);
    await Category.insertMany(categories);

    console.log(`Inserting ${products.length} products...`);
    await Product.insertMany(products);

    console.log('✅ Database seeded successfully with all PRAZTECH products and categories!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
