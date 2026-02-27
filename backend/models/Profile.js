const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    basicInfo: {
        phone: String,
        location: String,
        bio: String
    },
    education: [{
        degree: String,
        institution: String,
        year: String,
        grade: String
    }],
    experience: [{
        title: String,
        company: String,
        duration: String,
        description: String
    }],
    skills: [{
        name: String,
        level: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
            default: 'Beginner'
        }
    }],
    recruiterInfo: {
        companyName: String,
        industry: String,
        companySize: String,
        website: String,
        contactEmail: String,
        contactPhone: String,
        logoUrl: String,
        companyDescription: String
    },
    preferences: {
        jobType: [String],
        salaryRange: String,
        locationPreference: String
    },
    cvUrl: String,
    cvFileName: String,
    cvUploadedAt: Date,
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Profile', profileSchema);
