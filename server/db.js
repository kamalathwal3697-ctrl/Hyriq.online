import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_FILE = path.join(process.cwd(), 'db.json');

const defaultJobs = [
  {
    id: 'job-1',
    title: 'Frontend Engineer (React)',
    companyName: 'Vercel',
    logoSeed: 'VC',
    location: 'Remote (US/Global)',
    type: 'Full-time',
    mode: 'Remote',
    salary: '$110,000 - $140,000 / yr',
    experience: 'Mid-level',
    skills: ['React', 'TypeScript', 'Next.js', 'CSS Modules', 'Web Performance'],
    description: 'We are looking for a Frontend Engineer to join our Core Framework team. You will work on optimizing Next.js performance, building beautiful design system components, and collaborating with developer advocates to ship amazing web experiences.',
    requirements: [
      '2+ years of professional React experience.',
      'Strong mastery of modern CSS layout techniques (Grid, Flexbox) and CSS variables.',
      'Experience with TypeScript and modern bundle optimization.',
      'A deep appreciation for typography, visual detail, and smooth animations.'
    ],
    benefits: [
      'Full healthcare/dental/vision coverage.',
      'Flexible home office budget ($2,000 start).',
      'Open PTO policy with a mandatory 3 weeks off.',
      'Annual learning & development stipend.'
    ],
    postedDate: '2 days ago',
    recruiterId: 'user-recruiter-1'
  },
  {
    id: 'job-2',
    title: 'Product & UI/UX Designer',
    companyName: 'Figma',
    logoSeed: 'FG',
    location: 'San Francisco, CA',
    type: 'Full-time',
    mode: 'Hybrid',
    salary: '$130,000 - $165,000 / yr',
    experience: 'Mid-level',
    skills: ['UI Design', 'UX Research', 'Figma Prototyping', 'Design Systems'],
    description: 'Figma is hiring a Product Designer to focus on our prototyping and interactive features. In this role, you will design the workflows that help millions of creators define micro-interactions, layout constraints, and motion styles.',
    requirements: [
      'Portfolio showcasing clean typography, elegant interaction flows, and system-level thinking.',
      'Expert knowledge of Figma (obviously!) and developer handoff workflows.',
      'Basic understanding of CSS/HTML to collaborate effectively with engineering.',
      'Ability to articulate complex design decisions clearly.'
    ],
    benefits: [
      'Beautiful office in downtown SF with catered lunch.',
      'Generous equity package (RSUs).',
      'Mental health & wellness stipends.',
      'Quarterly team offsites.'
    ],
    postedDate: '1 day ago',
    recruiterId: 'user-recruiter-1'
  },
  {
    id: 'job-3',
    title: 'Growth & Content Specialist',
    companyName: 'Notion',
    logoSeed: 'NT',
    location: 'Remote (APAC/Europe)',
    type: 'Full-time',
    mode: 'Remote',
    salary: '$70,000 - $95,000 / yr',
    experience: 'Entry-level',
    skills: ['Copywriting', 'SEO', 'Notion Workspace', 'Community Building'],
    description: 'We want a creative Growth Marketer who can build templates, write highly engaging product stories, and help our community leverage Notion for productivity and workspace design.',
    requirements: [
      'Excellent writing and editing skills with a punchy, clear style.',
      'Advanced knowledge of Notion setup (databases, relations, formulas).',
      '1+ years of writing newsletter or tech content.',
      'Self-driven and comfortable working in an asynchronous remote team.'
    ],
    benefits: [
      'Work from anywhere.',
      'Co-working space membership paid.',
      'Free books stipend.',
      'Notion Premium for you and all your friends.'
    ],
    postedDate: '3 days ago',
    recruiterId: 'user-recruiter-1'
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
        name: 'Alex Mercer',
        phone: '+1 (555) 321-7654',
        bio: 'Product-focused frontend engineer. Love writing clean React code, crafting custom CSS styles, and designing beautiful micro-interactions.',
        skills: ['React', 'TypeScript', 'CSS/CSS Grid', 'Framer Motion', 'Figma'],
        experience: 'Mid-level',
        resumeName: 'Alex_Mercer_CV.pdf',
        onboardingCompleted: true,
        preferences: {
          type: ['Full-time'],
          mode: ['Remote', 'Hybrid'],
          minSalary: 80000,
          experience: 'Mid-level'
        }
      },
      {
        id: 'user-recruiter-1',
        email: 'sarah@vercel.com',
        passwordHash,
        role: 'recruiter',
        name: 'Sarah Jenkins',
        phone: '+1 (555) 987-6543',
        bio: 'Lead Recruiter at Vercel. We are always looking for rockstar developers and designers.',
        companyName: 'Vercel',
        companyBio: 'We build the frontend cloud. Empowering creators to ship clean websites instantly.'
      }
    ];

    const initialApplications = [
      {
        id: 'app-1',
        jobId: 'job-1',
        candidateId: 'user-candidate-1',
        appliedDate: '1 day ago',
        status: 'Interview'
      }
    ];

    const initialMessages = [
      {
        id: 'msg-1',
        applicationId: 'app-1',
        sender: 'candidate',
        text: 'Hi Sarah! I applied for the Frontend Engineer position. Super excited about Vercel.',
        timestamp: '1 day ago'
      },
      {
        id: 'msg-2',
        applicationId: 'app-1',
        sender: 'recruiter',
        text: 'Hi Alex! Your portfolio looks fantastic. We would love to hop on a call to talk about your Next.js experience next Tuesday.',
        timestamp: '18 hours ago'
      },
      {
        id: 'msg-3',
        applicationId: 'app-1',
        sender: 'candidate',
        text: 'That sounds perfect. Let me know the calendar link!',
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
