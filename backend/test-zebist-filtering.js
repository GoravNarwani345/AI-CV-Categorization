/**
 * Test script to verify Zebist University filtering
 * Run with: node test-zebist-filtering.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('./models/Profile');
const Job = require('./models/Job');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aicv';

async function testZebistFiltering() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Load all models
        const User = require('./models/User');
        const Profile = require('./models/Profile');
        const Job = require('./models/Job');
        
        // Find a user with Zebist in their profile
        const profiles = await Profile.find().populate('user', 'name email role');
        
        console.log('🔍 Searching for profiles with Zebist...\n');
        
        for (const profile of profiles) {
            if (!profile.user || profile.user.role !== 'candidate') continue;
            
            const hasZebist = 
                profile.experience?.some(exp => exp.company?.toLowerCase().includes('zebist')) ||
                profile.education?.some(edu => edu.institution?.toLowerCase().includes('zebist'));
            
            if (hasZebist) {
                console.log('👤 Found candidate with Zebist:');
                console.log('   Name:', profile.user.name);
                console.log('   Email:', profile.user.email);
                console.log('   User ID:', profile.user._id);
                console.log('\n📚 Education:');
                profile.education?.forEach(edu => {
                    console.log(`   - ${edu.degree} at ${edu.institution} (${edu.year})`);
                });
                console.log('\n💼 Experience:');
                profile.experience?.forEach(exp => {
                    console.log(`   - ${exp.title} at ${exp.company} (${exp.duration})`);
                });
                
                // Extract organizations
                const currentCompanies = (profile.experience || [])
                    .map(exp => exp.company ? exp.company.trim().toLowerCase() : '')
                    .filter(c => c.length > 0);
                
                const currentInstitutions = (profile.education || [])
                    .map(edu => edu.institution ? edu.institution.trim().toLowerCase() : '')
                    .filter(i => i.length > 0);
                
                const userOrganizations = [...currentCompanies, ...currentInstitutions];
                
                console.log('\n🏢 Organizations to exclude:', userOrganizations);
                
                // Find Zebist jobs
                const zebistJobs = await Job.find({ 
                    company: { $regex: 'zebist', $options: 'i' },
                    status: 'Active'
                });
                
                console.log(`\n🎯 Found ${zebistJobs.length} Zebist jobs:\n`);
                
                zebistJobs.forEach(job => {
                    console.log(`   Job: "${job.title}" at "${job.company}"`);
                    
                    // Test the filtering logic
                    const jobCompanyLower = job.company.trim().toLowerCase();
                    
                    const isMatch = userOrganizations.some(userOrg => {
                        // Extract keywords
                        const extractKeywords = (name) => {
                            return name
                                .replace(/\b(university|institute|college|campus|school|academy|technology|sciences?|pvt|ltd|limited|inc|corporation|company|org|organization|the|of|and)\b/gi, '')
                                .trim()
                                .split(/\s+/)
                                .filter(word => word.length > 2);
                        };
                        
                        const userKeywords = extractKeywords(userOrg);
                        const jobKeywords = extractKeywords(jobCompanyLower);
                        
                        console.log(`      Comparing with user org: "${userOrg}"`);
                        console.log(`      User keywords: [${userKeywords.join(', ')}]`);
                        console.log(`      Job keywords: [${jobKeywords.join(', ')}]`);
                        
                        // Keyword match
                        if (userKeywords.length > 0 && jobKeywords.length > 0) {
                            const hasMatch = userKeywords.some(uk => 
                                jobKeywords.some(jk => {
                                    if (uk.length >= 3 && jk.length >= 3) {
                                        return jk.includes(uk) || uk.includes(jk);
                                    }
                                    return false;
                                })
                            );
                            if (hasMatch) {
                                console.log(`      ✅ KEYWORD MATCH - Should be excluded`);
                                return true;
                            }
                        }
                        
                        // Direct substring match
                        if (userOrg.length >= 3 && jobCompanyLower.length >= 3) {
                            if (jobCompanyLower.includes(userOrg) || userOrg.includes(jobCompanyLower)) {
                                console.log(`      ✅ SUBSTRING MATCH - Should be excluded`);
                                return true;
                            }
                        }
                        
                        console.log(`      ❌ No match`);
                        return false;
                    });
                    
                    console.log(`   Result: ${isMatch ? '🚫 EXCLUDED' : '✅ INCLUDED (BUG!)'}\n`);
                });
                
                console.log('\n' + '='.repeat(80) + '\n');
            }
        }
        
        console.log('✅ Test complete');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

testZebistFiltering();
