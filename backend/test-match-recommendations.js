const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Profile = require('./models/Profile');
const Job = require('./models/Job');
const Application = require('./models/Application');

async function testMatchRecommendations() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aicv');
        console.log('✅ Connected to MongoDB');

        // Find Sarah Chen
        const sarah = await User.findOne({ email: 'sarah@example.com' });
        if (!sarah) {
            console.error('❌ Sarah Chen not found');
            process.exit(1);
        }

        const profile = await Profile.findOne({ user: sarah._id });
        if (!profile) {
            console.error('❌ Sarah\'s profile not found');
            process.exit(1);
        }

        const applications = await Application.find({ candidate: sarah._id });
        const appliedJobIds = applications.map(app => app.job.toString());

        // Helper function for recommendation filtering
        const getRecommendations = (experienceList) => {
            const userOrganizations = (experienceList || [])
                .filter(exp => exp.duration && exp.duration.toLowerCase().includes('present'))
                .map(exp => exp.company ? exp.company.trim().toLowerCase() : '')
                .filter(c => c.length > 0);

            const isUserOrganization = (jobCompany) => {
                if (!jobCompany) return false;
                const jobCompanyLower = jobCompany.trim().toLowerCase();
                
                return userOrganizations.some(userOrg => {
                    const extractKeywords = (name) => {
                        return name
                            .replace(/\b(university|institute|college|campus|school|academy|technology|sciences?|pvt|ltd|limited|inc|corporation|company|org|organization|the|of|and)\b/gi, '')
                            .trim()
                            .split(/\s+/)
                            .filter(word => word.length > 2);
                    };
                    
                    const userKeywords = extractKeywords(userOrg);
                    const jobKeywords = extractKeywords(jobCompanyLower);
                    
                    if (userKeywords.length > 0 && jobKeywords.length > 0) {
                        const hasMatch = userKeywords.some(uk => 
                            jobKeywords.some(jk => {
                                if (uk.length >= 3 && jk.length >= 3) {
                                    return jk.includes(uk) || uk.includes(jk);
                                }
                                return false;
                            })
                        );
                        if (hasMatch) return true;
                    }
                    
                    if (userOrg.length >= 3 && jobCompanyLower.length >= 3) {
                        if (jobCompanyLower.includes(userOrg) || userOrg.includes(jobCompanyLower)) {
                            return true;
                        }
                    }
                    return false;
                });
            };

            const userExperienceYears = experienceList?.length || 0;
            const isFresher = userExperienceYears === 0;

            return allActiveJobs.filter(job => {
                if (appliedJobIds.includes(job._id.toString())) return false;
                if (isUserOrganization(job.company)) return false;
                if (job.level === 'Fresher' && !isFresher) return false;
                return true;
            });
        };

        const allActiveJobs = await Job.find({ status: 'Active' });

        // Case 3: Sarah Chen ONLY graduated from SZABIST (no experience there)
        console.log('\n==================================================');
        console.log('CASE 3: CANDIDATE ONLY GRADUATED FROM SZABIST');
        console.log('==================================================');
        console.log('Education lists Shaheed Zulifkar Ali Bhutto Institute of Science and Technology (SZABIST),');
        console.log('but experience has NO entries related to SZABIST.');
        
        // Remove all SZABIST entries from experience for this case
        const noSzabistExperience = profile.experience.filter(exp => 
            !exp.company.toLowerCase().includes('szabist')
        );

        console.log('\n💼 Experience (Mocked with no SZABIST experience):');
        noSzabistExperience.forEach(exp => {
            console.log(`   - ${exp.title} at "${exp.company}" (${exp.duration})`);
        });

        const case3Recommendations = getRecommendations(noSzabistExperience);
        console.log(`\n📋 Recommended Jobs count: ${case3Recommendations.length}`);
        case3Recommendations.forEach((job, index) => {
            const isSzabist = job.company.toLowerCase().includes('szabist') ? '🔥 SZABIST ROLE' : '';
            console.log(`   ${index + 1}. "${job.title}" at "${job.company}" (${job.level}) ${isSzabist}`);
        });

    } catch (e) {
        console.error('Test Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}

testMatchRecommendations();
