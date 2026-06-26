const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Notification = require('../models/Notification');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { sendEmail } = require('../services/emailService');

const router = express.Router();

router.use(authenticate, requireRole(['admin']));

// Multer config for CSV upload
const upload = multer({ storage: multer.memoryStorage() });

// ===== Faculty Management =====

// POST /api/admin/faculty - create faculty account
router.post('/faculty', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, password required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const faculty = await User.create({
      name,
      email,
      password: hashed,
      role: 'faculty',
      status: 'approved',
    });

    res.status(201).json({ success: true, data: { id: faculty._id, name: faculty.name, email: faculty.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== Student Approvals =====

// GET /api/admin/pending-students
router.get('/pending-students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student', status: 'pending' }).select('-password');
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/students/:id/approve
router.put('/students/:id/approve', async (req, res) => {
  try {
    const student = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Ensure student profile exists
    let profile = await StudentProfile.findOne({ user: student._id });
    if (!profile) {
      profile = await StudentProfile.create({ user: student._id });
    }

    // In-app notification
    await Notification.create({
      user: student._id,
      title: 'Account Approved',
      message: 'Your student account has been approved. You can now log in and apply for jobs.',
      type: 'success',
    });

    // Email notification
    if (student.email) {
      const emailBody = `<h2>Account Approved</h2><p>Your student account has been approved. You can now log in and apply for jobs.</p>`;
      sendEmail(student.email, 'Account Approved', emailBody);
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/students/:id/reject
router.put('/students/:id/reject', async (req, res) => {
  try {
    const student = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/students - all approved students
router.get('/students', async (req, res) => {
  try {
    const { branch, placed, cgpaMin, cgpaMax } = req.query;
    const filter = {};

    if (branch) filter.branch = branch;
    if (placed === 'true') filter.isPlaced = true;
    if (placed === 'false') filter.isPlaced = false;
    if (cgpaMin) filter.cgpa = { ...filter.cgpa, $gte: parseFloat(cgpaMin) };
    if (cgpaMax) filter.cgpa = { ...filter.cgpa, $lte: parseFloat(cgpaMax) };

    const students = await StudentProfile.find(filter)
      .populate('user', 'name email status')
      .sort({ 'user.name': 1 });

    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== Company Approvals =====

// GET /api/admin/pending-companies
router.get('/pending-companies', async (req, res) => {
  try {
    const companies = await User.find({ role: 'company', status: 'pending' }).select('-password');
    res.json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/companies/:id/approve
router.put('/companies/:id/approve', async (req, res) => {
  try {
    const company = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).select('-password');

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    await Notification.create({
      user: company._id,
      title: 'Account Approved',
      message: 'Your company account has been approved. You can now post jobs.',
      type: 'success',
    });

    if (company.email) {
      const emailBody = `<h2>Account Approved</h2><p>Your company account has been approved. You can now log in and post jobs.</p>`;
      sendEmail(company.email, 'Account Approved', emailBody);
    }

    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/companies/:id/reject
router.put('/companies/:id/reject', async (req, res) => {
  try {
    const company = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).select('-password');

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/companies - all approved companies
router.get('/companies', async (req, res) => {
  try {
    const companies = await User.find({ role: 'company', status: 'approved' })
      .select('-password')
      .sort({ name: 1 });

    res.json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== Bulk Import =====

// POST /api/admin/bulk-import
router.post('/bulk-import', upload.single('csv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No CSV file uploaded' });
    }

    const content = req.file.buffer.toString();
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const results = { imported: 0, failed: [] };

    for (const row of records) {
      try {
        if (!row.email || !row.name) {
          results.failed.push({ row, reason: 'Missing required fields (name, email)' });
          continue;
        }

        const existing = await User.findOne({ email: row.email });
        if (existing) {
          results.failed.push({ row, reason: 'Email already exists' });
          continue;
        }

        const tempPassword = row.rollNumber || 'password123';
        const hashed = await bcrypt.hash(tempPassword, 10);

        const user = await User.create({
          name: row.name,
          email: row.email,
          password: hashed,
          role: 'student',
          status: 'approved',
        });

        await StudentProfile.create({
          user: user._id,
          rollNumber: row.rollNumber || '',
          branch: row.branch || 'Other',
          cgpa: parseFloat(row.cgpa) || 0,
          passingYear: parseInt(row.passingYear) || new Date().getFullYear(),
          semester: parseInt(row.semester) || 1,
          profileComplete: true,
        });

        results.imported++;
      } catch (err) {
        results.failed.push({ row, reason: err.message });
      }
    }

    res.json({ success: true, ...results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
