const express = require('express');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();

// GET /api/announcements - get all announcements
router.get('/', authenticate, async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('postedBy', 'name')
      .sort({ isPinned: -1, createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/announcements - create announcement (admin only)
router.post('/', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const { title, content, targetRoles, isPinned } = req.body;
    const announcement = await Announcement.create({
      title,
      content,
      targetRoles: targetRoles || ['all'],
      postedBy: req.user._id,
      isPinned: isPinned || false,
    });

    // Send in-app notifications to targeted users
    let query = {};
    const roles = targetRoles || ['all'];
    if (!roles.includes('all')) {
      query = { role: { $in: roles } };
    }

    const users = await User.find(query).select('_id');
    const notifications = users.map((user) => ({
      user: user._id,
      title: 'New Announcement',
      message: title,
      type: 'info',
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/announcements/:id - update (admin only)
router.put('/:id', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/announcements/:id (admin only)
router.delete('/:id', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
