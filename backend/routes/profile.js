const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const User = require('../models/User');

// Get all profiles (for recruiter candidate browsing)
router.get('/', auth, async (req, res) => {
    try {
        const profiles = await Profile.find()
            .populate('user', ['name', 'email', 'role', 'onboardingCompleted']);
        res.json({ success: true, data: profiles });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'email', 'role', 'onboardingCompleted']);
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }
        res.json({ success: true, data: profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Update profile
router.put('/me', auth, async (req, res) => {
    try {
        const { basicInfo, education, experience, skills, recruiterInfo, preferences, onboardingCompleted } = req.body;

        const profileFields = {
            basicInfo,
            education,
            experience,
            skills,
            recruiterInfo,
            preferences,
            updatedAt: Date.now()
        };

        let profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true, upsert: true }
        );

        // If onboarding is completed, update the user model too
        if (onboardingCompleted) {
            await User.findByIdAndUpdate(req.user.id, { onboardingCompleted: true });
        }

        res.json({ success: true, data: profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Get profile by user ID (for recruiter viewing applicants)
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.userId }).populate('user', ['name', 'email']);
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }
        res.json({ success: true, data: profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/profiles/career-tips
// @desc    Get AI-generated career tips based on profile
// @access  Private
router.get('/career-tips', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        // Logic to generate tips using Gemini
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
            Based on the following candidate profile, provide:
            1. 4 personalized career tips/suggestions.
            2. 3-4 recommended certificate courses that would help this candidate bridge skill gaps or advance their career.

            Return ONLY a JSON object: 
            { 
              "tips": [{ "title": "...", "description": "...", "iconType": "book|cert|users|lightbulb" }],
              "courses": [{ "title": "...", "description": "...", "provider": "Coursera|Udemy|edX|Other", "type": "Free|Paid", "relevance": "Explain why this helps", "platformUrl": "https://..." }]
            }
            
            Profile:
            Experience: ${JSON.stringify(profile.experience)}
            Skills: ${JSON.stringify(profile.skills)}
            Education: ${JSON.stringify(profile.education)}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let jsonString = response.text();

        // Clean markdown
        jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();
        const careerData = JSON.parse(jsonString);

        res.json({ success: true, data: careerData });
    } catch (error) {
        console.error('Career Tips Error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate AI career tips' });
    }
});

// @route   GET /api/profiles/stats
// @desc    Get profile growth statistics
// @access  Private (Recruiter only)
router.get('/stats', auth, async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const stats = await Profile.aggregate([
            {
                $group: {
                    _id: {
                        month: { $month: "$cvUploadedAt" },
                        year: { $year: "$cvUploadedAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedStats = stats.map(s => ({
            month: monthNames[s._id.month - 1],
            candidates: s.count
        }));

        res.json({ success: true, data: formattedStats });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
