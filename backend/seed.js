const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const Notification = require('./models/Notification');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aicv');
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Profile.deleteMany({}),
            Job.deleteMany({}),
            Application.deleteMany({}),
            Conversation.deleteMany({}),
            Message.deleteMany({}),
            Notification.deleteMany({})
        ]);
        console.log('🧹 Cleared existing data');

        // 1. Create Recruiter
        const recruiter = await User.create({
            name: 'Alex Recruiter',
            email: 'recruiter@example.com',
            password: 'password123',
            role: 'recruiter',
            isVerified: true,
            onboardingCompleted: true
        });

        await Profile.create({
            user: recruiter._id,
            recruiterInfo: {
                companyName: 'Innovation Hub',
                industry: 'Tech',
                companySize: '201-500 employees',
                website: 'https://innovation.example.com',
                contactEmail: 'hiring@innovation.example.com',
                companyDescription: 'Building the future of AI-driven tools.'
            }
        });

        // 2. Create Diverse Candidates
        const candidates = await User.create([
            { name: 'Sarah Chen', email: 'sarah@example.com', password: 'password123', role: 'candidate', isVerified: true, onboardingCompleted: true },
            { name: 'Marcus Miller', email: 'marcus@example.com', password: 'password123', role: 'candidate', isVerified: true, onboardingCompleted: true },
            { name: 'Elena Rodriguez', email: 'elena@example.com', password: 'password123', role: 'candidate', isVerified: true, onboardingCompleted: true },
            { name: 'Kuldip Singh', email: 'kuldip@example.com', password: 'password123', role: 'candidate', isVerified: true, onboardingCompleted: true }
        ]);

        // Profiles for candidates
        const profiles = [
            {
                user: candidates[0]._id,
                basicInfo: { location: 'Seattle, WA', bio: 'Expert React Native & Frontend Architect.' },
                skills: [{ name: 'React', level: 'Expert' }, { name: 'TypeScript', level: 'Expert' }, { name: 'Node.js', level: 'Advanced' }],
                experience: [{ title: 'Principal Engineer', company: 'CloudScale', duration: '3 years', description: 'Architected micro-frontends.' }],
                cvUploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
            },
            {
                user: candidates[1]._id,
                basicInfo: { location: 'Austin, TX', bio: 'Backend Heavy Full Stack Engineer.' },
                skills: [{ name: 'Node.js', level: 'Expert' }, { name: 'Python', level: 'Advanced' }, { name: 'MongoDB', level: 'Expert' }],
                experience: [{ title: 'Backend Lead', company: 'DataFlow', duration: '5 years', description: 'Managed distributed systems.' }],
                cvUploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
            },
            {
                user: candidates[2]._id,
                basicInfo: { location: 'Madrid, Spain', bio: 'UX/UI focused Frontend Developer.' },
                skills: [{ name: 'React', level: 'Advanced' }, { name: 'Figma', level: 'Expert' }, { name: 'Tailwind', level: 'Expert' }],
                experience: [{ title: 'UI Designer', company: 'CreativePulse', duration: '2 years', description: 'Designing high-fidelity prototypes.' }],
                cvUploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
            },
            {
                user: candidates[3]._id,
                basicInfo: { location: 'New Delhi, India', bio: 'AI Enthusiast & Python Developer.' },
                skills: [{ name: 'Python', level: 'Expert' }, { name: 'Machine Learning', level: 'Advanced' }, { name: 'Node.js', level: 'Intermediate' }],
                experience: [{ title: 'Python Dev', company: 'AILabs', duration: '1 year', description: 'Working on LLM fine-tuning.' }],
                cvUploadedAt: new Date()
            }
        ];
        await Profile.insertMany(profiles);

        // 3. Create Sample Jobs (Diverse to show matching)
        const jobData = [
            {
                recruiter: recruiter._id,
                title: 'Senior Frontend Engineer',
                company: 'Innovation Hub',
                location: 'Remote',
                type: 'Full-time',
                salary: '$140k - $170k',
                description: 'We need a React expert to lead our dashboard team.',
                requirements: ['React expertise', 'TypeScript knowledge', 'Eye for design'],
                skills: ['React', 'TypeScript', 'Tailwind'],
                postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
            },
            {
                recruiter: recruiter._id,
                title: 'Full Stack Developer',
                company: 'Innovation Hub',
                location: 'Hybrid',
                type: 'Full-time',
                salary: '$120k - $150k',
                description: 'Help us bridge the gap between our Node.js backend and React frontend.',
                requirements: ['Node.js', 'React', 'NoSQL databases'],
                skills: ['React', 'Node.js', 'MongoDB'],
                postedDate: new Date()
            },
            {
                recruiter: recruiter._id,
                title: 'Python / AI Developer',
                company: 'AILabs (Partner)',
                location: 'San Francisco, CA',
                type: 'Contract',
                salary: '$90 - $120 / hr',
                description: 'Building LLM-powered applications.',
                requirements: ['Python mastery', 'Experience with OpenAI API', 'Fast learner'],
                skills: ['Python', 'Machine Learning'],
                postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
        ];
        const savedJobs = await Job.insertMany(jobData);

        // 4. Create Applications (the data for both dashboards)
        const apps = [
            // Sarah Chen (Frontend Expert) - Applied to Job 1 (Match)
            { candidate: candidates[0]._id, job: savedJobs[0]._id, status: 'Shortlisted', appliedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },

            // Marcus Miller (Backend Expert) - Applied to Job 2 (Match)
            { candidate: candidates[1]._id, job: savedJobs[1]._id, status: 'Interview', appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },

            // Kuldip Singh (AI Dev) - Applied to Job 3 (Match)
            { candidate: candidates[3]._id, job: savedJobs[2]._id, status: 'Applied', appliedDate: new Date() },

            // Elena Rodriguez (UI/UX) - Applied to Job 1 (Partial Match)
            { candidate: candidates[2]._id, job: savedJobs[0]._id, status: 'Applied', appliedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
        ];
        await Application.insertMany(apps);

        // 5. Create Conversations & Messages (for demoing chat)
        const conv = await Conversation.create({ participants: [recruiter._id, candidates[0]._id] });
        const lastMsg = await Message.create({
            conversation: conv._id,
            sender: recruiter._id,
            content: 'Hi Sarah, I loved your portfolio! Can we chat about the Senior Frontend role?'
        });
        conv.lastMessage = lastMsg._id;
        await conv.save();

        // 6. Create Notifications for BOTH roles
        await Notification.insertMany([
            // Recruiter Notifications
            { recipient: recruiter._id, sender: candidates[0]._id, type: 'application', content: 'Sarah Chen applied for Senior Frontend Engineer', link: '/recruiter/jobs' },
            { recipient: recruiter._id, sender: candidates[3]._id, type: 'application', content: 'Kuldip Singh applied for Python / AI Developer', link: '/recruiter/jobs' },

            // Candidate Notifications
            { recipient: candidates[0]._id, sender: recruiter._id, type: 'status_update', content: 'Your application for Senior Frontend Engineer was updated to Shortlisted', link: '/candidate/applications' },
            { recipient: candidates[1]._id, sender: recruiter._id, type: 'status_update', content: 'Good news! Innovation Hub invited you for an Interview.', link: '/candidate/applications' },
            { recipient: candidates[0]._id, sender: recruiter._id, type: 'message', content: 'Alex Recruiter sent you a message.', link: '/candidate/messages' }
        ]);

        console.log('✨ Database seeded with complete testing data for both roles!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
