const mongoose = require('mongoose');

let isConnected = false;
let connectPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  if (connectPromise) {
    return connectPromise;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>')) {
    console.warn('⚠️  MONGODB_URI not configured or contains placeholders. Running in local JSON data mode.');
    return false;
  }

  connectPromise = (async () => {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return true;
    } catch (error) {
      connectPromise = null;
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      console.warn('⚠️  Continuing with local file data fallback.');
      return false;
    }
  })();

  return connectPromise;
};

const getDBStatus = () => Boolean(isConnected || mongoose.connection.readyState === 1);

module.exports = { connectDB, getDBStatus };
