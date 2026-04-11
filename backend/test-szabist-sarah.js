/**
 * Test SZABIST filtering for Sarah Chen
 * Run with: node test-szabist-sarah.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aicv';

async function testSarahSzabist() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const User = require('./models/User');
        const Profile = require('./models/Profile');
        const Job = require('./models/Job');

        // Find Sarah's profile
        const sarah = await User.findOne({ email: 'sarah@example.com' });
        if (!sarah) {
            console.log('❌ Sarah not found');
            await mongoose.disconnect();
            return;
        }

        const profile = await Profile.findOne({ user: sarah._id });
        if (!profile) {
            console.log('❌ Sarah\'s profile not found');
            await mongoose.disconnect();
            return;
        }

        console.log('👤 Testing for: Sarah Chen\n');

        // Extract organizations
        const currentCompanies = (profile.experience || [])
            .map(exp => exp.company ? exp.company.trim().toLowerCase() : '')
            .filter(c => c.length > 0);
        
        const currentInstitutions = (profile.education || [])
            .map(edu => edu.institution ? edu.institution.trim().toLowerCase() : '')
            .filter(i => i.length > 0);
        
        const userOrganizations = [...currentCompanies, ...currentInstitutions];

        console.log('📚 Education Institutions (normalized):');
        currentInstitutions.forEach(inst => console.log(`   - "${inst}"`));
        
        console.log('\n💼 Work Companies (normalized):');
        currentCompanies.forEach(comp => console.log(`   - "${comp}"`));
        
        console.log('\n🏢 All Organizations to Exclude:');
        userOrganizations.forEach(org => console.log(`   - "${org}"`));

        // Find Szabist jobs
        const szabistJobs = await Job.find({ 
            company: { $regex: 'szabist', $options: 'i' },
            status: 'Active'
        });

        console.log(`\n🎯 Found ${szabistJobs.length} Szabist jobs\n`);

        // Test filtering logic
        const isUserOrganization = (jobCompany) => {
            if (!jobCompany) return false;
            const jobCompanyLower = jobCompany.trim().toLowerCase();
            
            console.log(`\n   Testing job company: "${jobCompany}"`);
            console.log(`   Normalized: "${jobCompanyLower}"`);
            
            return userOrganizations.some(userOrg => {
                console.log(`\n      Comparing with user org: "${userOrg}"`);
                
                // Extract main keywords
                const extractKeywords = (name) => {
                    return name
                        .replace(/\b(university|institute|college|campus|school|academy|technology|sciences?|pvt|ltd|limited|inc|corporation|company|org|organization|the|of|and|zabt|zabtech)\b/gi, '')
                        .trim()
                        .split(/\s+/)
                        .filter(word => word.length > 2);
                };
                
                const userKeywords = extractKeywords(userOrg);
                const jobKeywords = extractKeywords(jobCompanyLower);
                
                console.log(`      User keywords: [${userKeywords.join(', ')}]`);
                console.log(`      Job keywords: [${jobKeywords.join(', ')}]`);
                
                // Check keyword match
                if (userKeywords.length > 0 && jobKeywords.length > 0) {
                    const hasMatch = userKeywords.some(uk => 
                        jobKeywords.some(jk => {
                            if (uk.length >= 3 && jk.length >= 3) {
                                const matches = jk.includes(uk) || uk.includes(jk);
                                if (matches) {
                                    console.log(`      ✅ KEYWORD MATCH: "${uk}" <-> "${jk}"`);
                                }
                                return matches;
                            }
                            return false;
                        })
                    );
                    if (hasMatch) {
                        console.log(`      🚫 RESULT: EXCLUDED (keyword match)`);
                        return true;
                    }
                }
                
                // Check direct substring match
                if (userOrg.length >= 3 && jobCompanyLower.length >= 3) {
                    if (jobCompanyLower.includes(userOrg) || userOrg.includes(jobCompanyLower)) {
                        console.log(`      ✅ SUBSTRING MATCH: "${userOrg}" <-> "${jobCompanyLower}"`);
                        console.log(`      🚫 RESULT: EXCLUDED (substring match)`);
                        return true;
                    }
                }
                
                console.log(`      ❌ No match with this org`);
                return false;
            });
        };

        console.log('\n' + '='.repeat(80));
        console.log('TESTING EACH SZABIST JOB');
        console.log('='.repeat(80));

        szabistJobs.forEach((job, index) => {
            console.log(`\n${index + 1}. Job: "${job.title}" at "${job.company}"`);
            const shouldExclude = isUserOrganization(job.company);
            
            if (shouldExclude) {
                console.log(`\n   ✅ CORRECTLY EXCLUDED - Sarah should NOT see this job`);
            } else {
                console.log(`\n   ❌ BUG FOUND - Sarah WILL see this job (should be excluded!)`);
            }
            console.log('\n' + '-'.repeat(80));
        });

        console.log('\n' + '='.repeat(80));
        console.log('SUMMARY');
        console.log('='.repeat(80));
        
        const correctlyExcluded = szabistJobs.filter(job => isUserOrganization(job.company)).length;
        const incorrectlyIncluded = szabistJobs.length - correctlyExcluded;
        
        console.log(`\nTotal Szabist Jobs: ${szabistJobs.length}`);
        console.log(`Correctly Excluded: ${correctlyExcluded}`);
        console.log(`Incorrectly Included (BUGS): ${incorrectlyIncluded}`);
        
        if (incorrectlyIncluded === 0) {
            console.log('\n✅ ALL TESTS PASSED - Filtering is working correctly!');
        } else {
            console.log('\n❌ BUGS FOUND - Some Szabist jobs are not being filtered!');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

testSarahSzabist();
