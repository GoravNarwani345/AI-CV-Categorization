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

        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // We'll batches jobs to save API calls, or just analyze the top ones
        // For now, let's analyze the most relevant ones based on keywords first, then refine with AI
        const prompt = `
            You are an AI matching engine. Compare the candidate's profile with the list of jobs provided.
            Calculate a match percentage (0-100) based on how well the candidate's skills and experience fit each job's requirements.
            Consider semantic similarity (e.g., if they know "React", they are a good fit for "Frontend Developer" even if "Frontend" isn't in their skills).

            Candidate Profile:
            Skills: ${JSON.stringify(profile.skills)}
            Experience: ${JSON.stringify(profile.experience)}

            Jobs:
            ${jobs.map(j => `ID: ${j._id}, Title: ${j.title}, Requirements: ${JSON.stringify(j.skills)}, Description: ${j.description}`).join('\n\n')}

            Return ONLY a JSON array of objects: 
            [{"jobId": "...", "matchScore": 85, "reason": "short explanation"}]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let jsonString = response.text();

        // Clean markdown
        jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();
        const matches = JSON.parse(jsonString);

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

        // Fetch all candidate profiles
        const profiles = await Profile.find().populate('user', 'name email');
        const candidates = profiles.filter(p => p.user && p.user.role === 'candidate');

        if (candidates.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
            You are an AI specialized in technical recruiting. Your task is to rank the top 5 candidates from a given pool for a specific job post.
            
            Job Details:
            Title: ${job.title}
            Description: ${job.description}
            Skills Required: ${JSON.stringify(job.skills)}

            Candidate Pool:
            ${candidates.map(p => `
                Candidate ID: ${p.user._id}
                Name: ${p.user.name}
                Skills: ${JSON.stringify(p.skills)}
                Experience: ${JSON.stringify(p.experience)}
            `).join('\n')}

            Evaluate each candidate and provide:
            1. A matchScore (0-100).
            2. A brief matchReason (1 sentence) explaining their fit.
            3. Return the top 5 candidates ranked by score.

            Return ONLY a JSON array:
            [
                { "candidateId": "...", "name": "...", "matchScore": 95, "matchReason": "..." },
                ...
            ]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let jsonString = response.text();

        // Clean markdown
        jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();
        const rankedCandidates = JSON.parse(jsonString);

        res.json({ success: true, data: rankedCandidates });
    } catch (err) {
        console.error('AI Best Candidates Error:', err);
        res.status(500).json({ success: false, error: 'Failed to find best candidates' });
    }
});

module.exports = router;
