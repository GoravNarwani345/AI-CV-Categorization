const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');
const { sendEmail, getPasswordResetEmail, getVerificationEmail } = require('../config/email');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Also fetch profile data
        const profile = await Profile.findOne({ user: user._id });

        res.json({
            success: true,
            user: {
                uid: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                onboardingCompleted: user.onboardingCompleted,
                ...(profile ? {
                    basicInfo: profile.basicInfo,
                    education: profile.education,
                    experience: profile.experience,
                    skills: profile.skills,
                    preferences: profile.preferences,
                    cvUrl: profile.cvUrl,
                    cvFileName: profile.cvFileName,
                    cvUploadedAt: profile.cvUploadedAt
                } : {})
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        user = new User({ name, email, password, role });

        // Generate verification token
        const verifyToken = user.getVerificationToken();
        await user.save();

        // Create profile
        const profile = new Profile({ user: user._id });
        await profile.save();

        // Send verification email
        const verifyUrl = `${CLIENT_URL}/verify-email/${verifyToken}`;
        await sendEmail(user.email, 'Verify Your Email - AI CV Categorization', getVerificationEmail(verifyUrl));

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                uid: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                onboardingCompleted: user.onboardingCompleted
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    console.log('📬 Login request received for:', req.body.email);
    try {
        const { email, password } = req.body;

        console.log('🔍 Finding user...');
        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found');
            return res.status(400).json({ success: false, error: 'Invalid credentials' });
        }

        console.log('🔑 Comparing password...');
        // Check password
        const isMatch = await user.comparePassword(password);
        console.log('⚖️ Password match result:', isMatch);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: 'Invalid credentials' });
        }

        console.log('✅ Password matched. Checking verification...');

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                error: 'Please verify your email before logging in',
                needsVerification: true
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
            { expiresIn: '7d' }
        );

        const profile = await Profile.findOne({ user: user._id });

        res.json({
            success: true,
            token,
            user: {
                uid: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                onboardingCompleted: user.onboardingCompleted,
                ...(profile ? {
                    basicInfo: profile.basicInfo,
                    education: profile.education,
                    experience: profile.experience,
                    skills: profile.skills,
                    preferences: profile.preferences,
                    cvUrl: profile.cvUrl,
                    cvFileName: profile.cvFileName,
                    cvUploadedAt: profile.cvUploadedAt
                } : {})
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if email exists
            return res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save();

        const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;
        const result = await sendEmail(user.email, 'Password Reset - AI CV Categorization', getPasswordResetEmail(resetUrl));

        if (result.success) {
            res.json({ success: true, message: 'Password reset email sent. Check your inbox.' });
        } else {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            res.status(500).json({ success: false, error: 'Email could not be sent' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ success: true, message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Verify Email
router.get('/verify-email/:token', async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({ verificationToken: hashedToken });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.json({ success: true, message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Resend Verification Email
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: true, message: 'If an account with that email exists, a verification email has been sent.' });
        }

        if (user.isVerified) {
            return res.json({ success: true, message: 'Email is already verified.' });
        }

        const verifyToken = user.getVerificationToken();
        await user.save();

        const verifyUrl = `${CLIENT_URL}/verify-email/${verifyToken}`;
        const result = await sendEmail(user.email, 'Verify Your Email - AI CV Categorization', getVerificationEmail(verifyUrl));

        if (result.success) {
            res.json({ success: true, message: 'Verification email sent. Check your inbox.' });
        } else {
            res.status(500).json({ success: false, error: 'Email could not be sent' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
