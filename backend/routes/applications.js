const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @route   POST /api/applications
// @desc    Apply for a job
// @access  Private (Candidate only)
router.post('/', auth, async (req, res) => {
    try {
        const { jobId } = req.body;

        // Check if user is a candidate
        if (req.user.role !== 'candidate') {
            return res.status(403).json({ success: false, error: 'Only candidates can apply for jobs' });
        }

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        // Check if already applied
        const existingApp = await Application.findOne({ job: jobId, candidate: req.user.id });
        if (existingApp) {
            return res.status(400).json({ success: false, error: 'You have already applied for this job' });
        }

        const newApplication = new Application({
            job: jobId,
            candidate: req.user.id
        });

        await newApplication.save();

        // Real-time Notification for Recruiter
        const io = req.app.get('io');
        const notification = new Notification({
            recipient: job.recruiter,
            sender: req.user.id,
            type: 'application',
            content: `New application received for ${job.title} from ${req.user.name}`,
            link: '/recruiter/dashboard'
        });
        await notification.save();

        if (io) {
            io.to(job.recruiter.toString()).emit('new_notification', { notification });
            io.to(job.recruiter.toString()).emit('new_application', {
                jobTitle: job.title,
                candidateId: req.user.id,
                applicationId: newApplication._id
            });
        }

        res.json({ success: true, data: newApplication });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/applications/me
// @desc    Get current user's applications
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const applications = await Application.find({ candidate: req.user.id })
            .populate('job')
            .sort({ appliedDate: -1 });

        res.json({ success: true, data: applications });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/applications/job/:jobId
// @desc    Get applicants for a job
// @access  Private (Recruiter only)
router.get('/job/:jobId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        // Verify the job belongs to this recruiter
        const job = await Job.findById(req.params.jobId);
        // Note: For now we don't strictly enforce recruiter ownership in the model but we should check it

        const applications = await Application.find({ job: req.params.jobId })
            .populate({
                path: 'candidate',
                select: 'name email',
            })
            .sort({ appliedDate: -1 });

        // We also need to fetch the profiles separately if we want full details
        const enrichedApplications = await Promise.all(applications.map(async (app) => {
            const profile = await Profile.findOne({ user: app.candidate._id });
            return {
                ...app._doc,
                candidateProfile: profile
            };
        }));

        res.json({ success: true, data: enrichedApplications });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/applications/:id
// @desc    Update application status
// @access  Private (Recruiter only)
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const { status } = req.body;
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }

        application.status = status;
        await application.save();

        // Real-time Notification for Candidate
        const io = req.app.get('io');
        const job = await Job.findById(application.job);
        const notification = new Notification({
            recipient: application.candidate,
            sender: req.user.id,
            type: 'status_update',
            content: `Your application for ${job?.title || 'a job'} has been updated to: ${status}`,
            link: '/candidate/dashboard'
        });
        await notification.save();

        if (io) {
            io.to(application.candidate.toString()).emit('new_notification', { notification });
            io.to(application.candidate.toString()).emit('application_status_updated', {
                applicationId: application._id,
                status: status
            });
        }

        res.json({ success: true, data: application });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/applications/stats
// @desc    Get application statistics for charts
// @access  Private (Recruiter only)
router.get('/stats', auth, async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const stats = await Application.aggregate([
            {
                $group: {
                    _id: {
                        month: { $month: "$appliedDate" },
                        year: { $year: "$appliedDate" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Map to a more frontend-friendly format
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedStats = stats.map(s => ({
            month: monthNames[s._id.month - 1],
            applications: s.count
        }));

        res.json({ success: true, data: formattedStats });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/applications/:id/ai-insights
// @desc    Generate AI insights (summary + interview questions) for an application
// @access  Private (Recruiter only)
router.get('/:id/ai-insights', auth, async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const application = await Application.findById(req.params.id)
            .populate('job')
            .populate('candidate');

        if (!application) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }

        // Fetch the candidate's profile to get the full background
        const profile = await Profile.findOne({ user: application.candidate._id });
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Candidate profile not found' });
        }

        const { getAIInsights } = require('../utils/ai');
        const insights = await getAIInsights(application.job, profile);

        res.json({ success: true, data: insights });
    } catch (err) {
        console.error('AI Insights Error:', err);
        res.status(500).json({ success: false, error: 'Failed to generate AI insights' });
    }
});

// @route   GET /api/applications/recent
// @desc    Get recent applications for recruiter activity feed
// @access  Private (Recruiter only)
router.get('/recent', auth, async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        // Find all jobs by this recruiter first to filter activity
        const jobs = await Job.find({ recruiter: req.user.id });
        const jobIds = jobs.map(j => j._id);

        const activities = await Application.find({ job: { $in: jobIds } })
            .populate('candidate', 'name email')
            .populate('job', 'title')
            .sort({ appliedDate: -1 })
            .limit(10);

        res.json({ success: true, data: activities });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/applications/:id/outreach-draft
// @desc    Generate a personalized outreach message for a candidate
// @access  Private (Recruiter only)
router.get('/:id/outreach-draft', auth, async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const application = await Application.findById(req.params.id)
            .populate('job')
            .populate('candidate');

        if (!application) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }

        const profile = await Profile.findOne({ user: application.candidate._id });
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Candidate profile not found' });
        }

        const { getOutreachDraft } = require('../utils/ai');
        const draft = await getOutreachDraft(application.job, application.candidate, profile);

        res.json({ success: true, data: draft });
    } catch (err) {
        console.error('Outreach Draft Error:', err);
        res.status(500).json({ success: false, error: 'Failed to generate outreach draft' });
    }
});

module.exports = router;
