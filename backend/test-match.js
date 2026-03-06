const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

(async () => {
    try {
        // Register a test user
        const rand = Math.floor(Math.random() * 10000);
        const email = `test${rand}@example.com`;

        await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            email: email,
            password: 'password123',
            role: 'candidate'
        });

        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: email,
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Got token');

        // Match without CV
        try {
            await axios.get('http://localhost:5000/api/jobs/match', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            console.log('Match without CV succeeded');
        } catch (e) {
            console.log('Match without CV error:', e.response?.data?.error || e.message);
        }

        // Upload a dummy PDF
        fs.writeFileSync('dummy.pdf', '%PDF-1.4 dummy pdf content');
        const form = new FormData();
        form.append('cv', fs.createReadStream('dummy.pdf'));

        const uploadRes = await axios.post('http://localhost:5000/api/cv/upload', form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Upload success');

        // Match with CV
        try {
            const matchRes = await axios.get('http://localhost:5000/api/jobs/match', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Matches:', JSON.stringify(matchRes.data, null, 2));
        } catch (e) {
            console.error('Match with CV Error:', e.response?.data || e.message);
        }

    } catch (e) {
        console.error('Test Error:', e.response?.data || e.message);
    }
})();
