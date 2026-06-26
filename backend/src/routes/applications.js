const express = require('express');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const StudentProfile = require('../models/StudentProfile');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Job = require('../models/Job');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { sendEmail } = require('../services/emailService');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// PUT /api/applications/:id/status - update status (company: shortlist/reject; admin: select)
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('student', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Permission check
    if (req.user.role === 'company') {
      const job = await Job.findOne({ _id: application.job._id, company: req.user._id });
      if (!job) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
      if (!['shortlisted', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Company can only shortlist or reject' });
      }
    } else if (req.user.role === 'admin') {
      if (!['selected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Admin can only mark as selected' });
      }
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    application.status = status;
    application.statusHistory.push({ status, note: note || `${status} by ${req.user.name}`, changedAt: new Date() });
    await application.save();

    // If selected, update student profile
    if (status === 'selected') {
      const studentProfile = await StudentProfile.findOne({ user: application.student._id });
      if (studentProfile) {
        studentProfile.isPlaced = true;
        studentProfile.placedAt = application.job.company;
        studentProfile.placementPackage = application.job.package;
        await studentProfile.save();
      }
    }

    // Notify student
    await Notification.create({
      user: application.student._id,
      title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your application for ${application.job.title} has been ${status}.`,
      type: status === 'shortlisted' ? 'success' : status === 'selected' ? 'success' : 'warning',
      relatedJob: application.job._id,
    });

    // Email student
    if (application.student?.email) {
      const emailBody = `<h2>Application Update</h2><p>Your application for ${application.job.title} has been ${status}.</p>`;
      sendEmail(application.student.email, `Application ${status}`, emailBody);
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/applications/:id/resume - proxy resume download
router.get('/:id/resume', authenticate, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job').populate('student');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check permissions: company who owns the job, student themselves, or admin
    const isOwner = req.user.role === 'company' && application.job.company.toString() === req.user._id.toString();
    const isStudent = req.user.role === 'student' && application.student._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isStudent && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const studentProfile = await StudentProfile.findOne({ user: application.student._id });
    if (!studentProfile || !studentProfile.resumeUrl) {
      return res.status(404).json({ success: false, message: 'No resume found' });
    }

    const filePath = path.resolve(studentProfile.resumeUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Resume file not found' });
    }

    res.download(filePath, studentProfile.resumeOriginalName || 'resume.pdf');
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk update status (company: shortlist/reject multiple)
router.put('/bulk/status', authenticate, requireRole(['company']), async (req, res) => {
  try {
    const { applicationIds, status, note } = req.body;
    const results = [];

    for (const id of applicationIds) {
      const app = await Application.findById(id).populate('job').populate('student', 'name email');
      if (app && app.job.company.toString() === req.user._id.toString()) {
        app.status = status;
        app.statusHistory.push({ status, note: note || `${status} in bulk`, changedAt: new Date() });
        await app.save();

        // Notify each student
        await Notification.create({
          user: app.student._id,
          title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: `Your application for ${app.job.title} has been ${status}.`,
          type: status === 'shortlisted' ? 'success' : 'warning',
        });

        results.push(app._id);
      }
    }

    res.json({ success: true, data: { updated: results.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
