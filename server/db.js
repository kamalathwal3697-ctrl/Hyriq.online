import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_FILE = path.join(process.cwd(), 'db.json');

const defaultJobs = [
  {
    id: 'job-1',
    title: 'React Developer',
    companyName: 'Malwa Tech Solutions',
    logoSeed: 'MT',
    location: 'Bathinda, Punjab',
    type: 'Full-time',
    mode: 'On-site',
    salary: '₹25,000 - ₹35,000 / mo',
    experience: 'Mid-level',
    skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'REST APIs'],
    description: 'Malwa Tech Solutions is hiring a React Developer to work on our local outsourcing contracts. You will be building user interfaces, integrating secure client portals, and working directly with senior developers.',
    requirements: [
      '1+ years of experience with React.',
      'Strong understanding of HTML5, CSS3, and JavaScript ES6+.',
      'Familiarity with Git and package managers (npm/yarn).',
      'Based in or willing to relocate to Bathinda, Punjab.'
    ],
    benefits: [
      'Provident Fund (PF) and Medical Insurance.',
      'Modern workspace with high-speed internet.',
      'Performance-based annual bonuses.',
      'Flexible weekend schedules.'
    ],
    postedDate: '2 days ago',
    recruiterId: 'user-recruiter-1',
    fairWorkPact: true
  },
  {
    id: 'job-2',
    title: 'Retail Store Manager',
    companyName: 'Mittal City Mall Store',
    logoSeed: 'MM',
    location: 'Mittal Mall, Bathinda',
    type: 'Full-time',
    mode: 'On-site',
    salary: '₹20,000 - ₹25,000 / mo',
    experience: 'Mid-level',
    skills: ['Store Operations', 'Inventory Management', 'Customer Service', 'Sales Reporting'],
    description: 'We are seeking an energetic Store Manager to oversee operations at our Mittal City Mall brand showroom. You will manage a team of 4 sales executives, optimize customer interactions, and report weekly sales tallies.',
    requirements: [
      'Graduation degree in any field.',
      'Previous store management or retail sales experience.',
      'Basic mathematical and retail billing software skills.',
      'Excellent verbal communication in Punjabi, Hindi, and basic English.'
    ],
    benefits: [
      'Performance incentives based on sales targets.',
      'Provided mall meals allowance.',
      'Standard festival bonuses.',
      'Complimentary brand apparel.'
    ],
    postedDate: '1 day ago',
    recruiterId: 'user-recruiter-1',
    fairWorkPact: true
  },
  {
    id: 'job-3',
    title: 'TGT Science Teacher',
    companyName: 'DAV Public School Bathinda',
    logoSeed: 'DV',
    location: 'Bathinda, Punjab',
    type: 'Full-time',
    mode: 'On-site',
    salary: '₹28,000 - ₹38,000 / mo',
    experience: 'Mid-level',
    skills: ['Science Teaching', 'Classroom Management', 'Communication', 'Lesson Planning'],
    description: 'DAV Public School is looking for a TGT Science Teacher to conduct science classes for grade 6th to 8th. You will prepare lesson blueprints, conduct science lab experiments, and coordinate parent-teacher syncs.',
    requirements: [
      'B.Sc. and B.Ed. degree qualifications are mandatory.',
      'Excellent command over physics, chemistry, and biology fundamentals.',
      'Strong interpersonal and teaching skills.',
      'Previous teaching experience in a recognized school.'
    ],
    benefits: [
      'Provident Fund (PF) and Pension schemes.',
      'Provided summer and winter vacation leave payouts.',
      'Medical facilities support.',
      'Free education stipend for children of staff.'
    ],
    postedDate: '3 days ago',
    recruiterId: 'user-recruiter-1',
    fairWorkPact: true
  },
  {
    id: 'job-4',
    title: 'Digital Marketing Intern',
    companyName: 'Malwa Media Agency',
    logoSeed: 'MM',
    location: 'Bathinda, Punjab',
    type: 'Internship',
    mode: 'Hybrid',
    salary: '₹8,000 - ₹12,000 / mo',
    experience: 'Entry-level',
    skills: ['Social Media', 'SEO', 'Graphic Design', 'Content Creation', 'Canva'],
    description: 'Malwa Media Agency is looking for a marketing enthusiast to handle social media campaigns, publish graphics, write copy, and optimize search engine listings for our local retail clients.',
    requirements: [
      'Currently enrolled in or recently graduated with a degree in Marketing, Business, or Communications.',
      'Basic familiarity with Canva, Instagram layouts, and Facebook Ads dashboard.',
      'Creative writing and editing skills.',
      'Access to a laptop and reliable internet connection for hybrid days.'
    ],
    benefits: [
      'Practical training under experienced marketers.',
      'Certificate of Internship completion.',
      'Opportunity to convert to full-time roles.',
      'Casual dress code and weekly tea offsites.'
    ],
    postedDate: '5 hours ago',
    recruiterId: 'user-recruiter-1',
    fairWorkPact: true
  },
  {
    id: 'job-5',
    title: 'Trainee Engineer',
    companyName: 'HMEL Refinery Contractors',
    logoSeed: 'HR',
    location: 'Raman Mandi, Bathinda',
    type: 'Full-time',
    mode: 'On-site',
    salary: '₹22,000 - ₹28,000 / mo',
    experience: 'Entry-level',
    skills: ['Site Inspection', 'Industrial Safety', 'CAD Drafting', 'Project Coordination'],
    description: 'HMEL Refinery contracting firm is hiring a Trainee Engineer. You will perform daily site supervisor reviews, verify safety gear protocols, draft technical layout drafts, and report operational logs to project managers.',
    requirements: [
      'Diploma or B.Tech degree in Civil, Mechanical, or Electrical engineering.',
      'Familiarity with AutoCAD and industrial safety protocols.',
      'Strong physical fitness for site supervision duties.',
      'Willingness to commute to the Raman Mandi refinery site.'
    ],
    benefits: [
      'Provided safe daily shuttle transport from Bathinda city to the site.',
      'On-site canteen meals support.',
      'Accident cover insurance.',
      'Annual safety training certification.'
    ],
    postedDate: '5 days ago',
    recruiterId: 'user-recruiter-1',
    fairWorkPact: true
  },
  {
    id: 'job-6',
    title: 'Software Engineer III, Infrastructure',
    companyName: 'Google',
    logoSeed: 'G',
    location: 'Bengaluru, Karnataka (Remote / Hybrid)',
    type: 'Full-time',
    mode: 'Hybrid',
    salary: '₹2,50,000 - ₹3,50,000 / mo',
    experience: 'Mid-level',
    skills: ['C++', 'Go', 'Python', 'Distributed Systems', 'System Design'],
    description: 'Google is hiring a Software Engineer III for our Cloud Infrastructure team. You will work on massive-scale distributed databases, improve TPU AI supercomputer network layers, and coordinate with engineering teams globally.',
    requirements: [
      'Bachelor’s degree in Computer Science, a related technical field, or equivalent practical experience.',
      '3 years of software development experience in C++, Go, or Python.',
      'Experience designing, building, and optimizing distributed databases or storage engines.'
    ],
    benefits: [
      'Premium health, dental, and vision cover.',
      'Free on-campus meals and micro-kitchen access.',
      'Generous equity grant (GSUs).',
      'Work-from-home setup support.'
    ],
    postedDate: 'Just now',
    recruiterId: 'user-recruiter-1',
    fairWorkPact: true
  },
  {
    id: 'job-7',
    title: 'UX Designer, Workspace',
    companyName: 'Google',
    logoSeed: 'G',
    location: 'Hyderabad, Telangana (Hybrid)',
    type: 'Full-time',
    mode: 'Hybrid',
    salary: '₹1,80,000 - ₹2,60,000 / mo',
    experience: 'Mid-level',
    skills: ['Figma', 'UX Research', 'Interaction Design', 'Prototyping'],
    description: 'Google is hiring a UX Designer for our Workspace team (Google Docs & Drive). You will design next-generation collaborative UI layouts, perform usability reviews, and translate complex user problems into sleek interactive layouts.',
    requirements: [
      'Portfolio demonstrating interaction design, visual design, and product thinking.',
      'Experience designing for consumer or enterprise web platforms.',
      'Proficiency in Figma and interactive prototyping tools.'
    ],
    benefits: [
      'Comprehensive wellness programs and dental care.',
      'Generous learning budget and conference attendance.',
      'Shuttle transportation support.',
      'Recreation rooms and gym access.'
    ],
    postedDate: '1 day ago',
    recruiterId: 'user-recruiter-1',
    fairWorkPact: true
  }
];

// Initialize database file if it does not exist
export const initDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('password123', salt);

    const initialUsers = [
      {
        id: 'user-candidate-1',
        email: 'alex@hyriq.co',
        passwordHash,
        role: 'candidate',
        name: 'Amanpreet Singh',
        phone: '+91 98765-43210',
        bio: 'B.Tech graduate from GZSCCET (MRSPTU) Bathinda. Aspiring frontend developer looking for software roles in Bathinda or hybrid setups. Eager to build verified local careers.',
        skills: ['React', 'TypeScript', 'CSS/CSS Grid', 'JavaScript', 'Figma'],
        experience: 'Entry-level',
        resumeName: 'Amanpreet_Singh_CV.pdf',
        onboardingCompleted: true,
        preferences: {
          type: ['Full-time', 'Internship'],
          mode: ['Remote', 'Hybrid', 'On-site'],
          minSalary: 15000,
          experience: 'Entry-level'
        }
      },
      {
        id: 'user-recruiter-1',
        email: 'sarah@vercel.com',
        passwordHash,
        role: 'recruiter',
        name: 'Gaurav Gupta',
        phone: '+91 98123-45678',
        bio: 'HR Coordinator at Malwa Tech Solutions, Bathinda. We hire local engineering graduates and connect them to national projects.',
        companyName: 'Malwa Tech Solutions',
        companyBio: 'We are Bathinda\'s leading software agency, empowering Malwa talent with global opportunities.'
      }
    ];

    const initialApplications = [
      {
        id: 'app-1',
        jobId: 'job-1',
        candidateId: 'user-candidate-1',
        appliedDate: '1 day ago',
        status: 'Interview',
        candidateSignature: 'Amanpreet Singh',
        candidateSignedAt: '2026-06-25T10:00:00.000Z',
        recruiterSignature: 'Gaurav Gupta',
        recruiterSignedAt: '2026-06-20T10:00:00.000Z'
      }
    ];

    const initialMessages = [
      {
        id: 'msg-1',
        applicationId: 'app-1',
        sender: 'candidate',
        text: 'Hi Gaurav! I applied for the React Developer position. I live near Ajit Road and can join immediately.',
        timestamp: '1 day ago'
      },
      {
        id: 'msg-2',
        applicationId: 'app-1',
        sender: 'recruiter',
        text: 'Hi Amanpreet! Your coding projects look solid. We would love to schedule a technical interview at our office next Tuesday.',
        timestamp: '18 hours ago'
      },
      {
        id: 'msg-3',
        applicationId: 'app-1',
        sender: 'candidate',
        text: 'That sounds great, I will be there at 11 AM. Thank you!',
        timestamp: '17 hours ago'
      }
    ];

    const initialData = {
      users: initialUsers,
      jobs: defaultJobs,
      applications: initialApplications,
      messages: initialMessages
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    console.log('Database initialized and seeded.');
  }
};

// Helper read/write operations
export const readData = () => {
  initDb();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
};

export const writeData = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
};
