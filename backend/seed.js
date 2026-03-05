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

        // 1. Create Recruiters (Multi-Role Testing)
        const alexRecruiter = await User.create({
            name: 'Alex Johnson',
            email: 'recruiter@example.com',
            password: 'password123',
            role: 'recruiter',
            isVerified: true,
            onboardingCompleted: true
        });

        const sarahHR = await User.create({
            name: 'Sarah HR',
            email: 'sarah.hr@example.com',
            password: 'password123',
            role: 'recruiter',
            isVerified: true,
            onboardingCompleted: true
        });

        await Profile.create([
            {
                user: alexRecruiter._id,
                recruiterInfo: {
                    companyName: 'Innovation Hub',
                    industry: 'Tech',
                    companySize: '201-500 employees',
                    website: 'https://innovation.example.com',
                    companyDescription: 'Building the future of AI-driven tools.'
                }
            },
            {
                user: sarahHR._id,
                recruiterInfo: {
                    companyName: 'Global Solutions',
                    industry: 'Consulting',
                    companySize: '1000+ employees',
                    website: 'https://globalsolutions.com',
                    companyDescription: 'Large scale enterprise consulting and staffing.'
                }
            }
        ]);

        // 2. Create Diverse Candidates
        const candidates = await User.create([
            { name: 'Sarah Chen', email: 'sarah@example.com', password: 'password123', role: 'candidate', isVerified: true, onboardingCompleted: true },
            { name: 'Marcus Miller', email: 'marcus@example.com', password: 'password123', role: 'candidate', isVerified: true, onboardingCompleted: true },
            { name: 'Elena Rodriguez', email: 'elena@example.com', password: 'password123', role: 'candidate', isVerified: true, onboardingCompleted: true },
            { name: 'Kuldip Singh', email: 'kuldip@example.com', password: 'password123', role: 'candidate', isVerified: true, onboardingCompleted: true },
            { name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'candidate', isVerified: true, onboardingCompleted: true }
        ]);

        // Profiles for candidates
        const profiles = [
            {
                user: candidates[0]._id,
                basicInfo: { location: 'Seattle, WA', bio: 'Expert React Native & Frontend Architect with a passion for clean UI.', age: 28 },
                skills: [{ name: 'React', level: 'Expert' }, { name: 'TypeScript', level: 'Expert' }, { name: 'Node.js', level: 'Advanced' }, { name: 'GraphQL', level: 'Advanced' }],
                education: [{ degree: 'B.S. Computer Science', institution: 'MIT', year: '2018', grade: '3.9 GPA' }],
                experience: [{
                    title: 'Principal Engineers',
                    company: 'CloudScale',
                    duration: '3 years',
                    description: 'Architected micro-frontends and led a team of 10 developers for a high-traffic SaaS platform.'
                }],
                cvUploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            },
            {
                user: candidates[1]._id,
                basicInfo: { location: 'Austin, TX', bio: 'Backend Heavy Full Stack Engineer specialized in high-throughput systems.', age: 32 },
                skills: [{ name: 'Node.js', level: 'Expert' }, { name: 'Python', level: 'Advanced' }, { name: 'MongoDB', level: 'Expert' }, { name: 'Redis', level: 'Advanced' }],
                education: [{ degree: 'M.S. Software Engineering', institution: 'UT Austin', year: '2015', grade: 'First Class' }],
                experience: [{
                    title: 'Backend Lead',
                    company: 'DataFlow',
                    duration: '5 years',
                    description: 'Managed distributed systems, optimized database queries reducing latency by 40%.'
                }],
                cvUploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
            },
            {
                user: candidates[2]._id,
                basicInfo: { location: 'Madrid, Spain', bio: 'UX/UI focused Frontend Developer with experience in design systems.', age: 25 },
                skills: [{ name: 'React', level: 'Advanced' }, { name: 'Figma', level: 'Expert' }, { name: 'Tailwind', level: 'Expert' }],
                education: [{ degree: 'B.A. Graphic Design', institution: 'Complutense University', year: '2020', grade: 'Honors' }],
                experience: [{
                    title: 'UI Designer',
                    company: 'CreativePulse',
                    duration: '2 years',
                    description: 'Designing high-fidelity prototypes and collaborating with developers on Figma-to-Code workflows.'
                }],
                cvUploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            },
            {
                user: candidates[3]._id,
                basicInfo: { location: 'New Delhi, India', bio: 'AI Enthusiast & Python Developer focusing on LLMs and RAG.', age: 24 },
                skills: [{ name: 'Python', level: 'Expert' }, { name: 'Machine Learning', level: 'Advanced' }, { name: 'Node.js', level: 'Intermediate' }],
                education: [{ degree: 'B.Tech Information Technology', institution: 'IIT Delhi', year: '2021', grade: '9.2 CGPA' }],
                experience: [{
                    title: 'Junior Machine Learning Engineer',
                    company: 'AILabs',
                    duration: '1 year',
                    description: 'Working on LLM fine-tuning, prompt engineering, and implementing RAG pipelines.'
                }],
                cvUploadedAt: new Date()
            },
            {
                user: candidates[4]._id,
                basicInfo: { location: 'New York, NY', bio: 'Early career developer eager to learn.', age: 22 },
                skills: [{ name: 'HTML', level: 'Advanced' }, { name: 'CSS', level: 'Advanced' }, { name: 'JavaScript', level: 'Intermediate' }],
                education: [{ degree: 'B.S. Information Systems', institution: 'NYU', year: '2023', grade: '3.5 GPA' }],
                experience: [{
                    title: 'Intern',
                    company: 'StartUp XYZ',
                    duration: '6 months',
                    description: 'Assisted in building landing pages and simple CRUD functionalities.'
                }],
                cvUploadedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
            }
        ];
        await Profile.insertMany(profiles);

        // 3. Create Diverse Jobs
        const alexJobs = [
            {
                recruiter: alexRecruiter._id,
                title: 'Senior Frontend Engineer',
                company: 'Innovation Hub',
                location: 'Remote',
                salary: '$140k - $170k',
                description: 'We need a React expert to lead our dashboard team. Experience with design systems is a plus.',
                requirements: ['React expertise', 'TypeScript knowledge', 'B.S. in Computer Science', '3+ years experience'],
                skills: ['React', 'TypeScript', 'Tailwind', 'GraphQL'],
                postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
            },
            {
                recruiter: alexRecruiter._id,
                title: 'Full Stack Ninja',
                company: 'Innovation Hub',
                location: 'Hybrid (NYC)',
                salary: '$120k - $150k',
                description: 'Build end-to-end features using Node.js and React.',
                requirements: ['Proficient in Node.js', 'React experience', 'Database management'],
                skills: ['React', 'Node.js', 'MongoDB', 'Redis'],
                postedDate: new Date()
            }
        ];

        const sarahJobs = [
            {
                recruiter: sarahHR._id,
                title: 'Technical Project Manager',
                company: 'Global Solutions',
                location: 'London / Remote',
                salary: '£70k - £90k',
                description: 'Liaise between clients and our engineering teams.',
                requirements: ['PM experience', 'Technical background', 'Agile/Scrum'],
                skills: ['Project Management', 'Agile', 'Jira'],
                postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
                recruiter: sarahHR._id,
                title: 'Python Backend Developer',
                company: 'Global Solutions',
                location: 'Remote',
                salary: '$110k - $140k',
                description: 'Build scalable backend services using Python and FastAPI.',
                requirements: ['Python expert', 'SQL knowledge', 'Cloud experience'],
                skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
                postedDate: new Date()
            },
            {
                recruiter: sarahHR._id,
                title: 'AI Research Engineer',
                company: 'Global Solutions',
                location: 'San Francisco, CA',
                salary: '$180k - $220k',
                description: 'Develop and deploy state-of-the-art LLM applications.',
                requirements: ['Strong ML background', 'PyTorch/TensorFlow', 'LLM experience'],
                skills: ['Python', 'PyTorch', 'Machine Learning', 'NLP'],
                postedDate: new Date()
            },
            {
                recruiter: sarahHR._id,
                title: 'Senior Web Application Developer',
                company: 'Global Solutions',
                location: 'Remote',
                salary: '$130k - $160k',
                description: 'Lead the development of our core SaaS web application.',
                requirements: ['React expertise', 'Node.js backend', 'Cloud architecture'],
                skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
                postedDate: new Date()
            },
            {
                recruiter: sarahHR._id,
                title: 'MLOps Engineer',
                company: 'Global Solutions',
                location: 'Hybrid',
                salary: '$140k - $180k',
                description: 'Manage production AI pipelines and deployment infrastructures.',
                requirements: ['Kubernetes', 'CI/CD for ML', 'Python networking'],
                skills: ['Docker', 'Kubernetes', 'MLFlow', 'Python'],
                postedDate: new Date()
            }
        ];

        const additionalJobs = [
            {
                recruiter: alexRecruiter._id,
                title: 'React & Next.js Specialist',
                company: 'Innovation Hub',
                location: 'Remote',
                salary: '$120k - $150k',
                description: 'Focus on high-performance web applications using modern React frameworks.',
                requirements: ['Next.js expert', 'Performance optimization', 'SEO knowledge'],
                skills: ['Next.js', 'React', 'Tailwind', 'Vercel'],
                postedDate: new Date()
            },
            {
                recruiter: alexRecruiter._id,
                title: 'Generative AI Developer',
                company: 'Innovation Hub',
                location: 'NYC / Remote',
                salary: '$150k - $200k',
                description: 'Integrate LLMs into consumer-facing web products.',
                requirements: ['LangChain/LlamaIndex', 'API integration', 'Prompt engineering'],
                skills: ['Python', 'OpenAI API', 'Vector Databases', 'React'],
                postedDate: new Date()
            }
        ];

        const savedAlexJobs = await Job.insertMany(alexJobs);
        const savedSarahJobs = await Job.insertMany(sarahJobs);
        const savedAdditionalJobs = await Job.insertMany(additionalJobs);
        const allJobs = [...savedAlexJobs, ...savedSarahJobs, ...savedAdditionalJobs];

        // 4. Create Applications (Testing various statuses)
        const apps = [
            { candidate: candidates[0]._id, job: savedAlexJobs[0]._id, status: 'Shortlisted', appliedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
            { candidate: candidates[2]._id, job: savedAlexJobs[0]._id, status: 'Interview', appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
            { candidate: candidates[1]._id, job: savedAlexJobs[1]._id, status: 'Applied', appliedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
            { candidate: candidates[3]._id, job: savedAlexJobs[1]._id, status: 'Rejected', appliedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
            { candidate: candidates[4]._id, job: savedAlexJobs[0]._id, status: 'Applied', appliedDate: new Date() },
            { candidate: candidates[0]._id, job: savedSarahJobs[0]._id, status: 'Applied', appliedDate: new Date() }
        ];
        await Application.insertMany(apps);

        // 5. Create Conversations & Messages
        const conv = await Conversation.create({ participants: [alexRecruiter._id, candidates[0]._id] });
        const lastMsg = await Message.create({
            conversation: conv._id,
            sender: alexRecruiter._id,
            content: 'Hi Sarah, I saw your profile and it is impressive. Are you available for a quick call tomorrow?'
        });
        conv.lastMessage = lastMsg._id;
        await conv.save();

        // 6. Create Notifications
        await Notification.insertMany([
            { recipient: alexRecruiter._id, sender: candidates[4]._id, type: 'application', content: 'John Doe applied for Senior Frontend Engineer', link: '/recruiter/jobs' },
            { recipient: candidates[0]._id, sender: alexRecruiter._id, type: 'status_update', content: 'Your application for Senior Frontend Engineer was updated to Shortlisted', link: '/candidate/applications' },
            { recipient: candidates[2]._id, sender: alexRecruiter._id, type: 'status_update', content: 'Interview scheduled for UI Designer role.', link: '/candidate/applications' },
            { recipient: candidates[0]._id, sender: alexRecruiter._id, type: 'message', content: 'Alex Johnson sent you a new message.', link: '/candidate/messages' }
        ]);

        console.log('✨ Database fully seeded with multi-recruiter, multi-status, and deep candidate data!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
