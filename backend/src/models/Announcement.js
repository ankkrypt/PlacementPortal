const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  targetRoles: [
    {
      type: String,
      enum: ['student', 'company', 'faculty', 'all'],
    },
  ],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  isPinned: { type: Boolean, default: false },
});

module.exports = mongoose.model('Announcement', announcementSchema);
