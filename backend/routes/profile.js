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
        const { name, basicInfo, education, experience, skills, recruiterInfo, preferences, onboardingCompleted } = req.body;

        // Sanitize experience: AI sometimes returns description as an array of bullet strings.
        // Mongoose schema expects a plain String, so we join arrays before saving.
        const sanitizedExperience = (experience || []).map(exp => ({
            ...exp,
            description: Array.isArray(exp.description)
                ? exp.description.join('\n')
                : (exp.description || '')
        }));

        const profileFields = {
            basicInfo,
            education,
            experience: sanitizedExperience,
            skills,
            recruiterInfo,
            preferences,
            updatedAt: Date.now()
        };

        // 1. Fetch the existing profile to capture history
        const existingProfile = await Profile.findOne({ user: req.user.id });

        let updateQuery = { $set: profileFields };

        if (existingProfile) {
            // Capture history snapshot BEFORE updating
            const historySnapshot = {
                basicInfo: existingProfile.basicInfo,
                education: existingProfile.education,
                experience: existingProfile.experience,
                skills: existingProfile.skills,
                cvUrl: existingProfile.cvUrl,
                cvFileName: existingProfile.cvFileName,
                timestamp: existingProfile.updatedAt || Date.now()
            };

            // Limit history to 10 versions and add to $push
            updateQuery.$push = {
                history: {
                    $each: [historySnapshot],
                    $position: 0,
                    $slice: 10
                }
            };
            console.log(`📜 History snapshot created for user: ${req.user.id}`);
        }

        let profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            updateQuery,
            { new: true, upsert: true }
        );

        // Update User model name if provided
        if (name) {
            await User.findByIdAndUpdate(req.user.id, { name });
        }

        // If onboarding is completed, update the user model too
        if (onboardingCompleted) {
            await User.findByIdAndUpdate(req.user.id, { onboardingCompleted: true });
        }

        res.json({ success: true, data: profile });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, error: 'Server error during profile update' });
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
// @desc    Get AI-generated career tips based on CV
// @access  Private
router.get('/career-tips', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile || !profile.cvUrl) {
            return res.json({
                success: true,
                data: {
                    tips: [{ title: "Upload Your CV", description: "Upload your CV to get AI career suggestions.", iconType: "lightbulb" }],
                    courses: []
                }
            });
        }

        const fs = require('fs');
        const path = require('path');
        const pdf = require('pdf-parse');

        const filePath = path.join(__dirname, '..', profile.cvUrl);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, error: 'CV file not found on server' });
        }

        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdf(dataBuffer);
        const cvText = pdfData.text;

        const { getCareerTips } = require('../utils/ai');
        const careerData = await getCareerTips(cvText);

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
