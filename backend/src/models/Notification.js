const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'alert'],
    default: 'info',
  },
  isRead: { type: Boolean, default: false },
  relatedJob: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  relatedDrive: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive' },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
