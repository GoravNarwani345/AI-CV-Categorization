const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const User = require('../models/User');

// Get all jobs
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ postedDate: -1 });
        res.json({ success: true, data: jobs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Get recruiter's own jobs
router.get('/me', auth, async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }
        const jobs = await Job.find({ recruiter: req.user.id }).sort({ postedDate: -1 });
        res.json({ success: true, data: jobs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Create a job (Recruiter only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'recruiter') {
        return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    try {
        const newJob = new Job({
            ...req.body,
            recruiter: req.user.id
        });

        const job = await newJob.save();
        res.status(201).json({ success: true, data: job });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Update a job (Recruiter only)
router.put('/:id', auth, async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        // Check if user is the recruiter who posted it
        if (job.recruiter.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        job = await Job.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json({ success: true, data: job });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Delete a job
router.delete('/:id', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        // Check if user is the recruiter who posted it
        if (job.recruiter.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await Job.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Job removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/jobs/match
// @desc    Get semantic match score for a candidate profile against jobs
// @access  Private
router.get('/match', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        const jobs = await Job.find({ status: 'Active' });
        if (jobs.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const { getJobMatches } = require('../utils/ai');
        const matches = await getJobMatches(profile, jobs);

        res.json({ success: true, data: matches });
    } catch (err) {
        console.error('AI Matching Error:', err);
        res.status(500).json({ success: false, error: 'Failed to calculate smart matches' });
    }
});

// @route   GET /api/jobs/popular-skills
// @desc    Get most common skills required in jobs
// @access  Private (Recruiter only)
router.get('/popular-skills', auth, async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const skills = await Job.aggregate([
            { $unwind: "$skills" },
            { $group: { _id: "$skills", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 }
        ]);

        const formattedSkills = skills.map(s => ({
            skill: s._id,
            count: s.count
        }));

        res.json({ success: true, data: formattedSkills });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/jobs/:id/best-candidates
// @desc    Get AI-ranked candidates for a specific job
// @access  Private (Recruiter only)
router.get('/:id/best-candidates', auth, async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        // Check if user is the recruiter who posted it
        if (job.recruiter.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        // Fetch all candidate profiles
        const profiles = await Profile.find().populate('user', 'name email');
        const candidates = profiles.filter(p => p.user && p.user.role === 'candidate');

        if (candidates.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const { getRankedCandidates } = require('../utils/ai');
        const rankedCandidates = await getRankedCandidates(job, candidates);

        res.json({ success: true, data: rankedCandidates });
    } catch (err) {
        console.error('AI Best Candidates Error:', err);
        res.status(500).json({ success: false, error: 'Failed to find best candidates' });
    }
});

module.exports = router;
