const mongoose = require('mongoose');

/**
 * Connect to MongoDB using Mongoose
 * @returns {Promise<void>}
 */
async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/huntify_jobs';
    await mongoose.connect(mongoUri);
    console.log('🍃 Connected to MongoDB successfully (huntify_jobs DB)');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
