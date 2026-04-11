/**
 * Find all candidates and check their organizations
 * Run with: node find-candidates.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aicv';

async function findCandidates() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const User = require('./models/User');
        const Profile = require('./models/Profile');
        const Job = require('./models/Job');

        // Find all candidates
        const candidates = await User.find({ role: 'candidate' });
        console.log(`👥 Total Candidates: ${candidates.length}\n`);

        for (const candidate of candidates) {
            const profile = await Profile.findOne({ user: candidate._id });
            
            console.log('='.repeat(80));
            console.log(`\n👤 ${candidate.name} (${candidate.email})`);
            console.log(`   User ID: ${candidate._id}`);
            console.log(`   Role: ${candidate.role}`);
            
            if (profile) {
                console.log('\n📚 Education:');
                if (profile.education && profile.education.length > 0) {
                    profile.education.forEach(edu => {
                        console.log(`   - ${edu.degree || 'N/A'} at ${edu.institution || 'N/A'}`);
                    });
                } else {
                    console.log('   None');
                }
                
                console.log('\n💼 Experience:');
                if (profile.experience && profile.experience.length > 0) {
                    profile.experience.forEach(exp => {
                        console.log(`   - ${exp.title || 'N/A'} at ${exp.company || 'N/A'}`);
                    });
                } else {
                    console.log('   None');
                }

                // Extract organizations
                const companies = (profile.experience || [])
                    .map(exp => exp.company)
                    .filter(c => c);
                
                const institutions = (profile.education || [])
                    .map(edu => edu.institution)
                    .filter(i => i);

                console.log('\n🏢 Organizations (will be excluded from recommendations):');
                [...companies, ...institutions].forEach(org => {
                    console.log(`   - ${org}`);
                });

                // Check if has SZABIST
                const hasSwabist = [...companies, ...institutions].some(org => 
                    org.toLowerCase().includes('szabist')
                );

                if (hasSwabist) {
                    console.log('\n⚠️ This candidate has SZABIST in their profile!');
                    console.log('   They should NOT see Szabist University Pakistan jobs');
                }
            } else {
                console.log('\n❌ No profile found');
            }
            
            console.log('');
        }

        // Find all Szabist jobs
        const szabistJobs = await Job.find({ 
            company: { $regex: 'szabist', $options: 'i' },
            status: 'Active'
        });

        console.log('='.repeat(80));
        console.log(`\n💼 Szabist Jobs (${szabistJobs.length}):\n`);
        szabistJobs.forEach(job => {
            console.log(`   - ${job.title} at ${job.company}`);
        });

        console.log('\n' + '='.repeat(80));
        console.log('\n📊 SUMMARY:\n');
        
        const candidatesWithSzabist = [];
        for (const candidate of candidates) {
            const profile = await Profile.findOne({ user: candidate._id });
            if (profile) {
                const companies = (profile.experience || []).map(exp => exp.company).filter(c => c);
                const institutions = (profile.education || []).map(edu => edu.institution).filter(i => i);
                const hasSwabist = [...companies, ...institutions].some(org => 
                    org.toLowerCase().includes('szabist')
                );
                if (hasSwabist) {
                    candidatesWithSzabist.push(candidate.name);
                }
            }
        }

        console.log(`Total Candidates: ${candidates.length}`);
        console.log(`Candidates with SZABIST: ${candidatesWithSzabist.length}`);
        if (candidatesWithSzabist.length > 0) {
            console.log(`Names: ${candidatesWithSzabist.join(', ')}`);
        }
        console.log(`Szabist Jobs: ${szabistJobs.length}`);
        
        if (candidatesWithSzabist.length > 0 && szabistJobs.length > 0) {
            console.log('\n✅ Test scenario available!');
            console.log(`   Login as: ${candidatesWithSzabist[0]}`);
            console.log('   Check job recommendations');
            console.log('   Should NOT see Szabist jobs');
        } else if (candidatesWithSzabist.length === 0) {
            console.log('\n⚠️ No candidates with SZABIST found');
            console.log('   Need to create a candidate with SZABIST in education/experience');
        } else if (szabistJobs.length === 0) {
            console.log('\n⚠️ No Szabist jobs found');
            console.log('   Need to create jobs from Szabist University');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

findCandidates();
