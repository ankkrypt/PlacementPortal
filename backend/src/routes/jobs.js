const express = require('express');
const Job = require('../models/Job');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const CompanyProfile = require('../models/CompanyProfile');
const Notification = require('../models/Notification');
const User = require('../models/User');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/role');
const checkEligibility = require('../utils/eligibilityChecker');
const { sendEmail } = require('../services/emailService');

const router = express.Router();

// GET /api/jobs - all active jobs (public/student)
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'active' })
      .populate('company', 'name email')
      .populate('companyProfile', 'companyName industry location')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/jobs/mine - company's own jobs
router.get('/mine', authenticate, requireRole(['company']), async (req, res) => {
  try {
    const jobs = await Job.find({ company: req.user._id })
      .populate('companyProfile', 'companyName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name email')
      .populate('companyProfile', 'companyName industry location website description');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/jobs - create job (company only)
router.post('/', authenticate, requireRole(['company']), async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({ user: req.user._id });
    const jobData = {
      ...req.body,
      company: req.user._id,
      companyProfile: companyProfile?._id,
    };

    // If no status specified, default to draft
    if (!jobData.status) {
      jobData.status = 'draft';
    }

    const job = await Job.create(jobData);

    // If creating as active, notify eligible students
    if (job.status === 'active') {
      const eligibleStudents = await StudentProfile.find({});
      for (const student of eligibleStudents) {
        const { eligible } = checkEligibility(student, job);
        if (eligible) {
          await Notification.create({
            user: student.user,
            title: 'New Job Posted',
            message: `${companyProfile?.companyName || 'A company'} posted a new job: ${job.title}`,
            type: 'info',
            relatedJob: job._id,
          });
        }
      }
    }

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/jobs/:id - update job (company only, own jobs)
router.put('/:id', authenticate, requireRole(['company']), async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, company: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/jobs/:id - soft delete (close job)
router.delete('/:id', authenticate, requireRole(['company']), async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, company: req.user._id },
      { status: 'closed' },
      { new: true }
    );
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/jobs/:id/apply - student applies
router.post('/:id/apply', authenticate, requireRole(['student']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Job is not accepting applications' });
    }

    // Check deadline
    if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
      return res.status(400).json({ success: false, message: 'Application deadline has passed' });
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(400).json({ success: false, message: 'Complete your profile first' });
    }

    if (!studentProfile.profileComplete) {
      return res.status(400).json({ success: false, message: 'Complete your profile before applying' });
    }

    // Check eligibility
    const { eligible, reasons } = checkEligibility(studentProfile, job);
    if (!eligible) {
      return res.status(400).json({ success: false, message: `Not eligible: ${reasons.join(', ')}` });
    }

    // Check duplicate
    const existing = await Application.findOne({ job: job._id, student: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already applied to this job' });
    }

    const application = await Application.create({
      job: job._id,
      student: req.user._id,
      studentProfile: studentProfile._id,
      statusHistory: [{ status: 'applied', note: 'Application submitted' }],
    });

    // Notify company
    const companyUser = await User.findById(job.company);
    await Notification.create({
      user: job.company,
      title: 'New Application Received',
      message: `${req.user.name} applied for ${job.title}`,
      type: 'info',
      relatedJob: job._id,
    });

    // Email company if configured
    if (companyUser?.email) {
      const emailBody = `<h2>New Application</h2><p>${req.user.name} has applied for ${job.title}.</p>`;
      sendEmail(companyUser.email, 'New Application Received', emailBody);
    }

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/jobs/:id/applicants - list applicants (company only)
router.get('/:id/applicants', authenticate, requireRole(['company']), async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, company: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    const applications = await Application.find({ job: job._id })
      .populate('student', 'name email')
      .populate('studentProfile')
      .sort({ appliedAt: -1 });

    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
