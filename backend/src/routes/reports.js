const express = require('express');
const StudentProfile = require('../models/StudentProfile');
const CompanyProfile = require('../models/CompanyProfile');
const User = require('../models/User');
const Job = require('../models/Job');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// GET /api/reports/summary
router.get('/summary', async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student', status: 'approved' });
    const placedStudents = await StudentProfile.countDocuments({ isPlaced: true });
    const unplaced = totalStudents - placedStudents;
    const totalCompanies = await User.countDocuments({ role: 'company', status: 'approved' });
    const totalDrives = await Drive.countDocuments();

    const avgPackageResult = await StudentProfile.aggregate([
      { $match: { isPlaced: true, placementPackage: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$placementPackage' } } },
    ]);
    const avgPackage = avgPackageResult.length > 0 ? avgPackageResult[0].avg.toFixed(2) : 0;

    const highestPackageResult = await StudentProfile.find({ isPlaced: true })
      .sort({ placementPackage: -1 })
      .limit(1)
      .select('placementPackage');
    const highestPackage = highestPackageResult.length > 0 ? highestPackageResult[0].placementPackage : 0;

    const placementPercentage = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        totalStudents,
        placed: placedStudents,
        unplaced,
        placementPercentage: parseFloat(placementPercentage),
        avgPackage: parseFloat(avgPackage),
        highestPackage,
        totalCompanies,
        totalDrives,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reports/branch-wise
router.get('/branch-wise', async (req, res) => {
  try {
    const result = await StudentProfile.aggregate([
      {
        $group: {
          _id: '$branch',
          total: { $sum: 1 },
          placed: { $sum: { $cond: ['$isPlaced', 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const data = result.map((r) => ({
      branch: r._id,
      total: r.total,
      placed: r.placed,
      percentage: r.total > 0 ? ((r.placed / r.total) * 100).toFixed(2) : 0,
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reports/company-wise
router.get('/company-wise', async (req, res) => {
  try {
    const result = await StudentProfile.aggregate([
      { $match: { placedAt: { $ne: null } } },
      {
        $group: {
          _id: '$placedAt',
          studentsHired: { $sum: 1 },
          avgPackage: { $avg: '$placementPackage' },
        },
      },
      { $sort: { studentsHired: -1 } },
    ]);

    // Get company names
    const companies = await CompanyProfile.find({
      _id: { $in: result.map((r) => r._id).filter(Boolean) },
    });

    const data = result.map((r) => {
      const company = companies.find((c) => c._id.toString() === (r._id?.toString() || ''));
      return {
        companyName: company?.companyName || 'Unknown',
        studentsHired: r.studentsHired,
        avgPackage: r.avgPackage ? r.avgPackage.toFixed(2) : 0,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reports/year-wise
router.get('/year-wise', async (req, res) => {
  try {
    const result = await StudentProfile.aggregate([
      {
        $group: {
          _id: '$passingYear',
          total: { $sum: 1 },
          placed: { $sum: { $cond: ['$isPlaced', 1, 0] } },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const data = result.map((r) => ({
      year: r._id,
      placed: r.placed,
      unplaced: r.total - r.placed,
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reports/monthly-drives
router.get('/monthly-drives', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const result = await Drive.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map((name, index) => {
      const found = result.find((r) => r._id === index + 1);
      return { month: name, count: found ? found.count : 0 };
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
