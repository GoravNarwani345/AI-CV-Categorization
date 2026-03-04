const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load env from backend
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const API_URL = 'http://localhost:5000/api';
let token = '';

async function runTests() {
    console.log('🚀 Starting Job CRUD Backend Tests...');

    try {
        // 1. Login as Recruiter (Assuming a recruiter exists or we use a known one)
        // For testing, we might need to create one or use an existing one from seed
        console.log('Step 1: Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'recruiter@example.com', // Replace with real test user if needed
            password: 'password123'
        });
        token = loginRes.data.token;
        console.log('✅ Logged in successfully');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Create a Job
        console.log('Step 2: Creating a job...');
        const newJob = {
            title: 'Backend Developer (Test)',
            company: 'Test Corp',
            location: 'Remote',
            type: 'Full-time',
            salary: '60k - 80k',
            description: 'This is a test job description.',
            requirements: ['Node.js', 'Express', 'MongoDB'],
            experience: 'Senior Level',
            department: 'Engineering'
        };
        const createRes = await axios.post(`${API_URL}/jobs`, newJob, config);
        const jobId = createRes.data.data._id;
        console.log(`✅ Job created with ID: ${jobId}`);

        // 3. Get Own Jobs
        console.log('Step 3: Fetching recruiter jobs...');
        const getMeRes = await axios.get(`${API_URL}/jobs/me`, config);
        const found = getMeRes.data.data.find(j => j._id === jobId);
        if (found) {
            console.log('✅ Created job found in recruiter list');
        } else {
            console.error('❌ Created job NOT found in recruiter list');
        }

        // 4. Update the Job
        console.log('Step 4: Updating the job...');
        const updateRes = await axios.put(`${API_URL}/jobs/${jobId}`, {
            title: 'Senior Backend Developer (Test Updated)'
        }, config);
        if (updateRes.data.data.title.includes('Updated')) {
            console.log('✅ Job updated successfully');
        } else {
            console.error('❌ Job update failed to reflect changes');
        }

        // 5. Delete the Job
        console.log('Step 5: Deleting the job...');
        const deleteRes = await axios.delete(`${API_URL}/jobs/${jobId}`, config);
        if (deleteRes.data.success) {
            console.log('✅ Job deleted successfully');
        } else {
            console.error('❌ Job deletion failed');
        }

        // 6. Verify Deletion
        console.log('Step 6: Verifying deletion...');
        const finalGetRes = await axios.get(`${API_URL}/jobs/me`, config);
        const stillExists = finalGetRes.data.data.find(j => j._id === jobId);
        if (!stillExists) {
            console.log('✅ Deletion verified');
        } else {
            console.error('❌ Job still exists after deletion');
        }

        console.log('\n✨ All Backend Job CRUD tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

// runTests();
console.log('Manual test script created. Please ensure backend is running before use.');
