const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile' },
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['job', 'internship'] },
  description: { type: String },
  requirements: { type: String },
  location: { type: String, trim: true },
  package: { type: Number },
  stipend: { type: Number },
  eligibleBranches: [{ type: String }],
  minCgpa: { type: Number, default: 0 },
  requiredSkills: [{ type: String }],
  rounds: [
    {
      roundNumber: Number,
      name: String,
      description: String,
    },
  ],
  applicationDeadline: { type: Date },
  driveDate: { type: Date },
  vacancies: { type: Number },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed'],
    default: 'draft',
  },
  createdAt: { type: Date, default: Date.now },
});

jobSchema.index({ status: 1, applicationDeadline: 1 });
jobSchema.index({ company: 1 });

module.exports = mongoose.model('Job', jobSchema);
