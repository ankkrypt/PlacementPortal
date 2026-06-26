const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile' },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  date: { type: Date },
  venue: { type: String },
  rounds: [
    {
      roundNumber: Number,
      name: String,
      scheduledTime: String,
      venue: String,
    },
  ],
  eligibleBatches: [{ type: String }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming',
  },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Drive', driveSchema);
