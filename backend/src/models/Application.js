const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile' },
  appliedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'],
    default: 'applied',
  },
  statusHistory: [
    {
      status: String,
      changedAt: { type: Date, default: Date.now },
      note: String,
    },
  ],
  interviewSlot: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
});

applicationSchema.index({ job: 1, student: 1 }, { unique: true });
applicationSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
