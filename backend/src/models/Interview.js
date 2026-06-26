const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  drive: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scheduledAt: { type: Date },
  venue: { type: String },
  roundName: { type: String },
  mode: { type: String, enum: ['online', 'offline'], default: 'offline' },
  meetLink: { type: String },
  outcome: {
    type: String,
    enum: ['pending', 'passed', 'failed'],
    default: 'pending',
  },
  notes: { type: String },
});

module.exports = mongoose.model('Interview', interviewSchema);
