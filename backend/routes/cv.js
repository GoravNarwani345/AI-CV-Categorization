const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const { analyzeCV } = require('../utils/ai');
const fs = require('fs');

// Configure Multer for disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF documents are allowed for AI analysis.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Upload CV
router.post('/upload', auth, upload.single('cv'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload a file' });
        }

        console.log(`📤 Received CV upload request for user: ${req.user.id}`);
        console.log(`📂 File saved as: ${req.file.filename}`);

        // Create full path for AI analysis
        const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);

        // Analyze CV automatically
        let aiData = null;
        try {
            console.log('🤖 Triggering AI Analysis...');
            aiData = await analyzeCV(filePath);
            console.log('✅ AI Analysis completed successfully');
        } catch (aiError) {
            console.error('AI Analysis failed during upload:', aiError);
            // We continue even if AI fails, so the user at least has the file uploaded
        }

        const cvUrl = `/uploads/${req.file.filename}`;

        // Update Profile with CV data and AI results
        const updateData = {
            cvUrl: cvUrl,
            cvFileName: req.file.originalname,
            cvUploadedAt: Date.now(),
            updatedAt: Date.now()
        };

        if (aiData) {
            if (aiData.basicInfo) updateData.basicInfo = aiData.basicInfo;
            if (aiData.education) updateData.education = aiData.education;
            if (aiData.experience) updateData.experience = aiData.experience;
            if (aiData.skills) updateData.skills = aiData.skills;
        }

        const updateQuery = { $set: updateData };

        // Push current state to history if profile exists
        const existingProfile = await Profile.findOne({ user: req.user.id });
        if (existingProfile) {
            updateQuery.$push = {
                history: {
                    $each: [{
                        basicInfo: existingProfile.basicInfo,
                        education: existingProfile.education,
                        experience: existingProfile.experience,
                        skills: existingProfile.skills,
                        cvUrl: existingProfile.cvUrl,
                        cvFileName: existingProfile.cvFileName,
                        timestamp: existingProfile.updatedAt || Date.now()
                    }],
                    $position: 0,
                    $slice: 10
                }
            };
        }

        const profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            updateQuery,
            { new: true, upsert: true }
        );

        console.log('💾 Profile updated in database');

        res.json({
            success: true,
            message: aiData ? 'CV uploaded and analyzed successfully' : 'CV uploaded successfully (AI analysis pending)',
            data: {
                cvUrl,
                cvFileName: req.file.originalname,
                profile: profile // Return full profile so frontend can update state correctly
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message || 'Server error during upload' });
    }
});

// Analyze CV with AI
router.post('/analyze', auth, async (req, res) => {
    try {
        const { saveToProfile, completeOnboarding } = req.body;
        console.log(`🤖 AI Analysis requested for user: ${req.user.id} (Save: ${saveToProfile}, Complete: ${completeOnboarding})`);

        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile || !profile.cvUrl) {
            return res.status(400).json({ success: false, error: 'No CV found. Please upload one first.' });
        }

        // profile.cvUrl is usually something like '/uploads/file.pdf'
        // We need to resolve it relative to the backend root
        const filePath = path.join(__dirname, '..', profile.cvUrl);
        console.log(`📂 Analyzing file at: ${filePath}`);

        if (!fs.existsSync(filePath)) {
            console.error(`❌ CV file not found: ${filePath}`);
            return res.status(404).json({ success: false, error: 'CV file not found on server' });
        }

        const aiData = await analyzeCV(filePath);
        console.log('✅ AI Analysis completed');

        // If requested, save results directly to profile
        if (saveToProfile && aiData) {
            const updateData = {};
            if (aiData.basicInfo) updateData.basicInfo = aiData.basicInfo;
            if (aiData.education) updateData.education = aiData.education;
            if (aiData.experience) updateData.experience = aiData.experience;
            if (aiData.skills) updateData.skills = aiData.skills;

            if (completeOnboarding) {
                updateData.onboardingCompleted = true;
            }

            await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: updateData },
                { new: true }
            );

            // Also update the User model if onboarding is completed
            if (completeOnboarding) {
                const User = require('../models/User');
                await User.findByIdAndUpdate(req.user.id, { onboardingCompleted: true });
                console.log('🏁 User onboarding marked as completed');
            }
        }

        res.json({
            success: true,
            message: saveToProfile ? 'AI Analysis complete and profile updated' : 'AI Analysis complete',
            data: aiData
        });

    } catch (error) {
        console.error('CV Analysis Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to analyze CV'
        });
    }
});

// AI Rephrase Text
router.post('/rephrase', auth, async (req, res) => {
    try {
        const { text, context } = req.body;

        if (!text || !context) {
            return res.status(400).json({ success: false, error: 'Text and context are required' });
        }

        console.log(`🤖 AI Rephrase requested by user: ${req.user.id}`);
        // We need to import rephraseText, so let's destructure it at the top or here.
        // It's already destructured at the top in the next step, wait, let's fix the imports too.
        const { rephraseText } = require('../utils/ai');

        const rephrasedText = await rephraseText(text, context);

        res.json({
            success: true,
            data: rephrasedText
        });

    } catch (error) {
        console.error('AI Rephrase Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to rephrase text'
        });
    }
});

// AI Customize CV for Job
router.post('/customize', auth, async (req, res) => {
    try {
        const { jobInfo, conversation } = req.body;

        if (!jobInfo) {
            return res.status(400).json({ success: false, error: 'Job Information is required' });
        }

        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        const { getCustomizedCV } = require('../utils/ai');
        const result = await getCustomizedCV(profile, jobInfo, conversation || []);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('AI CV Customization Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to customize CV'
        });
    }
});

module.exports = router;
