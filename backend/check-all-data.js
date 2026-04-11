/**
 * Check all profiles and jobs in database
 * Run with: node check-all-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aicv';

async function checkAllData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Load all models
        const User = require('./models/User');
        const Profile = require('./models/Profile');
        const Job = require('./models/Job');

        // Check all users
        const users = await User.find();
        console.log(`👥 Total Users: ${users.length}`);
        console.log('   Candidates:', users.filter(u => u.role === 'candidate').length);
        console.log('   Recruiters:', users.filter(u => u.role === 'recruiter').length);
        console.log('');

        // Check all profiles
        const profiles = await Profile.find().populate('user', 'name email role');
        console.log(`📋 Total Profiles: ${profiles.length}\n`);

        // Show candidate profiles
        const candidateProfiles = profiles.filter(p => p.user && p.user.role === 'candidate');
        console.log(`👤 Candidate Profiles: ${candidateProfiles.length}\n`);

        candidateProfiles.forEach((profile, index) => {
            console.log(`${index + 1}. ${profile.user.name} (${profile.user.email})`);
            console.log(`   User ID: ${profile.user._id}`);
            
            if (profile.education && profile.education.length > 0) {
                console.log('   📚 Education:');
                profile.education.forEach(edu => {
                    console.log(`      - ${edu.degree || 'N/A'} at ${edu.institution || 'N/A'} (${edu.year || 'N/A'})`);
                });
            } else {
                console.log('   📚 Education: None');
            }
            
            if (profile.experience && profile.experience.length > 0) {
                console.log('   💼 Experience:');
                profile.experience.forEach(exp => {
                    console.log(`      - ${exp.title || 'N/A'} at ${exp.company || 'N/A'} (${exp.duration || 'N/A'})`);
                });
            } else {
                console.log('   💼 Experience: None');
            }
            
            if (profile.skills && profile.skills.length > 0) {
                console.log('   🔧 Skills:', profile.skills.map(s => s.name).join(', '));
            } else {
                console.log('   🔧 Skills: None');
            }
            
            console.log('   📄 CV:', profile.cvUrl || 'Not uploaded');
            console.log('');
        });

        // Check all jobs
        const jobs = await Job.find().populate('recruiter', 'name email');
        console.log(`💼 Total Jobs: ${jobs.length}`);
        console.log('   Active:', jobs.filter(j => j.status === 'Active').length);
        console.log('   Closed:', jobs.filter(j => j.status === 'Closed').length);
        console.log('');

        if (jobs.length > 0) {
            console.log('📋 Job List:\n');
            jobs.forEach((job, index) => {
                console.log(`${index + 1}. ${job.title} at ${job.company}`);
                console.log(`   Posted by: ${job.recruiter?.name || 'Unknown'}`);
                console.log(`   Status: ${job.status}`);
                console.log(`   Level: ${job.level || 'Not specified'}`);
                console.log(`   Type: ${job.type || 'Not specified'}`);
                console.log(`   Applicants: ${job.applicantsCount || 0}`);
                console.log('');
            });
        }

        // Search for any Zebist mentions
        console.log('🔍 Searching for "Zebist" mentions...\n');
        
        const zebistInProfiles = profiles.filter(p => {
            const educationMatch = p.education?.some(edu => 
                edu.institution?.toLowerCase().includes('zebist')
            );
            const experienceMatch = p.experience?.some(exp => 
                exp.company?.toLowerCase().includes('zebist')
            );
            return educationMatch || experienceMatch;
        });

        const zebistInJobs = jobs.filter(j => 
            j.company?.toLowerCase().includes('zebist') ||
            j.title?.toLowerCase().includes('zebist')
        );

        console.log(`   Profiles with Zebist: ${zebistInProfiles.length}`);
        console.log(`   Jobs with Zebist: ${zebistInJobs.length}`);
        
        if (zebistInProfiles.length > 0) {
            console.log('\n   📋 Profiles with Zebist:');
            zebistInProfiles.forEach(p => {
                console.log(`      - ${p.user?.name || 'Unknown'}`);
            });
        }
        
        if (zebistInJobs.length > 0) {
            console.log('\n   💼 Jobs with Zebist:');
            zebistInJobs.forEach(j => {
                console.log(`      - ${j.title} at ${j.company}`);
            });
        }

        console.log('\n✅ Check complete');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

checkAllData();
