const express = require('express');
const StudentProfile = require('../models/StudentProfile');
const Job = require('../models/Job');
const CompanyProfile = require('../models/CompanyProfile');
const authenticate = require('../middleware/auth');
const { callOpenRouter } = require('../services/aiService');

const router = express.Router();

router.use(authenticate);

// POST /api/ai/match-jobs
router.post('/match-jobs', async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(400).json({ success: false, message: 'Complete your profile first' });
    }

    const jobs = await Job.find({ status: 'active' })
      .populate('companyProfile', 'companyName industry')
      .limit(20);

    const prompt = `You are a placement counsellor. Given a student's profile and a list of job postings, rank the top 5 jobs most suitable for the student and explain why each is a good fit.

Student profile: ${JSON.stringify(studentProfile)}
Available jobs: ${JSON.stringify(jobs)}

Return ONLY valid JSON:
{
  "matches": [
    { "jobId": "...", "jobTitle": "...", "company": "...", "fitScore": 92, "reason": "..." }
  ]
}`;

    const result = await callOpenRouter(prompt);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/review-resume
router.post('/review-resume', async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(400).json({ success: false, message: 'Complete your profile first' });
    }

    const prompt = `You are an experienced placement officer reviewing a student's profile for job readiness. Analyse the profile and give actionable feedback.

Student profile: ${JSON.stringify(studentProfile)}

Return ONLY valid JSON:
{
  "overallScore": 72,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "suggestions": [
    { "area": "Skills", "recommendation": "Add more industry-relevant skills like Docker, REST APIs" }
  ],
  "missingFields": ["linkedIn", "github"]
}`;

    const result = await callOpenRouter(prompt);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/generate-job-description
router.post('/generate-job-description', async (req, res) => {
  try {
    const { role, type, skills, package: pkg, location, companyDesc } = req.body;

    const prompt = `You are an HR writing assistant. Based on the role details provided, write a complete, professional job description for a college placement portal.

Role: ${role}, Type: ${type}, Skills needed: ${skills}, Package: ${pkg} LPA, Location: ${location}, Company description: ${companyDesc}

Return ONLY valid JSON:
{
  "description": "...",
  "requirements": "...",
  "rounds": [{ "roundNumber": 1, "name": "Aptitude Test", "description": "..." }]
}`;

    const result = await callOpenRouter(prompt);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/placement-insights
router.post('/placement-insights', async (req, res) => {
  try {
    const { reportData } = req.body;

    const prompt = `You are a placement analytics expert. Analyse the following placement statistics and generate key insights, trends, and recommendations for the placement cell.

Placement data: ${JSON.stringify(reportData)}

Return ONLY valid JSON:
{
  "insights": ["..."],
  "trends": ["..."],
  "recommendations": ["..."],
  "summary": "..."
}`;

    const result = await callOpenRouter(prompt);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
