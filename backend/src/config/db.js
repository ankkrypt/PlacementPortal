const mongoose = require('mongoose');
const config = require('./env');

async function connectDB() {
  try {
    const conn = await mongoose.connect(config.mongodbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.log('Server will continue without database. Set MONGODB_URI in .env to connect.');
  }
}

module.exports = connectDB;
