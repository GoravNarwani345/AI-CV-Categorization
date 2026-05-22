/**
 * Find all users who have a CV uploaded
 */
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Profile = require('./models/Profile');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const profiles = await Profile.find({ cvUrl: { $ne: null, $exists: true } }).populate('user', 'name email role');
        
        console.log(`\nProfiles with CV uploaded: ${profiles.length}\n`);
        profiles.forEach((p, i) => {
            console.log(`${i + 1}. ${p.user?.name} (${p.user?.email})`);
            console.log(`   CV URL: ${p.cvUrl}`);
            console.log(`   Skills: ${p.skills?.length || 0}`);
            console.log(`   Experience: ${p.experience?.length || 0}`);
            console.log(`   Education: ${p.education?.length || 0}`);
        });

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await mongoose.disconnect();
    }
})();
