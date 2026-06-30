import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Storage } from '@google-cloud/storage';

dotenv.config();

const DB_FILE = path.join(process.cwd(), 'db.json');

// Initialize Google Cloud Storage if config is provided
const bucketName = process.env.GCS_BUCKET_NAME;
const projectId = process.env.GCS_PROJECT_ID;
const keyFilePath = process.env.GCS_KEY_FILE_PATH;
const credentialsJson = process.env.GCS_CREDENTIALS_JSON;

let storage;
let bucket;

if (bucketName) {
  try {
    const storageOptions = { projectId };
    if (keyFilePath) {
      storageOptions.keyFilename = keyFilePath;
    } else if (credentialsJson) {
      storageOptions.credentials = JSON.parse(credentialsJson);
    }
    storage = new Storage(storageOptions);
    bucket = storage.bucket(bucketName);
    console.log(`[GCS Sync] Configured for bucket: ${bucketName}`);
  } catch (err) {
    console.error('[GCS Sync] Initialization error:', err.message);
  }
} else {
  console.log('[GCS Sync] GCS_BUCKET_NAME not set. Falling back to local db.json file.');
}

const downloadDbFromGCS = async () => {
  if (!bucket) return false;
  try {
    const file = bucket.file('db.json');
    const [exists] = await file.exists();
    if (exists) {
      console.log('[GCS Sync] Downloading latest db.json from GCS...');
      await file.download({ destination: DB_FILE });
      console.log('[GCS Sync] Successfully synchronized database from Google Cloud Storage.');
      return true;
    } else {
      console.log('[GCS Sync] db.json does not exist in GCS bucket yet.');
    }
  } catch (err) {
    console.error('[GCS Sync] Failed to download from GCS:', err.message);
  }
  return false;
};

let gcsSyncCompleted = false;
let gcsSyncPromise = null;

export const syncFromGCS = async () => {
  if (gcsSyncCompleted) return;
  if (!gcsSyncPromise) {
    gcsSyncPromise = (async () => {
      const downloaded = await downloadDbFromGCS();
      gcsSyncCompleted = true;
      if (downloaded) {
        console.log('[GCS Sync] Startup GCS sync finished.');
      } else {
        initDb();
      }
    })();
  }
  return gcsSyncPromise;
};

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
    recruiterId: 'user-admin-raj',
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
    recruiterId: 'user-admin-raj',
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
    recruiterId: 'user-admin-raj',
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
    recruiterId: 'user-admin-raj',
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
    recruiterId: 'user-admin-raj',
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
    recruiterId: 'user-admin-raj',
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
    recruiterId: 'user-admin-raj',
    fairWorkPact: true
  },
  {
    id: 'job-8',
    title: 'Assistant Professor, Computer Science',
    companyName: 'Guru Kashi University',
    logoSeed: 'GK',
    location: 'Talwandi Sabo, Bathinda',
    type: 'Full-time',
    mode: 'On-site',
    salary: '₹45,000 - ₹60,000 / mo',
    experience: 'Mid-level',
    skills: ['Teaching', 'Computer Science', 'Python', 'Machine Learning', 'Academic Research'],
    description: 'Guru Kashi University is hiring an Assistant Professor in the Department of Computer Science & Engineering. You will conduct lectures for B.Tech/M.Tech students, supervise lab coursework, design syllabi, and participate in academic research.',
    requirements: [
      'M.Tech or Ph.D. in Computer Science and Engineering.',
      'Strong understanding of algorithms, data structures, and system architectures.',
      'Prior teaching or industry experience is preferred.'
    ],
    benefits: [
      'On-campus accommodation support.',
      'Research funding and travel allowance for conferences.',
      'Standard university health benefits.',
      'Paid summer and winter vacations.'
    ],
    postedDate: 'Just now',
    recruiterId: 'user-admin-raj',
    fairWorkPact: true
  },
  {
    id: 'job-9',
    title: 'Branch Sales Manager',
    companyName: 'Asian Paints',
    logoSeed: 'AP',
    location: 'Bathinda, Punjab',
    type: 'Full-time',
    mode: 'On-site',
    salary: '₹35,000 - ₹50,000 / mo',
    experience: 'Mid-level',
    skills: ['B2B Sales', 'Channel Management', 'Client Relationships', 'Lead Generation'],
    description: 'Asian Paints is seeking a Branch Sales Manager to drive commercial relationships, oversee dealer networks, execute paint contractor loyalty campaigns, and expand our market presence in the Malwa region.',
    requirements: [
      'MBA or Graduate degree in Marketing/Business.',
      '2+ years of sales experience in paints, building materials, or FMCG.',
      'Comfortable traveling across Bathinda and nearby Malwa territories.',
      'Fluent in Punjabi and Hindi.'
    ],
    benefits: [
      'Attractive performance-based sales incentives.',
      'Travel allowance and fuel reimbursement.',
      'Comprehensive corporate medical coverage.',
      'Annual performance bonuses.'
    ],
    postedDate: '2 days ago',
    recruiterId: 'user-admin-raj',
    fairWorkPact: true
  },
  {
    id: 'job-10',
    title: 'Sales Consultant',
    companyName: 'Singhal Autohaus (Jawa Yezdi Motorcycles)',
    logoSeed: 'JY',
    location: 'Ganesha Nagar, Bathinda',
    type: 'Full-time',
    mode: 'On-site',
    salary: '₹15,000 - ₹20,000 / mo',
    experience: 'Entry-level',
    skills: ['Customer Relationship Management', 'Showroom Operations', 'Product Promotion', 'Automotive Sales'],
    description: 'Singhal Autohaus, the authorized showroom for Jawa Yezdi Motorcycles in Bathinda, is hiring a Sales Consultant. You will welcome walk-in customers, showcase motorcycle features, schedule test rides, and facilitate financing options.',
    requirements: [
      'Graduate or equivalent qualification.',
      'Passionate about motorcycles and automotive retail.',
      'Fluency in Punjabi and Hindi is required.',
      'Prior showroom or direct customer handling experience is preferred.'
    ],
    benefits: [
      'Attractive performance incentives per vehicle sold.',
      'Regular product training from national experts.',
      'Standard festival bonuses.',
      'Employee discounts on motorcycle service and parts.'
    ],
    postedDate: '1 day ago',
    recruiterId: 'user-admin-raj',
    fairWorkPact: true
  },
  {
    id: 'job-11',
    title: 'Medical Receptionist & GDA',
    companyName: 'Sukhmani Diagnocare',
    logoSeed: 'SD',
    location: 'Bathinda, Punjab',
    type: 'Full-time',
    mode: 'On-site',
    salary: '₹12,000 - ₹16,000 / mo',
    experience: 'Entry-level',
    skills: ['Hospital Reception', 'Customer Service', 'Medical Records', 'Basic Excel'],
    description: 'Sukhmani Diagnocare is seeking a General Duty Assistant / Medical Receptionist. Responsibilities include welcoming patients, managing diagnostic test registrations, issuing billing receipts, and answering patient phone queries.',
    requirements: [
      '12th pass or Graduate with basic computer literacy.',
      'Polite communication and empathy towards patients.',
      'Fluent in Punjabi and Hindi.',
      'Previous experience in a hospital or diagnostic lab is a plus.'
    ],
    benefits: [
      'Free annual health check-up benefits for family members.',
      'Standard overtime compensation package.',
      'Merit-based annual salary increments.',
      'Safe and sanitized work environment.'
    ],
    postedDate: '3 days ago',
    recruiterId: 'user-admin-raj',
    fairWorkPact: true
  },
  {
    id: 'job-12',
    title: 'Front Desk Executive cum Telecaller',
    companyName: 'Mittal Job Consultancy',
    logoSeed: 'MC',
    location: 'Ajit Road, Bathinda',
    type: 'Full-time',
    mode: 'On-site',
    salary: '₹10,000 - ₹14,000 / mo',
    experience: 'Entry-level',
    skills: ['Telecalling', 'Front Office', 'Customer Support', 'Data Entry'],
    description: 'Mittal Job Consultancy is seeking a Front Desk Executive cum Telecaller. You will manage incoming inquiries from job aspirants, maintain database records of candidates, and schedule interview lineups for local companies.',
    requirements: [
      'Good communication skills in Punjabi and Hindi.',
      'Basic knowledge of MS Office (Word/Excel).',
      'Pleasant phone manner and phone etiquette.',
      'Willingness to handle high volumes of calls.'
    ],
    benefits: [
      'Performance incentives based on candidate joining targets.',
      'Paid sick leave allowances.',
      'Casual, supportive team workspace.',
      'Annual salary reviews.'
    ],
    postedDate: 'Just now',
    recruiterId: 'user-admin-raj',
    fairWorkPact: true
  },
  {
    id: 'job-bathinda-1',
    title: 'Sales Officer',
    companyName: 'HDFC Bank Bathinda Branch',
    logoSeed: 'HB',
    location: 'Bathinda, Punjab',
    type: 'Full-time',
    mode: 'On-site',
    salary: '₹22,000 - ₹30,000 / mo',
    experience: 'Entry-level',
    skills: ["Customer Relations","Communication","Financial Products","Sales Pitching"],
    description: "HDFC Bank is hiring a Sales Officer for our local Bathinda branch. You will be responsible for acquiring new customers, promoting financial services (accounts, loans, insurance), and maintaining healthy client relations.",
    requirements: ["Any graduate degree (B.Com, BBA preferred).","Good communication skills in Punjabi, Hindi, and basic English.","Own two-wheeler with a valid driving license.","Prior sales experience is a plus but freshers are welcome."],
    benefits: ["Travel allowance (petrol reimbursement).","Performance incentives and monthly bonuses.","Health insurance coverage.","Clear career progression pathway inside the bank."],
    postedDate: 'Just now',
    recruiterId: 'user-admin-raj',
    fairWorkPact: true
  },
  {
    id: 'job-bathinda-2',
    title: 'Academic Counselor',
    companyName: 'Golden Horizon IELTS Institute',
    logoSeed: 'GH',
    location: 'Ajit Road, Bathinda',
    type: 'Full-time',
    mode: 'On-site',
    salary: '₹18,000 - ₹25,000 / mo',
    experience: 'Entry-level',
    skills: ["Counseling","IELTS awareness","English proficiency","Public Speaking"],
    description: "We are seeking a friendly Academic Counselor for our premier IELTS and study-visa coaching center on Ajit Road. You will guide students on study options abroad, explain IELTS course structures, and handle walk-in inquiries.",
    requirements: ["Graduation in any stream.","Excellent conversational skills in English and Punjabi.","Basic understanding of study visa documentation is preferred.","Comfortable working with Microsoft Excel and Google Sheets."],
    benefits: ["Monthly conversion incentives.","Paid sick leaves and casual leaves.","Professional work environment."],
    postedDate: 'Just now',
    recruiterId: 'user-admin-raj',
    fairWorkPact: true
  },
  {
    id: 'job-bathinda-3',
    title: 'Billing Executive',
    companyName: 'Easyday Club Bathinda',
    logoSeed: 'ED',
    location: 'Bathinda, Punjab',
    type: 'Full-time',
    mode: 'On-site',
    salary: '₹12,000 - ₹16,000 / mo',
    experience: 'Entry-level',
    skills: ["POS Systems","Cash Handling","Basic Math","Customer Service"],
    description: "Easyday Club is hiring Billing Executives to manage daily billing operations, scan grocery items, collect cash or digital payments, and assist customers during checkouts.",
    requirements: ["12th pass (Higher Secondary) or equivalent.","Quick mental math skills and computer literacy.","Willingness to work in shifts (morning/evening).","Honest and punctual."],
    benefits: ["Overtime pay.","Store employee discounts.","Provident Fund (PF) options."],
    postedDate: 'Just now',
    recruiterId: 'user-admin-raj',
    fairWorkPact: true
  },
  {
    id: 'job-bathinda-4',
    title: 'High School English Teacher',
    companyName: 'Silver Oaks School',
    logoSeed: 'SO',
    location: 'Bathinda, Punjab',
    type: 'Full-time',
    mode: 'On-site',
    salary: '₹25,000 - ₹35,000 / mo',
    experience: 'Mid-level',
    skills: ["Curriculum Planning","Classroom Management","English Literature","Creative Writing"],
    description: "Silver Oaks School is looking for an experienced High School English Teacher. The ideal candidate will develop lesson plans, teach English literature and grammar to CBSE classes 9 to 12, and lead extracurricular debate clubs.",
    requirements: ["M.A. in English and B.Ed. degree (Mandatory).","Minimum 2 years of teaching experience in a CBSE affiliated school.","Fluency in spoken and written English."],
    benefits: ["Provident Fund (PF) and Gratuity.","Free transport facility for staff.","Subsidized education for employee children."],
    postedDate: 'Just now',
    recruiterId: 'user-admin-raj',
    fairWorkPact: true
  },
  {
    id: 'job-bathinda-5',
    title: 'Technical Support Executive',
    companyName: 'Malwa IT Solutions',
    logoSeed: 'MI',
    location: 'Bathinda, Punjab',
    type: 'Full-time',
    mode: 'Hybrid',
    salary: '₹15,000 - ₹22,000 / mo',
    experience: 'Entry-level',
    skills: ["Networking basics","Operating Systems","Troubleshooting","Customer Queries"],
    description: "Join our remote support desk at Malwa IT Solutions. You will assist corporate clients in resolving internet connectivity issues, email setups, software installations, and hardware diagnostics via call and chat.",
    requirements: ["B.Tech (CSE/IT), BCA, or Diploma in Hardware & Networking.","Good command over English (both written and verbal).","Familiarity with Remote Desktop tools (AnyDesk, TeamViewer).","Stable home internet connection (broadband)."],
    benefits: ["Work from Home flexibility (Hybrid structure).","Broadband internet reimbursement.","Night shift allowances."],
    postedDate: 'Just now',
    recruiterId: 'user-admin-raj',
    fairWorkPact: true
  },
  {
    id: 'job-bathinda-6',
    title: 'Staff Nurse',
    companyName: 'Max Super Speciality Hospital',
    logoSeed: 'MX',
    location: 'Bathinda, Punjab',
    type: 'Full-time',
    mode: 'On-site',
    salary: '₹28,000 - ₹38,000 / mo',
    experience: 'Mid-level',
    skills: ["Patient Care","ICU Operations","Emergency Meds","Vital Monitoring"],
    description: "Max Hospital Bathinda is hiring Staff Nurses for Critical Care Units (ICU) and Emergency wards. You will monitor vitals, administer medications as directed by doctors, maintain patient logs, and assist in clinical operations.",
    requirements: ["B.Sc Nursing or GNM (General Nursing and Midwifery).","Valid registration with the Punjab Nurses Registration Council (PNRC).","Minimum 1 year of clinical experience in a multi-speciality hospital."],
    benefits: ["Free duty meals.","Health insurance for family.","Hostel accommodation support if required."],
    postedDate: 'Just now',
    recruiterId: 'user-admin-raj',
    fairWorkPact: true
  },
  {
    id: 'job-bathinda-7',
    title: 'Delivery Executive',
    companyName: 'Zomato Bathinda Office',
    logoSeed: 'ZO',
    location: 'Bathinda, Punjab',
    type: 'Part-time',
    mode: 'On-site',
    salary: '₹15,000 - ₹25,000 / mo',
    experience: 'Entry-level',
    skills: ["Map Navigation","Safe Driving","Punctuality","Mobile Apps"],
    description: "Earn flexible income by joining the Zomato delivery network in Bathinda. Deliver food orders from local restaurants to customers. Choose your own shifts (full-time, part-time, or weekend peak hours).",
    requirements: ["Own smartphone (Android or iOS) with active internet.","Own motorcycle/scooter with RC and Insurance.","Valid Driving License and Aadhaar Card."],
    benefits: ["Instant daily payouts.","Accidental insurance coverage of ₹10 Lakhs.","Attractive rain and festival bonuses."],
    postedDate: 'Just now',
    recruiterId: 'user-admin-raj',
    fairWorkPact: true
  },
  {
    id: 'job-bathinda-8',
    title: 'Site Engineer (Civil)',
    companyName: 'HMEL Bathinda Refinery Project',
    logoSeed: 'HM',
    location: 'Raman Mandi, Bathinda',
    type: 'Full-time',
    mode: 'On-site',
    salary: '₹35,000 - ₹45,000 / mo',
    experience: 'Mid-level',
    skills: ["Site Supervision","Concrete Testing","AutoCAD","Safety Norms"],
    description: "We are seeking a Site Engineer to oversee sub-contracted civil work at the HMEL Bathinda Refinery expansion project. Duties include inspecting materials, checking column layouts, managing labor teams, and reporting daily progress.",
    requirements: ["B.Tech / B.E. in Civil Engineering.","2+ years of experience in industrial site construction.","Ability to read structural blueprints and draft reports in AutoCAD."],
    benefits: ["Company transport from Bathinda city to Refinery site.","Free site accommodation and meals.","Personal Protective Equipment (PPE) provided."],
    postedDate: 'Just now',
    recruiterId: 'user-admin-raj',
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
        subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
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
      },
      {
        id: 'user-admin-raj',
        email: 'raj_athwal',
        passwordHash: bcrypt.hashSync('3697', salt),
        role: 'recruiter',
        name: 'Raj Athwal'
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
        recruiterSignature: 'Raj Athwal',
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
      messages: initialMessages,
      payments: []
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
  if (bucket) {
    bucket.upload(DB_FILE, {
      destination: 'db.json',
      metadata: {
        cacheControl: 'no-cache',
      }
    }).then(() => {
      console.log('[GCS Sync] Successfully backed up database (db.json) to Google Cloud Storage.');
    }).catch(err => {
      console.error('[GCS Sync] Failed to upload database backup to GCS:', err.message);
    });
  }
};
