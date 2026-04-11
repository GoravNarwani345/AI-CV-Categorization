const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Application = require('../models/Application');

// Get all jobs
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ postedDate: -1 });
        res.json({ success: true, data: jobs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Get recruiter's own jobs
router.get('/me', auth, async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }
        const jobs = await Job.find({ recruiter: req.user.id }).sort({ postedDate: -1 });
        res.json({ success: true, data: jobs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Create a job (Recruiter only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'recruiter') {
        return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    try {
        const newJob = new Job({
            ...req.body,
            recruiter: req.user.id
        });

        const job = await newJob.save();
        res.status(201).json({ success: true, data: job });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Update a job (Recruiter only)
router.put('/:id', auth, async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        // Check if user is the recruiter who posted it
        if (job.recruiter.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        job = await Job.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json({ success: true, data: job });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Delete a job
router.delete('/:id', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        // Check if user is the recruiter who posted it
        if (job.recruiter.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await Job.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Job removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/jobs/match
// @desc    Get semantic match score for a candidate's CV against jobs
// @access  Private
router.get('/match', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile || !profile.cvUrl) {
            return res.status(404).json({ success: false, error: 'No CV uploaded. Please upload a CV first.' });
        }

        // Get IDs of jobs the user has already applied for
        const applications = await Application.find({ candidate: req.user.id });
        const appliedJobIds = applications.map(app => app.job.toString());

        // Get user's current companies/organizations to exclude
        const currentCompanies = (profile.experience || [])
            .map(exp => exp.company ? exp.company.trim().toLowerCase() : '')
            .filter(c => c.length > 0);
        
        // Also check education institutions
        const currentInstitutions = (profile.education || [])
            .map(edu => edu.institution ? edu.institution.trim().toLowerCase() : '')
            .filter(i => i.length > 0);
        
        // Combine both for comprehensive filtering
        const userOrganizations = [...currentCompanies, ...currentInstitutions];
        
        console.log('👤 User Profile Data:');
        console.log('   - Experience:', profile.experience?.map(e => e.company));
        console.log('   - Education:', profile.education?.map(e => e.institution));
        console.log('🏢 User Organizations to Exclude:', userOrganizations);

        // Helper function to check if job company matches user's company/organization
        const isUserOrganization = (jobCompany) => {
            if (!jobCompany) return false;
            const jobCompanyLower = jobCompany.trim().toLowerCase();
            
            return userOrganizations.some(userOrg => {
                console.log(`      Comparing "${jobCompanyLower}" with user org "${userOrg}"`);
                
                // Extract main keywords (remove common words)
                const extractKeywords = (name) => {
                    return name
                        .replace(/\b(university|institute|college|campus|school|academy|technology|sciences?|pvt|ltd|limited|inc|corporation|company|org|organization|the|of|and)\b/gi, '')
                        .trim()
                        .split(/\s+/)
                        .filter(word => word.length > 2);
                };
                
                const userKeywords = extractKeywords(userOrg);
                const jobKeywords = extractKeywords(jobCompanyLower);
                
                console.log(`      User keywords: [${userKeywords.join(', ')}]`);
                console.log(`      Job keywords: [${jobKeywords.join(', ')}]`);
                
                // Check if any significant keyword matches (at least 3 characters)
                if (userKeywords.length > 0 && jobKeywords.length > 0) {
                    const hasMatch = userKeywords.some(uk => 
                        jobKeywords.some(jk => {
                            // Match if keywords are similar (contains or is contained)
                            if (uk.length >= 3 && jk.length >= 3) {
                                const matches = jk.includes(uk) || uk.includes(jk);
                                if (matches) {
                                    console.log(`      ⚠️ Keyword match found: "${uk}" <-> "${jk}"`);
                                }
                                return matches;
                            }
                            return false;
                        })
                    );
                    if (hasMatch) {
                        console.log(`      🚫 MATCH - Excluding job from "${jobCompany}" - matches user org "${userOrg}"`);
                        return true;
                    }
                }
                
                // Also check direct substring match for full names
                if (userOrg.length >= 3 && jobCompanyLower.length >= 3) {
                    if (jobCompanyLower.includes(userOrg) || userOrg.includes(jobCompanyLower)) {
                        console.log(`      🚫 MATCH - Direct substring match: "${jobCompany}" <-> "${userOrg}"`);
                        return true;
                    }
                }
                
                console.log(`      ✓ No match`);
                return false;
            });
        };

        // Simple heuristic to determine user level for basic filtering
        const userExperienceYears = profile.experience?.length || 0;
        const userEducation = (profile.education || []).map(edu => edu.degree.toLowerCase());
        
        const isGraduate = userEducation.some(deg => deg.includes('master') || deg.includes('ms') || deg.includes('phd'));
        const isBachelor = userEducation.some(deg => deg.includes('bachelor') || deg.includes('bs') || deg.includes('be'));
        const isFresher = userExperienceYears === 0;

        // Get all active jobs that user hasn't applied to
        const query = { 
            status: 'Active',
            _id: { $nin: appliedJobIds }
        };

        const jobs = await Job.find(query);

        // Filter out jobs from user's current companies/organizations and apply level filtering
        console.log(`\n📋 Checking ${jobs.length} jobs against user organizations...`);
        const filteredJobs = jobs.filter(job => {
            console.log(`   Checking job: "${job.title}" at "${job.company}"`);
            
            // Exclude jobs from organizations where user is working/studying
            if (isUserOrganization(job.company)) {
                console.log(`   ❌ EXCLUDED - matches user organization`);
                return false;
            }
            
            // Filter by job level - Fresher jobs only for freshers
            if (job.level === 'Fresher' && !isFresher) {
                console.log(`   ❌ EXCLUDED - Fresher job but user is not fresher`);
                return false;
            }
            
            console.log(`   ✅ INCLUDED`);
            return true;
        });
        
        console.log(`\n✅ Filtered Jobs: ${filteredJobs.length} out of ${jobs.length} (excluded ${jobs.length - filteredJobs.length} jobs)`);



        if (filteredJobs.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const { getJobMatches } = require('../utils/ai');

        // Prefer structured profile data (updated by editor) over raw disk text
        const hasStructuredData = profile.skills?.length > 0 || profile.experience?.length > 0;
        let matches;

        if (hasStructuredData) {
            matches = await getJobMatches(profile, filteredJobs);
        } else {
            // Read and parse the CV file directly as fallback
            const fs = require('fs');
            const path = require('path');
            const pdf = require('pdf-parse');

            const filePath = path.join(__dirname, '..', profile.cvUrl);
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ success: false, error: 'CV file not found on server' });
            }

            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdf(dataBuffer);
            matches = await getJobMatches(pdfData.text, filteredJobs);
        }

        res.json({ success: true, data: matches });
    } catch (err) {
        console.error('AI Matching Error:', err);
        res.status(500).json({ success: false, error: 'Failed to calculate smart matches' });
    }
});

// @route   GET /api/jobs/popular-skills
// @desc    Get most common skills required in jobs
// @access  Private (Recruiter only)
router.get('/popular-skills', auth, async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const skills = await Job.aggregate([
            { $unwind: "$skills" },
            { $group: { _id: "$skills", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 }
        ]);

        const formattedSkills = skills.map(s => ({
            skill: s._id,
            count: s.count
        }));

        res.json({ success: true, data: formattedSkills });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/jobs/:id/best-candidates
// @desc    Get AI-ranked candidates for a specific job
// @access  Private (Recruiter only)
router.get('/:id/best-candidates', auth, async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        // Check if user is the recruiter who posted it
        if (job.recruiter.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        // Fetch all candidate profiles
        const profiles = await Profile.find().populate('user', 'name email');
        const candidates = profiles.filter(p => p.user && p.user.role === 'candidate');

        if (candidates.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const { getRankedCandidates } = require('../utils/ai');
        const rankedCandidates = await getRankedCandidates(job, candidates);

        res.json({ success: true, data: rankedCandidates });
    } catch (err) {
        console.error('AI Best Candidates Error:', err);
        res.status(500).json({ success: false, error: 'Failed to find best candidates' });
    }
});

module.exports = router;
