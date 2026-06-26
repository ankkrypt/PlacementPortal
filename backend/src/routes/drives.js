const express = require('express');
const Drive = require('../models/Drive');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();

router.use(authenticate, requireRole(['admin']));

// GET /api/drives
router.get('/', async (req, res) => {
  try {
    const drives = await Drive.find()
      .populate('company', 'companyName')
      .populate('job', 'title')
      .sort({ date: -1 });
    res.json({ success: true, data: drives });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/drives/:id
router.get('/:id', async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id)
      .populate('company', 'companyName')
      .populate('job', 'title')
      .populate('createdBy', 'name');
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    res.json({ success: true, data: drive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/drives
router.post('/', async (req, res) => {
  try {
    const drive = await Drive.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: drive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/drives/:id
router.put('/:id', async (req, res) => {
  try {
    const drive = await Drive.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    res.json({ success: true, data: drive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/drives/:id
router.delete('/:id', async (req, res) => {
  try {
    const drive = await Drive.findByIdAndDelete(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    res.json({ success: true, message: 'Drive deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
