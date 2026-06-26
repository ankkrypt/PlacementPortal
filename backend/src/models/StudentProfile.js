const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  rollNumber: { type: String, trim: true },
  branch: {
    type: String,
    enum: ['CS', 'IT', 'EC', 'ME', 'CE', 'EE', 'MCA', 'MBA', 'Other'],
  },
  cgpa: { type: Number, min: 0, max: 10 },
  semester: { type: Number },
  passingYear: { type: Number },
  skills: [{ type: String }],
  certifications: [
    {
      name: String,
      issuer: String,
      year: Number,
    },
  ],
  achievements: [{ type: String }],
  resumeUrl: { type: String },
  resumeOriginalName: { type: String },
  linkedIn: { type: String },
  github: { type: String },
  isPlaced: { type: Boolean, default: false },
  placedAt: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  placementPackage: { type: Number },
  profileComplete: { type: Boolean, default: false },
});

studentProfileSchema.index({ branch: 1, cgpa: 1 });
studentProfileSchema.index({ isPlaced: 1 });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
