const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  companyName: { type: String, trim: true },
  industry: { type: String, trim: true },
  website: { type: String, trim: true },
  description: { type: String },
  hrName: { type: String, trim: true },
  hrEmail: { type: String, trim: true },
  hrPhone: { type: String, trim: true },
  location: { type: String, trim: true },
  logo: { type: String },
});

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);
