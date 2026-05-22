/**
 * Quick test: Login as a candidate and call the /api/jobs/match endpoint
 * to verify how many job recommendations are returned.
 */
const axios = require('axios');

const BASE = 'http://localhost:5000/api';

(async () => {
    try {
        // Try to find a candidate who has a CV - first try sarah
        const candidates = [
            { email: 'sarah@example.com', password: 'password123' },
            { email: 'marcus@example.com', password: 'password123' },
            { email: 'elena@example.com', password: 'password123' },
            { email: 'john@example.com', password: 'password123' }
        ];

        for (const cand of candidates) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`Trying ${cand.email}...`);

            try {
                const loginRes = await axios.post(`${BASE}/auth/login`, cand);
                const token = loginRes.data.token;
                console.log(`✅ Logged in as ${cand.email}`);

                // Check profile
                try {
                    const profileRes = await axios.get(`${BASE}/profiles/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const profile = profileRes.data.data;
                    console.log(`   CV URL: ${profile?.cvUrl || 'NOT UPLOADED'}`);
                    console.log(`   Skills: ${profile?.skills?.length || 0}`);
                    console.log(`   Experience: ${profile?.experience?.length || 0}`);
                } catch (e) {
                    console.log(`   Profile check error: ${e.response?.data?.error || e.message}`);
                }

                // Call match endpoint
                try {
                    const matchRes = await axios.get(`${BASE}/jobs/match`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const matches = matchRes.data;
                    console.log(`\n   📊 Match API Response:`);
                    console.log(`   Success: ${matches.success}`);
                    console.log(`   Total recommendations: ${matches.data?.length || 0}`);
                    
                    if (matches.data && matches.data.length > 0) {
                        console.log(`\n   📋 Recommended Jobs:`);
                        matches.data.forEach((m, i) => {
                            console.log(`   ${i + 1}. JobID: ${m.jobId} | Score: ${m.matchScore}% | Reason: ${(m.matchReason || m.reason || 'N/A').substring(0, 80)}...`);
                        });

                        // Also check if all jobs can be fetched
                        const allJobsRes = await axios.get(`${BASE}/jobs`);
                        const allJobs = allJobsRes.data.data;
                        console.log(`\n   🔗 Cross-check with fetchJobs (${allJobs.length} total jobs):`);
                        
                        let foundCount = 0;
                        let missingCount = 0;
                        matches.data.forEach(m => {
                            const found = allJobs.find(j => j._id === m.jobId);
                            if (found) {
                                foundCount++;
                            } else {
                                missingCount++;
                                console.log(`   ❌ Match jobId "${m.jobId}" NOT FOUND in allJobs`);
                            }
                        });
                        console.log(`   ✅ Found: ${foundCount} | ❌ Missing: ${missingCount}`);
                    }
                } catch (e) {
                    console.log(`   Match error: ${e.response?.data?.error || e.message}`);
                }

            } catch (e) {
                console.log(`   Login failed: ${e.response?.data?.error || e.message}`);
            }
        }

        console.log('\n✅ Test complete');
    } catch (e) {
        console.error('Fatal Error:', e.message);
    }
})();
