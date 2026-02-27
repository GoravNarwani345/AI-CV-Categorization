const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Applied', 'Shortlisted', 'Interview', 'Rejected', 'Hired'],
        default: 'Applied'
    },
    appliedDate: {
        type: Date,
        default: Date.now
    },
    notes: String,
    resumeSnapshot: String // URL or path to the resume at the time of application
});

// Ensure a candidate can only apply once per job
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
