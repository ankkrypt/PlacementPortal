const express = require('express');
const CompanyProfile = require('../models/CompanyProfile');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();

router.use(authenticate, requireRole(['company']));

// GET /api/companies/profile
router.get('/profile', async (req, res) => {
  try {
    let profile = await CompanyProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await CompanyProfile.create({ user: req.user._id });
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/companies/profile
router.put('/profile', async (req, res) => {
  try {
    const profile = await CompanyProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
