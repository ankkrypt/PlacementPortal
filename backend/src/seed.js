require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI not set in .env file');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@college.edu' });
    if (existing) {
      console.log('Admin account already exists: admin@college.edu / admin@123');
      process.exit(0);
    }

    const hashed = await bcrypt.hash('admin@123', 10);
    await User.create({
      name: 'Placement Admin',
      email: 'admin@college.edu',
      password: hashed,
      role: 'admin',
      status: 'approved',
    });

    console.log('Admin account seeded successfully:');
    console.log('  Email: admin@college.edu');
    console.log('  Password: admin@123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
}

seed();
