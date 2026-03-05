const mongoose = require('mongoose');
const User = require('../backend/models/User');
const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';
const MONGODB_URI = 'mongodb://localhost:27017/aicv';

const testEmail = `test_auth_${Date.now()}@example.com`;
const testPassword = 'password123';

async function runTests() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    try {
        // 1. Register User
        console.log(`\n--- Testing Registration ---`);
        const regRes = await axios.post(`${API_URL}/register`, {
            name: 'Test Setup User',
            email: testEmail,
            password: testPassword,
            role: 'candidate'
        });
        console.log('Registration Response:', regRes.data.success ? 'Success' : 'Failed');

        // 2. Fetch User from DB to get verification token
        console.log(`\n--- Testing Email Verification ---`);
        const user = await User.findOne({ email: testEmail });
        if (!user) throw new Error('User not found in DB after registration');
        console.log('User created in DB. Verified status:', user.isVerified);

        // The token stored in DB is hashed. We can't use the original token since it was emailed.
        // Let's just manually set them as verified in DB to proceed with login test, OR
        // we can generate a new token overriding it.
        console.log('Manually verifying user for testing purposes...');
        user.isVerified = true;
        await user.save();
        console.log('User verified.');

        // 3. Login
        console.log(`\n--- Testing Login ---`);
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: testEmail,
            password: testPassword
        });
        console.log('Login Response:', loginRes.data.success ? 'Success' : 'Failed');
        if (loginRes.data.token) console.log('JWT Token received.');

        // 4. Forgot Password
        console.log(`\n--- Testing Forgot Password ---`);
        const forgotRes = await axios.post(`${API_URL}/forgot-password`, {
            email: testEmail
        });
        console.log('Forgot Password Response:', forgotRes.data.message);

        // 5. Clean up
        console.log(`\n--- Cleaning Up ---`);
        await User.deleteOne({ email: testEmail });
        console.log('Test user deleted.');

    } catch (error) {
        if (error.response) {
            console.error('API Error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

runTests();
