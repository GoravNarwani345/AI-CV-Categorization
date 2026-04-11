/**
 * Quick check for Zebist filtering issue
 * Run with: node quick-check-zebist.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aicv';

async function quickCheck() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Load all models
        const User = require('./models/User');
        const Profile = require('./models/Profile');
        const Job = require('./models/Job');

        // Find profiles with Zebist
        const profiles = await Profile.find().populate('user', 'name email role');
        const zebistProfiles = profiles.filter(p => 
            p.user?.role === 'candidate' && (
                p.experience?.some(exp => exp.company?.toLowerCase().includes('zebist')) ||
                p.education?.some(edu => edu.institution?.toLowerCase().includes('zebist'))
            )
        );

        console.log(`📊 Found ${zebistProfiles.length} candidate(s) with Zebist in profile\n`);

        if (zebistProfiles.length === 0) {
            console.log('⚠️ No candidates found with Zebist. Please:');
            console.log('   1. Upload a CV with Zebist University');
            console.log('   2. Or manually add Zebist to education in profile');
            await mongoose.disconnect();
            return;
        }

        // Find Zebist jobs
        const zebistJobs = await Job.find({ 
            company: { $regex: 'zebist', $options: 'i' },
            status: 'Active'
        });

        console.log(`📊 Found ${zebistJobs.length} active Zebist job(s)\n`);

        if (zebistJobs.length === 0) {
            console.log('⚠️ No Zebist jobs found. Please:');
            console.log('   1. Create a job with company "Zebist University"');
            console.log('   2. Ensure job status is "Active"');
            await mongoose.disconnect();
            return;
        }

        // Test each candidate
        for (const profile of zebistProfiles) {
            console.log('='.repeat(80));
            console.log(`\n👤 Testing: ${profile.user.name} (${profile.user.email})\n`);

            // Extract organizations
            const institutions = (profile.education || [])
                .map(edu => edu.institution)
                .filter(i => i);
            
            const companies = (profile.experience || [])
                .map(exp => exp.company)
                .filter(c => c);

            console.log('📚 Education institutions:', institutions);
            console.log('💼 Work companies:', companies);

            const userOrganizations = [
                ...companies.map(c => c.trim().toLowerCase()),
                ...institutions.map(i => i.trim().toLowerCase())
            ];

            console.log('🏢 Organizations (normalized):', userOrganizations);
            console.log('');

            // Test each Zebist job
            for (const job of zebistJobs) {
                console.log(`🎯 Testing job: "${job.title}" at "${job.company}"`);
                
                const jobCompanyLower = job.company.trim().toLowerCase();
                let shouldExclude = false;
                let matchReason = '';

                for (const userOrg of userOrganizations) {
                    // Direct substring match
                    if (jobCompanyLower.includes(userOrg) || userOrg.includes(jobCompanyLower)) {
                        shouldExclude = true;
                        matchReason = `Direct match: "${userOrg}" <-> "${jobCompanyLower}"`;
                        break;
                    }

                    // Keyword match
                    const extractKeywords = (name) => {
                        return name
                            .replace(/\b(university|institute|college|campus|school|academy|technology|sciences?|pvt|ltd|limited|inc|corporation|company|org|organization|the|of|and)\b/gi, '')
                            .trim()
                            .split(/\s+/)
                            .filter(word => word.length > 2);
                    };

                    const userKeywords = extractKeywords(userOrg);
                    const jobKeywords = extractKeywords(jobCompanyLower);

                    const hasKeywordMatch = userKeywords.some(uk => 
                        jobKeywords.some(jk => {
                            if (uk.length >= 3 && jk.length >= 3) {
                                return jk.includes(uk) || uk.includes(jk);
                            }
                            return false;
                        })
                    );

                    if (hasKeywordMatch) {
                        shouldExclude = true;
                        matchReason = `Keyword match: [${userKeywords.join(', ')}] <-> [${jobKeywords.join(', ')}]`;
                        break;
                    }
                }

                if (shouldExclude) {
                    console.log(`   ✅ CORRECTLY EXCLUDED`);
                    console.log(`   Reason: ${matchReason}`);
                } else {
                    console.log(`   ❌ BUG: NOT EXCLUDED (should be excluded!)`);
                    console.log(`   This is the problem!`);
                }
                console.log('');
            }
        }

        console.log('='.repeat(80));
        console.log('\n✅ Check complete\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

quickCheck();
