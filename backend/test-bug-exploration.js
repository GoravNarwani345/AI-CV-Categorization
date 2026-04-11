/**
 * Bug Condition Exploration Test
 * 
 * **Property 1: Bug Condition** - Current Employer Jobs Incorrectly Included
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * 
 * Test that candidates with current employment in their profile.experience array 
 * do NOT receive job recommendations from those employers.
 * 
 * Test case: Lecturer at "SZABIST University Hyderabad" should NOT see jobs 
 * from "SZABIST University"
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Profile = require('./models/Profile');
const Job = require('./models/Job');
const Application = require('./models/Application');

async function runBugExplorationTest() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Clean up test data
        await User.deleteMany({ email: /^bug-test-/ });
        await Job.deleteMany({ title: 'Bug Test Job' });

        // Create test candidate user
        const candidateUser = new User({
            name: 'Bug Test Candidate',
            email: 'bug-test-candidate@example.com',
            password: 'hashedpassword123',
            role: 'candidate',
            isVerified: true
        });
        await candidateUser.save();

        // Create test recruiter user
        const recruiterUser = new User({
            name: 'Bug Test Recruiter',
            email: 'bug-test-recruiter@example.com',
            password: 'hashedpassword123',
            role: 'recruiter',
            isVerified: true
        });
        await recruiterUser.save();

        // Create candidate profile with "SZABIST University Hyderabad" as current employer
        const candidateProfile = new Profile({
            user: candidateUser._id,
            experience: [
                {
                    title: 'Lecturer',
                    company: 'SZABIST University Hyderabad',
                    duration: '2020-Present',
                    description: 'Teaching computer science courses'
                }
            ],
            skills: [
                { name: 'JavaScript', level: 'Advanced' },
                { name: 'Node.js', level: 'Intermediate' }
            ],
            cvUrl: '/uploads/dummy-cv.pdf',
            cvFileName: 'dummy-cv.pdf'
        });
        await candidateProfile.save();

        // Create job posting from "SZABIST University" (should be excluded)
        const szabistJob = new Job({
            recruiter: recruiterUser._id,
            title: 'Bug Test Job',
            company: 'SZABIST University',
            location: 'Hyderabad',
            type: 'Full-time',
            level: 'Intermediate',
            salary: '50000-70000',
            description: 'Teaching position at SZABIST',
            requirements: ['PhD or Masters', 'Teaching experience'],
            skills: ['JavaScript', 'Node.js'],
            status: 'Active'
        });
        await szabistJob.save();

        // Simulate the job matching logic from backend/routes/jobs.js
        const profile = candidateProfile;
        const applications = await Application.find({ candidate: candidateUser._id });
        const appliedJobIds = applications.map(app => app.job.toString());

        // Get user's current companies to exclude
        const currentCompanies = (profile.experience || []).map(exp => exp.company.trim().toLowerCase());

        console.log('Current companies:', currentCompanies);

        // This is the BUGGY query from the original code
        const query = { 
            status: 'Active',
            _id: { $nin: appliedJobIds },
            company: { $nin: currentCompanies.map(c => new RegExp(`^${c}`, 'i')) }
        };

        const jobs = await Job.find(query);

        console.log(`\nFound ${jobs.length} jobs for candidate`);
        
        if (jobs.length > 0) {
            console.log('Jobs returned:');
            jobs.forEach(job => {
                console.log(`  - ${job.title} at ${job.company}`);
            });
        }

        // Check if the SZABIST University job appears in results
        const szabistJobInResults = jobs.some(job => job._id.toString() === szabistJob._id.toString());

        console.log('\n=== TEST RESULT ===');
        console.log(`SZABIST University job in results: ${szabistJobInResults}`);
        
        if (szabistJobInResults) {
            console.log('❌ TEST FAILED (EXPECTED ON UNFIXED CODE)');
            console.log('Bug confirmed: Job from "SZABIST University" appears in recommendations');
            console.log('for candidate currently employed at "SZABIST University Hyderabad"');
            console.log('\nCounterexample found:');
            console.log(`  Candidate company: "SZABIST University Hyderabad"`);
            console.log(`  Job company: "SZABIST University"`);
            console.log(`  Expected: Job should NOT appear`);
            console.log(`  Actual: Job DOES appear`);
            console.log('\nThis confirms the bug exists - the regex filter is not working correctly.');
        } else {
            console.log('✓ TEST PASSED (UNEXPECTED ON UNFIXED CODE)');
            console.log('Bug NOT reproduced: Job from "SZABIST University" does NOT appear');
            console.log('This suggests the bug may already be fixed or the root cause is different.');
        }

        // Clean up
        await User.deleteMany({ email: /^bug-test-/ });
        await Job.deleteMany({ title: 'Bug Test Job' });
        await Profile.deleteMany({ user: candidateUser._id });

    } catch (error) {
        console.error('Test execution error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

runBugExplorationTest();
