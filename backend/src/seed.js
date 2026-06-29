require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const CompanyProfile = require('./models/CompanyProfile');
const Job = require('./models/Job');
const Drive = require('./models/Drive');
const Application = require('./models/Application');
const Interview = require('./models/Interview');
const Announcement = require('./models/Announcement');
const Notification = require('./models/Notification');

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI not set in .env file');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // ── Check if already fully seeded ────────────────────────────
    const existingStudents = await User.countDocuments({ role: 'student' });
    if (existingStudents >= 10) {
      console.log('Seed data already exists. Skipping creation.\n');
      console.log('─── Login Credentials ───');
      await printCredentials();
      process.exit(0);
    }

    // Remove old minimal seed data if it exists before re-seeding
    console.log('Found old seed data (admin only). Cleaning and re-seeding...');
    const models = [User, StudentProfile, CompanyProfile, Job, Drive, Application, Interview, Announcement, Notification];
    for (const model of models) {
      await model.deleteMany({});
    }
    console.log('Cleared old data. Seeding fresh...');

    const hash = (pw) => bcrypt.hash(pw, 10);

    // ────────────────────────────────────────────────────────────
    //  1. USERS (students, companies, faculty)
    // ────────────────────────────────────────────────────────────

    const studentsData = [
      { name: 'Aarav Sharma',     email: 'aarav.sharma@college.edu',   password: await hash('student@123'), role: 'student', status: 'approved' },
      { name: 'Priya Patel',      email: 'priya.patel@college.edu',    password: await hash('student@123'), role: 'student', status: 'approved' },
      { name: 'Rahul Verma',      email: 'rahul.verma@college.edu',    password: await hash('student@123'), role: 'student', status: 'approved' },
      { name: 'Ananya Gupta',     email: 'ananya.gupta@college.edu',   password: await hash('student@123'), role: 'student', status: 'approved' },
      { name: 'Vikram Singh',     email: 'vikram.singh@college.edu',   password: await hash('student@123'), role: 'student', status: 'approved' },
      { name: 'Sneha Reddy',      email: 'sneha.reddy@college.edu',    password: await hash('student@123'), role: 'student', status: 'approved' },
      { name: 'Arjun Nair',       email: 'arjun.nair@college.edu',     password: await hash('student@123'), role: 'student', status: 'approved' },
      { name: 'Neha Joshi',       email: 'neha.joshi@college.edu',     password: await hash('student@123'), role: 'student', status: 'approved' },
      { name: 'Rohit Kumar',      email: 'rohit.kumar@college.edu',    password: await hash('student@123'), role: 'student', status: 'approved' },
      { name: 'Isha Mehta',       email: 'isha.mehta@college.edu',     password: await hash('student@123'), role: 'student', status: 'approved' },
    ];

    const companiesData = [
      { name: 'Google India',        email: 'hr@google.india',        password: await hash('company@123'), role: 'company', status: 'approved' },
      { name: 'Microsoft India',     email: 'hr@microsoft.india',     password: await hash('company@123'), role: 'company', status: 'approved' },
      { name: 'Amazon India',        email: 'hr@amazon.india',        password: await hash('company@123'), role: 'company', status: 'approved' },
      { name: 'Flipkart',            email: 'hr@flipkart.com',        password: await hash('company@123'), role: 'company', status: 'approved' },
      { name: 'TCS',                 email: 'hr@tcs.com',             password: await hash('company@123'), role: 'company', status: 'approved' },
    ];

    const facultyData = [
      { name: 'Dr. Meena Krishnan', email: 'faculty@college.edu',       password: await hash('faculty@123'), role: 'faculty', status: 'approved' },
      { name: 'Prof. Sanjay Deshmukh', email: 'sanjay.deshmukh@college.edu', password: await hash('faculty@123'), role: 'faculty', status: 'approved' },
      { name: 'Dr. Pooja Verma', email: 'pooja.verma@college.edu',      password: await hash('faculty@123'), role: 'faculty', status: 'approved' },
      { name: 'Prof. Ravi Shankar', email: 'ravi.shankar@college.edu',   password: await hash('faculty@123'), role: 'faculty', status: 'approved' },
      { name: 'Dr. Sunita Joshi', email: 'sunita.joshi@college.edu',   password: await hash('faculty@123'), role: 'faculty', status: 'approved' },
      { name: 'Prof. Arvind Nair', email: 'arvind.nair@college.edu',    password: await hash('faculty@123'), role: 'faculty', status: 'approved' },
    ];

    const adminData = [
      { name: 'Placement Admin',    email: 'admin@college.edu',      password: await hash('admin@123'),   role: 'admin',   status: 'approved' },
    ];

    const allUsers = await User.create([...adminData, ...studentsData, ...companiesData, ...facultyData]);

    const admin      = allUsers.find(u => u.email === 'admin@college.edu');
    const students   = allUsers.filter(u => u.role === 'student');
    const companies  = allUsers.filter(u => u.role === 'company');
    const faculty    = allUsers.filter(u => u.role === 'faculty');

    console.log(`Created ${allUsers.length} users`);

    // ────────────────────────────────────────────────────────────
    //  2. COMPANY PROFILES
    // ────────────────────────────────────────────────────────────

    const companyProfilesData = [
      {
        user: companies[0]._id, companyName: 'Google India',
        industry: 'Technology', website: 'https://careers.google.com',
        description: 'Global technology leader specializing in search, cloud computing, AI, and digital advertising.',
        hrName: 'Priya Iyer', hrEmail: 'priya.i@google.com', hrPhone: '+91-9876543210',
        location: 'Bangalore, Karnataka',
      },
      {
        user: companies[1]._id, companyName: 'Microsoft India',
        industry: 'Technology', website: 'https://careers.microsoft.com',
        description: 'Leading software developer known for Windows, Azure cloud, and enterprise solutions.',
        hrName: 'Rajan Kapoor', hrEmail: 'rajan.k@microsoft.com', hrPhone: '+91-9876543211',
        location: 'Hyderabad, Telangana',
      },
      {
        user: companies[2]._id, companyName: 'Amazon India',
        industry: 'E-commerce / Cloud', website: 'https://amazon.jobs',
        description: 'World\'s largest online retailer and cloud infrastructure provider through AWS.',
        hrName: 'Sneha Menon', hrEmail: 'sneha.m@amazon.com', hrPhone: '+91-9876543212',
        location: 'Bangalore, Karnataka',
      },
      {
        user: companies[3]._id, companyName: 'Flipkart',
        industry: 'E-commerce', website: 'https://www.flipkartcareers.com',
        description: 'India\'s homegrown e-commerce marketplace with a vast logistics and supply chain network.',
        hrName: 'Amit Saxena', hrEmail: 'amit.s@flipkart.com', hrPhone: '+91-9876543213',
        location: 'Bangalore, Karnataka',
      },
      {
        user: companies[4]._id, companyName: 'TCS',
        industry: 'IT Services & Consulting', website: 'https://www.tcs.com/careers',
        description: 'India\'s largest IT services company providing enterprise solutions globally.',
        hrName: 'Sunita Desai', hrEmail: 'sunita.d@tcs.com', hrPhone: '+91-9876543214',
        location: 'Mumbai, Maharashtra',
      },
    ];

    const companyProfiles = await CompanyProfile.create(companyProfilesData);
    console.log(`Created ${companyProfiles.length} company profiles`);

    // ────────────────────────────────────────────────────────────
    //  3. STUDENT PROFILES
    // ────────────────────────────────────────────────────────────

    const studentProfilesData = [
      { user: students[0]._id, rollNumber: 'CS21001', branch: 'CS', cgpa: 9.2, semester: 6, passingYear: 2026,
        skills: ['Python', 'Java', 'Machine Learning', 'SQL', 'React'], certifications: [{ name: 'AWS Cloud Practitioner', issuer: 'Amazon', year: 2025 }],
        achievements: ['1st place in Hackathon 2024', 'Published research paper on ML'], linkedIn: 'https://linkedin.com/in/aarav', github: 'https://github.com/aarav', profileComplete: true },
      { user: students[1]._id, rollNumber: 'CS21002', branch: 'CS', cgpa: 8.8, semester: 6, passingYear: 2026,
        skills: ['JavaScript', 'TypeScript', 'Node.js', 'Docker', 'Kubernetes'], certifications: [{ name: 'Google Cloud Associate Engineer', issuer: 'Google', year: 2025 }],
        achievements: ['Smart India Hackathon finalist'], linkedIn: 'https://linkedin.com/in/priya', github: 'https://github.com/priya', profileComplete: true },
      { user: students[2]._id, rollNumber: 'IT21001', branch: 'IT', cgpa: 8.5, semester: 6, passingYear: 2026,
        skills: ['C++', 'Data Structures', 'Algorithms', 'Linux', 'Git'], certifications: [],
        achievements: ['CodeChef Rating 1800'], linkedIn: 'https://linkedin.com/in/rahul', github: 'https://github.com/rahul', profileComplete: true },
      { user: students[3]._id, rollNumber: 'EC21001', branch: 'EC', cgpa: 9.0, semester: 6, passingYear: 2026,
        skills: ['Embedded Systems', 'Python', 'MATLAB', 'Verilog', 'IoT'], certifications: [{ name: 'NPTEL Embedded Systems', issuer: 'IIT Madras', year: 2024 }],
        achievements: ['Best Project Award in Electronics Expo'], linkedIn: 'https://linkedin.com/in/ananya', github: 'https://github.com/ananya', profileComplete: true },
      { user: students[4]._id, rollNumber: 'ME21001', branch: 'ME', cgpa: 7.8, semester: 6, passingYear: 2026,
        skills: ['AutoCAD', 'SolidWorks', 'Python', 'CFD', 'MATLAB'], certifications: [{ name: 'SolidWorks Associate', issuer: 'Dassault', year: 2024 }],
        achievements: ['SAE BAJA participant'], linkedIn: 'https://linkedin.com/in/vikram', github: 'https://github.com/vikram', profileComplete: true },
      { user: students[5]._id, rollNumber: 'CS21003', branch: 'CS', cgpa: 9.5, semester: 6, passingYear: 2026,
        skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'React'], certifications: [{ name: 'TensorFlow Developer Certificate', issuer: 'Google', year: 2025 }, { name: 'Deep Learning Specialization', issuer: 'DeepLearning.AI', year: 2024 }],
        achievements: ['Kaggle Master', 'Published 2 research papers'], linkedIn: 'https://linkedin.com/in/sneha', github: 'https://github.com/sneha', profileComplete: true },
      { user: students[6]._id, rollNumber: 'IT21002', branch: 'IT', cgpa: 8.2, semester: 6, passingYear: 2026,
        skills: ['Java', 'Spring Boot', 'Microservices', 'AWS', 'MySQL'], certifications: [{ name: 'Oracle Java SE 11 Developer', issuer: 'Oracle', year: 2024 }],
        achievements: ['Built a full-stack e-commerce platform'], linkedIn: 'https://linkedin.com/in/arjun', github: 'https://github.com/arjun', profileComplete: true },
      { user: students[7]._id, rollNumber: 'EC21002', branch: 'EC', cgpa: 8.3, semester: 6, passingYear: 2026,
        skills: ['VLSI Design', 'Python', 'C', 'PCB Design', 'IoT', 'Raspberry Pi'], certifications: [{ name: 'VLSI Design NPTEL', issuer: 'IIT Kharagpur', year: 2024 }],
        achievements: ['Robotics club lead'], linkedIn: 'https://linkedin.com/in/neha', github: 'https://github.com/neha', profileComplete: true },
      { user: students[8]._id, rollNumber: 'CS21004', branch: 'CS', cgpa: 7.5, semester: 6, passingYear: 2026,
        skills: ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'PHP'], certifications: [],
        achievements: ['Web development intern at local startup'], linkedIn: 'https://linkedin.com/in/rohit', github: 'https://github.com/rohit', profileComplete: true },
      { user: students[9]._id, rollNumber: 'IT21003', branch: 'IT', cgpa: 9.1, semester: 6, passingYear: 2026,
        skills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Docker', 'React'], certifications: [{ name: 'AWS Solutions Architect Associate', issuer: 'Amazon', year: 2025 }],
        achievements: ['Microsoft Imagine Cup regional finalist'], linkedIn: 'https://linkedin.com/in/isha', github: 'https://github.com/isha', profileComplete: true },
    ];

    const studentProfiles = await StudentProfile.create(studentProfilesData);
    console.log(`Created ${studentProfiles.length} student profiles`);

    // ────────────────────────────────────────────────────────────
    //  4. JOBS
    // ────────────────────────────────────────────────────────────

    const jobsData = [
      {
        company: companies[0]._id, companyProfile: companyProfiles[0]._id,
        title: 'Software Engineer', type: 'job', description: 'Join Google\'s engineering team to build next-generation products that serve billions of users.',
        requirements: 'Strong DSA, proficiency in C++/Java/Python, problem-solving skills, team collaboration.',
        location: 'Bangalore', package: 30, eligibleBranches: ['CS', 'IT', 'EC'], minCgpa: 8.0,
        requiredSkills: ['Python', 'Java', 'C++', 'Data Structures', 'Algorithms'],
        rounds: [
          { roundNumber: 1, name: 'Online Assessment', description: 'Coding test on DSA' },
          { roundNumber: 2, name: 'Technical Interview 1', description: 'Problem-solving & coding' },
          { roundNumber: 3, name: 'Technical Interview 2', description: 'System design & algorithms' },
          { roundNumber: 4, name: 'HR Round', description: 'Behavioral & cultural fit' },
        ],
        applicationDeadline: new Date('2026-08-15'), driveDate: new Date('2026-09-01'),
        vacancies: 15, status: 'active',
      },
      {
        company: companies[0]._id, companyProfile: companyProfiles[0]._id,
        title: 'Software Engineering Intern', type: 'internship', description: 'Summer internship for pre-final year students at Google India.',
        requirements: 'Good coding skills, basic DSA, fast learner.',
        location: 'Bangalore', stipend: 100000, eligibleBranches: ['CS', 'IT'], minCgpa: 8.5,
        requiredSkills: ['Python', 'Java', 'JavaScript'],
        rounds: [
          { roundNumber: 1, name: 'Coding Assessment', description: 'Online coding test' },
          { roundNumber: 2, name: 'Technical Interview', description: 'Problem-solving' },
        ],
        applicationDeadline: new Date('2026-07-01'), driveDate: new Date('2026-07-20'),
        vacancies: 5, status: 'active',
      },
      {
        company: companies[1]._id, companyProfile: companyProfiles[1]._id,
        title: 'Full Stack Developer', type: 'job', description: 'Build and maintain enterprise-grade applications using .NET and Azure cloud services.',
        requirements: 'Experience with React, Node.js, C#, Azure services, REST APIs.',
        location: 'Hyderabad', package: 25, eligibleBranches: ['CS', 'IT'], minCgpa: 7.5,
        requiredSkills: ['React', 'Node.js', 'C#', 'Azure', 'REST API'],
        rounds: [
          { roundNumber: 1, name: 'Coding Test', description: 'Full-stack coding challenge' },
          { roundNumber: 2, name: 'Technical Interview 1', description: 'Frontend & backend' },
          { roundNumber: 3, name: 'Technical Interview 2', description: 'System design' },
          { roundNumber: 4, name: 'Managerial Round', description: 'Leadership & team fit' },
        ],
        applicationDeadline: new Date('2026-09-10'), driveDate: new Date('2026-09-25'),
        vacancies: 20, status: 'active',
      },
      {
        company: companies[2]._id, companyProfile: companyProfiles[2]._id,
        title: 'SDE 1', type: 'job', description: 'Design and build systems that power Amazon\'s e-commerce and cloud platforms.',
        requirements: 'Strong OOP concepts, DSA, distributed systems knowledge.',
        location: 'Bangalore', package: 28, eligibleBranches: ['CS', 'IT', 'EC', 'EE'], minCgpa: 7.0,
        requiredSkills: ['Java', 'Python', 'SQL', 'AWS', 'Distributed Systems'],
        rounds: [
          { roundNumber: 1, name: 'Online Assessment', description: 'Coding + aptitude test' },
          { roundNumber: 2, name: 'Technical Interview 1', description: 'DSA & problem solving' },
          { roundNumber: 3, name: 'Technical Interview 2', description: 'System design & OOD' },
          { roundNumber: 4, name: 'Bar Raiser', description: 'Leadership principles & deep-dive' },
        ],
        applicationDeadline: new Date('2026-08-30'), driveDate: new Date('2026-09-15'),
        vacancies: 25, status: 'active',
      },
      {
        company: companies[3]._id, companyProfile: companyProfiles[3]._id,
        title: 'Software Development Engineer', type: 'job', description: 'Build India-scale e-commerce solutions serving millions of customers.',
        requirements: 'Strong coding skills, familiarity with microservices, excellent problem-solving.',
        location: 'Bangalore', package: 22, eligibleBranches: ['CS', 'IT'], minCgpa: 7.5,
        requiredSkills: ['Java', 'Spring Boot', 'React', 'MySQL', 'Kafka'],
        rounds: [
          { roundNumber: 1, name: 'Coding Round', description: 'DSA coding challenge on HackerRank' },
          { roundNumber: 2, name: 'Machine Coding', description: 'Design a real-world system' },
          { roundNumber: 3, name: 'HM Round', description: 'Hiring manager discussion' },
          { roundNumber: 4, name: 'HR Round', description: 'Culture & compensation' },
        ],
        applicationDeadline: new Date('2026-10-01'), driveDate: new Date('2026-10-15'),
        vacancies: 12, status: 'active',
      },
      {
        company: companies[4]._id, companyProfile: companyProfiles[4]._id,
        title: 'Systems Engineer', type: 'job', description: 'Work on large-scale IT transformation projects for global clients.',
        requirements: 'Good academic record, basic programming knowledge, willingness to learn.',
        location: 'Mumbai', package: 8, eligibleBranches: ['CS', 'IT', 'EC', 'EE', 'ME', 'CE'], minCgpa: 6.0,
        requiredSkills: ['Java', 'SQL', 'Python', 'Communication'],
        rounds: [
          { roundNumber: 1, name: 'Aptitude Test', description: 'Quantitative & logical reasoning' },
          { roundNumber: 2, name: 'Technical Interview', description: 'Core subjects & coding basics' },
          { roundNumber: 3, name: 'HR Interview', description: 'Communication & readiness' },
        ],
        applicationDeadline: new Date('2026-11-01'), driveDate: new Date('2026-11-15'),
        vacancies: 50, status: 'active',
      },
      {
        company: companies[4]._id, companyProfile: companyProfiles[4]._id,
        title: 'Digital Intern', type: 'internship', description: 'Paid internship in TCS Digital division working on cutting-edge technologies.',
        requirements: 'Strong programming skills, analytical thinking.',
        location: 'Mumbai', stipend: 35000, eligibleBranches: ['CS', 'IT', 'EC'], minCgpa: 7.5,
        requiredSkills: ['Python', 'Java', 'SQL'],
        rounds: [
          { roundNumber: 1, name: 'Coding Test', description: 'Online coding test' },
          { roundNumber: 2, name: 'Technical Interview', description: 'Technical discussion' },
        ],
        applicationDeadline: new Date('2026-06-15'), driveDate: new Date('2026-07-01'),
        vacancies: 10, status: 'closed',
      },
      {
        company: companies[2]._id, companyProfile: companyProfiles[2]._id,
        title: 'Data Engineer Intern', type: 'internship', description: 'Work with Amazon\'s data pipelines and analytics platforms.',
        requirements: 'Python, SQL, basic understanding of data warehousing.',
        location: 'Bangalore', stipend: 80000, eligibleBranches: ['CS', 'IT'], minCgpa: 8.0,
        requiredSkills: ['Python', 'SQL', 'Spark', 'AWS'],
        rounds: [
          { roundNumber: 1, name: 'Online Test', description: 'SQL + Python coding' },
          { roundNumber: 2, name: 'Technical Interview', description: 'Data engineering concepts' },
        ],
        applicationDeadline: new Date('2026-05-01'), driveDate: new Date('2026-05-20'),
        vacancies: 3, status: 'closed',
      },
    ];

    const jobs = await Job.create(jobsData);
    console.log(`Created ${jobs.length} jobs`);

    // ────────────────────────────────────────────────────────────
    //  5. APPLICATIONS
    // ────────────────────────────────────────────────────────────
    // Create applications linking some students to some jobs with status history.

    const applicationsData = [
      // Student 0 (Aarav - CS, 9.2) → Google SDE
      { job: jobs[0]._id, student: students[0]._id, studentProfile: studentProfiles[0]._id,
        status: 'shortlisted', appliedAt: new Date('2026-07-20'),
        statusHistory: [
          { status: 'applied', changedAt: new Date('2026-07-20'), note: 'Applied successfully' },
          { status: 'shortlisted', changedAt: new Date('2026-07-28'), note: 'Shortlisted for interviews' },
        ]
      },
      // Student 0 → Google Intern
      { job: jobs[1]._id, student: students[0]._id, studentProfile: studentProfiles[0]._id,
        status: 'interview_scheduled', appliedAt: new Date('2026-06-10'),
        statusHistory: [
          { status: 'applied', changedAt: new Date('2026-06-10'), note: 'Applied' },
          { status: 'shortlisted', changedAt: new Date('2026-06-18'), note: 'Shortlisted' },
          { status: 'interview_scheduled', changedAt: new Date('2026-06-22'), note: 'Interview scheduled for July 5' },
        ]
      },
      // Student 1 (Priya - CS, 8.8) → Microsoft Full Stack
      { job: jobs[2]._id, student: students[1]._id, studentProfile: studentProfiles[1]._id,
        status: 'selected', appliedAt: new Date('2026-08-01'),
        statusHistory: [
          { status: 'applied', changedAt: new Date('2026-08-01'), note: 'Applied' },
          { status: 'shortlisted', changedAt: new Date('2026-08-10'), note: 'Shortlisted' },
          { status: 'interview_scheduled', changedAt: new Date('2026-08-15'), note: 'Interviews completed' },
          { status: 'selected', changedAt: new Date('2026-08-25'), note: 'Offer extended! 🎉' },
        ]
      },
      // Student 2 (Rahul - IT, 8.5) → Amazon SDE
      { job: jobs[3]._id, student: students[2]._id, studentProfile: studentProfiles[2]._id,
        status: 'interview_scheduled', appliedAt: new Date('2026-08-05'),
        statusHistory: [
          { status: 'applied', changedAt: new Date('2026-08-05'), note: 'Applied' },
          { status: 'shortlisted', changedAt: new Date('2026-08-12'), note: 'Shortlisted' },
          { status: 'interview_scheduled', changedAt: new Date('2026-08-20'), note: 'Round 1 scheduled' },
        ]
      },
      // Student 3 (Ananya - EC, 9.0) → Google SDE
      { job: jobs[0]._id, student: students[3]._id, studentProfile: studentProfiles[3]._id,
        status: 'applied', appliedAt: new Date('2026-08-01'),
        statusHistory: [
          { status: 'applied', changedAt: new Date('2026-08-01'), note: 'Applied' },
        ]
      },
      // Student 4 (Vikram - ME, 7.8) → TCS Systems Engineer
      { job: jobs[5]._id, student: students[4]._id, studentProfile: studentProfiles[4]._id,
        status: 'selected', appliedAt: new Date('2026-10-01'),
        statusHistory: [
          { status: 'applied', changedAt: new Date('2026-10-01'), note: 'Applied' },
          { status: 'shortlisted', changedAt: new Date('2026-10-10'), note: 'Shortlisted' },
          { status: 'interview_scheduled', changedAt: new Date('2026-10-20'), note: 'Interview attended' },
          { status: 'selected', changedAt: new Date('2026-11-01'), note: 'Offer received! 🎉' },
        ]
      },
      // Student 5 (Sneha - CS, 9.5) → Google SDE
      { job: jobs[0]._id, student: students[5]._id, studentProfile: studentProfiles[5]._id,
        status: 'selected', appliedAt: new Date('2026-07-15'),
        statusHistory: [
          { status: 'applied', changedAt: new Date('2026-07-15'), note: 'Applied' },
          { status: 'shortlisted', changedAt: new Date('2026-07-22'), note: 'Shortlisted' },
          { status: 'interview_scheduled', changedAt: new Date('2026-07-28'), note: 'All rounds completed' },
          { status: 'selected', changedAt: new Date('2026-08-05'), note: 'Offer received! 🎉' },
        ]
      },
      // Student 5 → Amazon SDE
      { job: jobs[3]._id, student: students[5]._id, studentProfile: studentProfiles[5]._id,
        status: 'rejected', appliedAt: new Date('2026-08-10'),
        statusHistory: [
          { status: 'applied', changedAt: new Date('2026-08-10'), note: 'Applied' },
          { status: 'shortlisted', changedAt: new Date('2026-08-18'), note: 'Shortlisted' },
          { status: 'interview_scheduled', changedAt: new Date('2026-08-25'), note: 'Interview attended' },
          { status: 'rejected', changedAt: new Date('2026-09-01'), note: 'Not selected after final round' },
        ]
      },
      // Student 6 (Arjun - IT, 8.2) → Flipkart SDE
      { job: jobs[4]._id, student: students[6]._id, studentProfile: studentProfiles[6]._id,
        status: 'applied', appliedAt: new Date('2026-09-05'),
        statusHistory: [
          { status: 'applied', changedAt: new Date('2026-09-05'), note: 'Applied' },
        ]
      },
      // Student 7 (Neha - EC, 8.3) → Amazon SDE
      { job: jobs[3]._id, student: students[7]._id, studentProfile: studentProfiles[7]._id,
        status: 'shortlisted', appliedAt: new Date('2026-08-15'),
        statusHistory: [
          { status: 'applied', changedAt: new Date('2026-08-15'), note: 'Applied' },
          { status: 'shortlisted', changedAt: new Date('2026-08-22'), note: 'Shortlisted' },
        ]
      },
      // Student 8 (Rohit - CS, 7.5) → TCS Systems Engineer
      { job: jobs[5]._id, student: students[8]._id, studentProfile: studentProfiles[8]._id,
        status: 'shortlisted', appliedAt: new Date('2026-10-05'),
        statusHistory: [
          { status: 'applied', changedAt: new Date('2026-10-05'), note: 'Applied' },
          { status: 'shortlisted', changedAt: new Date('2026-10-15'), note: 'Shortlisted' },
        ]
      },
      // Student 9 (Isha - IT, 9.1) → Microsoft Full Stack
      { job: jobs[2]._id, student: students[9]._id, studentProfile: studentProfiles[9]._id,
        status: 'selected', appliedAt: new Date('2026-08-01'),
        statusHistory: [
          { status: 'applied', changedAt: new Date('2026-08-01'), note: 'Applied' },
          { status: 'shortlisted', changedAt: new Date('2026-08-10'), note: 'Shortlisted' },
          { status: 'interview_scheduled', changedAt: new Date('2026-08-15'), note: 'Interviews completed' },
          { status: 'selected', changedAt: new Date('2026-08-25'), note: 'Offer received! 🎉' },
        ]
      },
      // Student 9 → Google SDE
      { job: jobs[0]._id, student: students[9]._id, studentProfile: studentProfiles[9]._id,
        status: 'rejected', appliedAt: new Date('2026-07-20'),
        statusHistory: [
          { status: 'applied', changedAt: new Date('2026-07-20'), note: 'Applied' },
          { status: 'rejected', changedAt: new Date('2026-07-25'), note: 'Did not meet shortlisting criteria' },
        ]
      },
      // Student 0 (Aarav) → Flipkart SDE
      { job: jobs[4]._id, student: students[0]._id, studentProfile: studentProfiles[0]._id,
        status: 'applied', appliedAt: new Date('2026-09-05'),
        statusHistory: [
          { status: 'applied', changedAt: new Date('2026-09-05'), note: 'Applied' },
        ]
      },
    ];

    const applications = await Application.create(applicationsData);
    console.log(`Created ${applications.length} applications`);

    // Mark placed students (those with 'selected' applications)
    const selectedStudentIds = await Application.distinct('student', { status: 'selected' });
    for (const studentId of selectedStudentIds) {
      const selApp = await Application.findOne({ student: studentId, status: 'selected' }).populate('job');
      if (selApp && selApp.job) {
        await StudentProfile.findOneAndUpdate(
          { user: studentId },
          { isPlaced: true, placedAt: selApp.job.companyProfile, placementPackage: selApp.job.package || selApp.job.stipend }
        );
      }
    }
    console.log(`Marked ${selectedStudentIds.length} students as placed`);

    // ────────────────────────────────────────────────────────────
    //  6. INTERVIEWS
    // ────────────────────────────────────────────────────────────

    const interviewsData = [
      {
        job: jobs[0]._id, student: students[5]._id,
        scheduledAt: new Date('2026-07-30T10:00:00'), venue: 'Google Office, Bangalore',
        roundName: 'Technical Interview 1', mode: 'offline', outcome: 'passed',
        notes: 'Excellent problem-solving skills. Recommended for next round.',
      },
      {
        job: jobs[0]._id, student: students[5]._id,
        scheduledAt: new Date('2026-08-01T14:00:00'), venue: 'Google Office, Bangalore',
        roundName: 'Technical Interview 2', mode: 'offline', outcome: 'passed',
        notes: 'Strong system design and coding skills.',
      },
      {
        job: jobs[2]._id, student: students[1]._id,
        scheduledAt: new Date('2026-08-18T11:00:00'), venue: 'Microsoft Teams',
        roundName: 'Coding Interview', mode: 'online', meetLink: 'https://teams.microsoft.com/meet/123',
        outcome: 'passed', notes: 'Completed all coding challenges successfully.',
      },
      {
        job: jobs[3]._id, student: students[2]._id,
        scheduledAt: new Date('2026-08-25T09:30:00'), venue: 'Amazon Office, Bangalore',
        roundName: 'DSA Round', mode: 'offline', outcome: 'pending',
        notes: 'Waiting for result.',
      },
      {
        job: jobs[1]._id, student: students[0]._id,
        scheduledAt: new Date('2026-07-05T10:00:00'), venue: 'Google Meet',
        roundName: 'Technical Interview', mode: 'online', meetLink: 'https://meet.google.com/abc-xyz',
        outcome: 'pending', notes: 'Interview scheduled.',
      },
      {
        job: jobs[5]._id, student: students[4]._id,
        scheduledAt: new Date('2026-10-22T15:00:00'), venue: 'TCS Office, Mumbai',
        roundName: 'Technical Interview', mode: 'offline', outcome: 'passed',
        notes: 'Good communication and basic technical knowledge.',
      },
    ];

    const interviews = await Interview.create(interviewsData);
    console.log(`Created ${interviews.length} interviews`);

    // ────────────────────────────────────────────────────────────
    //  7. DRIVES
    // ────────────────────────────────────────────────────────────

    const drivesData = [
      {
        title: 'Google India Placement Drive 2026',
        company: companyProfiles[0]._id, job: jobs[0]._id,
        date: new Date('2026-09-01'), venue: 'Google Office, Bangalore',
        createdAt: new Date('2026-03-15'),
        rounds: [
          { roundNumber: 1, name: 'Online Assessment', scheduledTime: '09:00 AM', venue: 'Lab 1' },
          { roundNumber: 2, name: 'Technical Interview 1', scheduledTime: '02:00 PM', venue: 'Room 201' },
          { roundNumber: 3, name: 'Technical Interview 2', scheduledTime: '11:00 AM', venue: 'Room 205' },
        ],
        eligibleBatches: ['2026'], status: 'upcoming', createdBy: admin._id,
        notes: 'Students should bring their laptops and college ID.',
      },
      {
        title: 'Amazon India Mega Drive',
        company: companyProfiles[2]._id, job: jobs[3]._id,
        date: new Date('2026-09-15'), venue: 'Amazon Office, Bangalore',
        createdAt: new Date('2026-04-20'),
        rounds: [
          { roundNumber: 1, name: 'Online Assessment', scheduledTime: '10:00 AM', venue: 'Lab 2' },
          { roundNumber: 2, name: 'Technical Round 1', scheduledTime: '01:00 PM', venue: 'Floor 3' },
          { roundNumber: 3, name: 'Bar Raiser Round', scheduledTime: '04:00 PM', venue: 'Board Room' },
        ],
        eligibleBatches: ['2026', '2027'], status: 'upcoming', createdBy: admin._id,
        notes: 'Eligibility: CGPA >= 7.0, no active backlogs.',
      },
      {
        title: 'Microsoft Placement Drive',
        company: companyProfiles[1]._id, job: jobs[2]._id,
        date: new Date('2026-09-25'), venue: 'Microsoft Office, Hyderabad',
        createdAt: new Date('2026-05-10'),
        rounds: [
          { roundNumber: 1, name: 'Coding Test', scheduledTime: '09:30 AM', venue: 'Auditorium' },
          { roundNumber: 2, name: 'Technical Interview', scheduledTime: '02:00 PM', venue: 'Meeting Room A' },
          { roundNumber: 3, name: 'Managerial Round', scheduledTime: '11:00 AM', venue: 'Meeting Room B' },
        ],
        eligibleBatches: ['2026'], status: 'upcoming', createdBy: admin._id,
        notes: 'Carry resumes and previous internship certificates.',
      },
      {
        title: 'TCS Campus Recruitment',
        company: companyProfiles[4]._id, job: jobs[5]._id,
        date: new Date('2026-11-15'), venue: 'College Campus - Main Auditorium',
        createdAt: new Date('2026-07-05'),
        rounds: [
          { roundNumber: 1, name: 'Aptitude Test', scheduledTime: '10:00 AM', venue: 'Auditorium' },
          { roundNumber: 2, name: 'Technical Interview', scheduledTime: '01:00 PM', venue: 'Seminar Hall' },
          { roundNumber: 3, name: 'HR Interview', scheduledTime: '03:00 PM', venue: 'Room 101' },
        ],
        eligibleBatches: ['2026', '2027'], status: 'upcoming', createdBy: admin._id,
        notes: 'Open to all branches. Carry 2 copies of resume.',
      },
      {
        title: 'TCS Digital Internship Drive',
        company: companyProfiles[4]._id, job: jobs[6]._id,
        date: new Date('2026-07-01'), venue: 'Online',
        createdAt: new Date('2026-02-01'),
        rounds: [
          { roundNumber: 1, name: 'Coding Test', scheduledTime: '10:00 AM', venue: 'Online' },
          { roundNumber: 2, name: 'Technical Interview', scheduledTime: '02:00 PM', venue: 'Online' },
        ],
        eligibleBatches: ['2027'], status: 'completed', createdBy: admin._id,
        notes: 'This drive has concluded.',
      },
      {
        title: 'Amazon Data Engineer Intern Drive',
        company: companyProfiles[2]._id, job: jobs[7]._id,
        date: new Date('2026-05-20'), venue: 'Online',
        createdAt: new Date('2026-01-10'),
        rounds: [
          { roundNumber: 1, name: 'Online Test', scheduledTime: '10:00 AM', venue: 'Online' },
          { roundNumber: 2, name: 'Technical Interview', scheduledTime: '03:00 PM', venue: 'Online' },
        ],
        eligibleBatches: ['2027'], status: 'completed', createdBy: admin._id,
        notes: 'This drive has concluded.',
      },
    ];

    const drives = await Drive.create(drivesData);
    console.log(`Created ${drives.length} drives`);

    // ────────────────────────────────────────────────────────────
    //  8. ANNOUNCEMENTS
    // ────────────────────────────────────────────────────────────

    const announcementsData = [
      {
        title: 'Welcome to the Placement Portal',
        content: 'The new placement portal is now live! All students and companies must register and complete their profiles to participate in placement activities.',
        targetRoles: ['student', 'company', 'faculty'], postedBy: admin._id, isPinned: true,
      },
      {
        title: 'Google India Drive - Registration Open',
        content: 'Google India is visiting campus for placements. Software Engineer role with 30 LPA CTC. Eligibility: CS/IT/EC branches, CGPA >= 8.0. Last date to apply: August 15, 2026.',
        targetRoles: ['student'], postedBy: admin._id, isPinned: true,
      },
      {
        title: 'Resume Building Workshop',
        content: 'The placement cell is organizing a resume-building workshop on July 10, 2026 at 3:00 PM in Seminar Hall. All students are encouraged to attend.',
        targetRoles: ['student'], postedBy: faculty[0]._id, isPinned: false,
      },
      {
        title: 'Mock Interview Sessions',
        content: 'Mock interview sessions will be conducted from July 15-20. Sign up at the placement office. First come, first served.',
        targetRoles: ['student'], postedBy: faculty[0]._id, isPinned: false,
      },
      {
        title: 'Company Registration Guidelines',
        content: 'Companies interested in participating in campus placements can register on the portal. For bulk hiring, please contact the placement office directly.',
        targetRoles: ['company'], postedBy: admin._id, isPinned: false,
      },
      {
        title: 'Placement Statistics Report Available',
        content: 'The placement statistics for the academic year 2025-26 have been published. Faculty can view detailed reports on the dashboard.',
        targetRoles: ['faculty'], postedBy: admin._id, isPinned: false,
      },
    ];

    const announcements = await Announcement.create(announcementsData);
    console.log(`Created ${announcements.length} announcements`);

    // ────────────────────────────────────────────────────────────
    //  9. NOTIFICATIONS
    // ────────────────────────────────────────────────────────────

    const today = new Date();
    const notificationsData = [];

    for (const student of students) {
      notificationsData.push({
        user: student._id, title: 'Profile Complete',
        message: 'Please complete your student profile to apply for jobs. Add your skills, resume, and other details.',
        type: 'info', isRead: false,
      });
    }

    // Application status notifications
    notificationsData.push(
      { user: students[0]._id, title: 'Application Shortlisted', message: 'Your application for Google India SDE has been shortlisted! Check the interviews section.', type: 'success', relatedJob: jobs[0]._id, isRead: false },
      { user: students[5]._id, title: 'Offer Letter 🎉', message: 'Congratulations! Google India has extended an offer for the SDE position.', type: 'success', relatedJob: jobs[0]._id, isRead: false },
      { user: students[1]._id, title: 'Offer Letter 🎉', message: 'Congratulations! Microsoft has extended an offer for the Full Stack Developer position.', type: 'success', relatedJob: jobs[2]._id, isRead: false },
      { user: students[9]._id, title: 'Offer Letter 🎉', message: 'Congratulations! Microsoft has extended an offer for the Full Stack Developer position.', type: 'success', relatedJob: jobs[2]._id, isRead: false },
      { user: students[2]._id, title: 'Interview Scheduled', message: 'Your Amazon SDE interview has been scheduled for Aug 25. Prepare well!', type: 'info', relatedJob: jobs[3]._id, isRead: false },
      { user: students[5]._id, title: 'Application Update', message: 'Your Amazon SDE application was not selected after the final round.', type: 'alert', relatedJob: jobs[3]._id, isRead: false },
      { user: students[9]._id, title: 'Application Update', message: 'Your Google SDE application was not shortlisted.', type: 'alert', relatedJob: jobs[0]._id, isRead: false },
      { user: students[4]._id, title: 'Offer Letter 🎉', message: 'Congratulations! TCS has extended an offer for the Systems Engineer position.', type: 'success', relatedJob: jobs[5]._id, isRead: false },
    );

    // Drive notifications
    notificationsData.push(
      { user: faculty[0]._id, title: 'Upcoming Drive', message: 'Google India placement drive is scheduled for Sep 1, 2026.', type: 'info', relatedDrive: drives[0]._id, isRead: false },
      { user: admin._id, title: 'New Company Registration', message: 'A new company has registered on the portal. Please verify and approve.', type: 'info', isRead: false },
    );

    const notifications = await Notification.create(notificationsData);
    console.log(`Created ${notifications.length} notifications`);

    // ────────────────────────────────────────────────────────────
    //  DONE
    // ────────────────────────────────────────────────────────────

    console.log('\n✅ Database seeded successfully!');
    console.log('─────────────────────────────────────');
    console.log('   Login Credentials');
    console.log('─────────────────────────────────────');
    await printCredentials();
    process.exit(0);

  } catch (error) {
    console.error('Seed error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

async function printCredentials() {
  console.log('┌──────────────────────────────┬──────────────────────────────────────┬──────────────────┐');
  console.log('│ Role                         │ Email                                │ Password         │');
  console.log('├──────────────────────────────┼──────────────────────────────────────┼──────────────────┤');
  console.log('│ Admin                        │ admin@college.edu                    │ admin@123        │');
  console.log('├──────────────────────────────┼──────────────────────────────────────┼──────────────────┤');
  console.log('│ Faculty - Dr. Meena Krishnan  │ faculty@college.edu                  │ faculty@123      │');
  console.log('│ Faculty - Prof. Sanjay D.     │ sanjay.deshmukh@college.edu          │ faculty@123      │');
  console.log('│ Faculty - Dr. Pooja Verma     │ pooja.verma@college.edu              │ faculty@123      │');
  console.log('│ Faculty - Prof. Ravi Shankar  │ ravi.shankar@college.edu             │ faculty@123      │');
  console.log('│ Faculty - Dr. Sunita Joshi    │ sunita.joshi@college.edu             │ faculty@123      │');
  console.log('│ Faculty - Prof. Arvind Nair   │ arvind.nair@college.edu              │ faculty@123      │');
  console.log('├──────────────────────────────┼──────────────────────────────────────┼──────────────────┤');
  console.log('│ Student - Aarav Sharma       │ aarav.sharma@college.edu             │ student@123      │');
  console.log('│ Student - Priya Patel        │ priya.patel@college.edu              │ student@123      │');
  console.log('│ Student - Rahul Verma        │ rahul.verma@college.edu              │ student@123      │');
  console.log('│ Student - Ananya Gupta       │ ananya.gupta@college.edu             │ student@123      │');
  console.log('│ Student - Vikram Singh       │ vikram.singh@college.edu             │ student@123      │');
  console.log('│ Student - Sneha Reddy        │ sneha.reddy@college.edu              │ student@123      │');
  console.log('│ Student - Arjun Nair         │ arjun.nair@college.edu               │ student@123      │');
  console.log('│ Student - Neha Joshi         │ neha.joshi@college.edu               │ student@123      │');
  console.log('│ Student - Rohit Kumar        │ rohit.kumar@college.edu              │ student@123      │');
  console.log('│ Student - Isha Mehta         │ isha.mehta@college.edu               │ student@123      │');
  console.log('├──────────────────────────────┼──────────────────────────────────────┼──────────────────┤');
  console.log('│ Company - Google India       │ hr@google.india                      │ company@123      │');
  console.log('│ Company - Microsoft India    │ hr@microsoft.india                   │ company@123      │');
  console.log('│ Company - Amazon India       │ hr@amazon.india                      │ company@123      │');
  console.log('│ Company - Flipkart           │ hr@flipkart.com                      │ company@123      │');
  console.log('│ Company - TCS                │ hr@tcs.com                           │ company@123      │');
  console.log('└──────────────────────────────┴──────────────────────────────────────┴──────────────────┘');
}

seed();
