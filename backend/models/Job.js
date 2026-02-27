const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    location: String,
    type: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
        default: 'Full-time'
    },
    salary: String,
    description: String,
    requirements: [String],
    benefits: [String],
    skills: [String],
    experience: String,
    department: String,
    applicantsCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Closed'],
        default: 'Active'
    },
    postedDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Job', jobSchema);
