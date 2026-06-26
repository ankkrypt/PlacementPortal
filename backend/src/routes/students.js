const express = require('express');
const multer = require('multer');
const path = require('path');
const StudentProfile = require('../models/StudentProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const User = require('../models/User');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/role');
const checkEligibility = require('../utils/eligibilityChecker');
const config = require('../config/env');

const router = express.Router();

// Multer config for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploadPath),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(null, ext);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// All routes require auth + student role
router.use(authenticate, requireRole(['student']));

// GET /api/students/profile
router.get('/profile', async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await StudentProfile.create({ user: req.user._id });
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/students/profile
router.put('/profile', async (req, res) => {
  try {
    const updates = req.body;
    // Check if profile is complete
    const requiredFields = ['rollNumber', 'branch', 'cgpa', 'semester', 'passingYear'];
    const filled = requiredFields.every((f) => updates[f] != null && updates[f] !== '');
    updates.profileComplete = filled;

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/students/resume
router.post('/resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        resumeUrl: req.file.path,
        resumeOriginalName: req.file.originalname,
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: { resumeUrl: profile.resumeUrl, resumeOriginalName: profile.resumeOriginalName } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/students/resume/download
router.get('/resume/download', async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile || !profile.resumeUrl) {
      return res.status(404).json({ success: false, message: 'No resume found' });
    }
    res.download(profile.resumeUrl, profile.resumeOriginalName);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/students/jobs - list eligible jobs
router.get('/jobs', async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.json({ success: true, data: [] });
    }

    const allJobs = await Job.find({ status: 'active' })
      .populate('company', 'name email')
      .populate('companyProfile', 'companyName industry location')
      .sort({ createdAt: -1 });

    const jobsWithEligibility = allJobs.map((job) => {
      const { eligible, reasons } = checkEligibility(profile, job);
      return {
        ...job.toObject(),
        isEligible: eligible,
        ineligibilityReasons: reasons,
      };
    });

    res.json({ success: true, data: jobsWithEligibility });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/students/applications
router.get('/applications', async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate({
        path: 'job',
        populate: { path: 'companyProfile', select: 'companyName' },
      })
      .sort({ appliedAt: -1 });

    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/students/notifications
router.get('/notifications', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/students/notifications/read-all
router.put('/notifications/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
