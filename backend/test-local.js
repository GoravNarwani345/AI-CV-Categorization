const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Profile = require('./models/Profile');
const Job = require('./models/Job');
const { getJobMatches } = require('./utils/ai');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Find a profile that has a CV uploaded
        const profile = await Profile.findOne({ cvUrl: { $ne: null, $exists: true } });
        if (!profile) {
            console.log('No profile with a CV found in the database. Exiting.');
            process.exit(0);
        }

        console.log('Found profile for user:', profile.user);

        const jobs = await Job.find({ status: 'Active' });
        console.log(`Found ${jobs.length} active jobs.`);

        const filePath = path.join(__dirname, profile.cvUrl); // __dirname is backend folder
        console.log('Reading CV from:', filePath);

        if (!fs.existsSync(filePath)) {
            console.error('CV file does not actually exist on disk:', filePath);
            process.exit(1);
        }

        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdf(dataBuffer);
        const cvText = pdfData.text;

        console.log(`Extracted ${cvText.length} characters from CV.`);
        console.log('Running AI Match...');

        const matches = await getJobMatches(cvText, jobs);
        console.log('Match Result:', JSON.stringify(matches, null, 2));

    } catch (error) {
        console.error('Execution Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
})();
