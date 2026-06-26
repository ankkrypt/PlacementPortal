const express = require('express');
const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const Job = require('../models/Job');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { sendEmail } = require('../services/emailService');

const router = express.Router();

// GET /api/interviews - company gets their interviews
router.get('/', authenticate, requireRole(['company', 'admin']), async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'company') {
      const jobs = await Job.find({ company: req.user._id }).select('_id');
      const jobIds = jobs.map((j) => j._id);
      query = { job: { $in: jobIds } };
    }
    const interviews = await Interview.find(query)
      .populate('student', 'name email')
      .populate({ path: 'job', select: 'title' })
      .sort({ scheduledAt: -1 });
    res.json({ success: true, data: interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/interviews - schedule interview
router.post('/', authenticate, requireRole(['company']), async (req, res) => {
  try {
    const { jobId, studentId, scheduledAt, venue, roundName, mode, meetLink } = req.body;

    const job = await Job.findOne({ _id: jobId, company: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    const interview = await Interview.create({
      job: jobId,
      student: studentId,
      scheduledAt,
      venue,
      roundName: roundName || 'Technical',
      mode: mode || 'offline',
      meetLink,
    });

    // Update application with interview slot
    await Application.findOneAndUpdate(
      { job: jobId, student: studentId },
      { interviewSlot: interview._id, status: 'interview_scheduled' }
    );

    // Notify student
    await Notification.create({
      user: studentId,
      title: 'Interview Scheduled',
      message: `Interview for ${job.title} scheduled on ${new Date(scheduledAt).toLocaleString()}`,
      type: 'info',
      relatedJob: jobId,
    });

    res.status(201).json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/interviews/:id/outcome
router.put('/:id/outcome', authenticate, requireRole(['company']), async (req, res) => {
  try {
    const { outcome, notes } = req.body;
    const interview = await Interview.findById(req.params.id).populate({
      path: 'job',
      select: 'company title',
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    // Check if company owns the job
    const job = await Job.findOne({ _id: interview.job._id, company: req.user._id });
    if (!job) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    interview.outcome = outcome;
    interview.notes = notes || interview.notes;
    await interview.save();

    res.json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
