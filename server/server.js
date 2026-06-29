import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import * as cheerio from 'cheerio';
import { initDb, readData, writeData } from './db.js';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'hyriq_super_secret_vibe_key_123';

// Razorpay Payment Gateway
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
console.log('Razorpay Key ID loaded:', razorpayKeyId ? razorpayKeyId.substring(0, 12) + '...' : 'MISSING');
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
} catch (e) {
  console.warn('Razorpay initialization skipped (missing keys). Payment features will not work.');
}

app.use(cors());
app.use(express.json());

// Initialize database
initDb();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '../dist')));

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// --- AUTHENTICATION ROUTES ---

// Get promo slots status
app.get('/api/promo/slots', (req, res) => {
  const db = readData();
  const total = db.users.length;
  res.json({
    totalUsers: total,
    slotsLeft: Math.max(0, 2 - total),
    isFree: total < 2
  });
});

// Cache maps for government jobs
const govtJobsCache = new Map();
const govtJobsCacheTime = new Map();

// Get Punjab Government Jobs live scraping endpoint
app.get('/api/govt-jobs', async (req, res) => {
  const { category, state } = req.query;
  const cacheKey = `${category || 'all'}_${state || 'all'}`;
  
  const now = Date.now();
  const cachedTime = govtJobsCacheTime.get(cacheKey) || 0;
  if (govtJobsCache.has(cacheKey) && (now - cachedTime < 60 * 60 * 1000)) {
    return res.json(govtJobsCache.get(cacheKey));
  }

  // Determine target URL
  let targetUrl = 'https://www.freejobalert.com/government-jobs/'; // default all india
  
  if (state && state !== 'all') {
    const stateMap = {
      'ap': 'andhra-pradesh',
      'as': 'assam',
      'br': 'bihar',
      'cg': 'chhattisgarh',
      'dl': 'delhi',
      'gj': 'gujarat',
      'hp': 'himachal-pradesh',
      'hr': 'haryana',
      'jh': 'jharkhand',
      'ka': 'karnataka',
      'kl': 'kerala',
      'mh': 'maharashtra',
      'mp': 'madhya-pradesh',
      'od': 'odisha',
      'pb': 'punjab',
      'rj': 'rajasthan',
      'tn': 'tamil-nadu',
      'ts': 'telangana',
      'uk': 'uttarakhand',
      'up': 'uttar-pradesh',
      'wb': 'west-bengal'
    };
    const stateName = stateMap[state.toLowerCase()] || state.toLowerCase();
    targetUrl = `https://www.freejobalert.com/${stateName}-government-jobs/`;
  } else if (category && category !== 'all') {
    const categoryMap = {
      'bank': 'bank-jobs',
      'teaching': 'teaching-jobs',
      'engineering': 'engineering-jobs',
      'railway': 'railway-jobs',
      'defence': 'defence-jobs'
    };
    const categoryPath = categoryMap[category.toLowerCase()] || 'government-jobs';
    targetUrl = `https://www.freejobalert.com/${categoryPath}/`;
  }

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`Failed to fetch FreeJobAlert page: ${targetUrl}`);
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const jobs = [];
    
    $('table').each((i, table) => {
      const headerRow = $(table).find('tr').first();
      const headers = headerRow.find('th, td').map((idx, el) => $(el).text().trim()).get();
      
      if (headers.includes('Post Date') && headers.includes('Recruitment Board')) {
        $(table).find('tr').each((rowIdx, row) => {
          if (rowIdx === 0) return; // skip header row
          
          const cols = $(row).find('td');
          if (cols.length >= 6) {
            const postDate = $(cols[0]).text().trim();
            const recruitmentBoard = $(cols[1]).text().trim();
            const title = $(cols[2]).text().trim().replace(/\uFFFD/g, '-').replace(/\?/g, '-');
            const qualification = $(cols[3]).text().trim().replace(/\uFFFD/g, '-').replace(/\?/g, '-');
            const advtNo = $(cols[4]).text().trim().replace(/\uFFFD/g, '-').replace(/\?/g, '-');
            const lastDate = $(cols[5]).text().trim();
            
            const applyLink = $(cols[6]).find('a').attr('href') || $(cols[2]).find('a').attr('href') || targetUrl;
            
            jobs.push({
              id: `govt-${cacheKey}-${i}-${rowIdx}-${Date.now()}`,
              postDate,
              recruitmentBoard,
              title,
              qualification,
              advtNo,
              lastDate,
              applyLink
            });
          }
        });
      }
    });

    if (jobs.length === 0) {
      throw new Error('No jobs matched standard table layout');
    }

    govtJobsCache.set(cacheKey, jobs);
    govtJobsCacheTime.set(cacheKey, now);
    res.json(jobs);
  } catch (err) {
    console.error(`Govt jobs scraping failed for ${targetUrl}:`, err);
    if (govtJobsCache.has(cacheKey)) {
      return res.json(govtJobsCache.get(cacheKey));
    }
    res.status(500).json({ error: 'Failed to retrieve government jobs. Please try again later.' });
  }
});

// Get detailed page of a specific government job notification
app.get('/api/govt-jobs/details', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required.' });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch detailed job page');
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const htmlBlocks = [];
    $('.scrollable-table').each((i, el) => {
      // Make all links absolute and target="_blank"
      $(el).find('a').each((idx, a) => {
        let href = $(a).attr('href');
        if (href && href.startsWith('/')) {
          href = 'https://www.freejobalert.com' + href;
        }
        $(a).attr('href', href);
        $(a).attr('target', '_blank');
        $(a).attr('rel', 'noopener noreferrer');
      });
      
      // Clean HTML contents
      const tableHtml = $(el).html();
      if (tableHtml) {
        htmlBlocks.push(`<table class="scrollable-table" style="width: 100%; border-collapse: collapse; border: 1px solid rgba(26, 62, 98, 0.1); margin-bottom: 16px; font-size: 14px;">${tableHtml}</table>`);
      }
    });

    if (htmlBlocks.length === 0) {
      throw new Error('No detailed info tables matched (.scrollable-table)');
    }

    res.json({ html: htmlBlocks.join('\n') });
  } catch (err) {
    console.error('Govt job details scraping failed:', err);
    res.status(500).json({ error: 'Failed to retrieve detailed information for this job. Please try again later.' });
  }
});

// --- PAYMENT ROUTES ---

// Debug: Razorpay status
app.get('/api/payments/status', (req, res) => {
  res.json({
    razorpayInitialized: !!razorpay,
    keyIdLoaded: !!razorpayKeyId && razorpayKeyId !== 'rzp_test_placeholder',
    keyIdPrefix: razorpayKeyId ? razorpayKeyId.substring(0, 8) : 'NONE',
  });
});

// Create Razorpay order for candidate registration
app.post('/api/payments/create-order', async (req, res) => {
  console.log('create-order called, razorpay exists:', !!razorpay);
  if (!razorpay) {
    return res.status(503).json({ error: 'Payment gateway not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.' });
  }
  try {
    const options = {
      amount: 9900, // ₹99 in paise
      currency: 'INR',
      receipt: `hyriq_reg_${Date.now()}`,
      notes: {
        purpose: 'Candidate Registration',
        validity: '1 year'
      }
    };
    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId
    });
  } catch (err) {
    console.error('Razorpay order creation failed:', err);
    res.status(500).json({ 
      error: 'Failed to create payment order. Please try again.',
      details: err.message || err
    });
  }
});

// Verify Razorpay payment signature
app.post('/api/payments/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment verification details.' });
  }

  // Verify HMAC signature
  const generatedSignature = crypto
    .createHmac('sha256', razorpayKeySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
  }

  // Store payment record
  const db = readData();
  const paymentRecord = {
    id: `pay-${Date.now()}`,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    amount: 9900,
    currency: 'INR',
    status: 'verified',
    createdAt: new Date().toISOString()
  };

  if (!db.payments) db.payments = [];
  db.payments.push(paymentRecord);
  writeData(db);

  res.json({
    verified: true,
    paymentId: razorpay_payment_id
  });
});

// Get Razorpay key ID for frontend
app.get('/api/payments/key', (req, res) => {
  res.json({ keyId: razorpayKeyId });
});

// Validate coupon code for free registration
app.post('/api/coupons/validate', (req, res) => {
  const { couponCode } = req.body;
  if (!couponCode) {
    return res.status(400).json({ error: 'Coupon code is required' });
  }

  const code = couponCode.toUpperCase();
  const VALID_COUPONS = ['FREE100', 'HYRIQ100', 'FIRST100'];
  if (!VALID_COUPONS.includes(code)) {
    return res.status(400).json({ error: 'Invalid coupon code' });
  }

  const db = readData();
  const uses = db.users.filter(u => u.usedCouponCode === code).length;
  const remaining = Math.max(0, 100 - uses);

  if (remaining <= 0) {
    return res.status(400).json({ error: 'This coupon code has already been used 100 times.' });
  }

  res.json({
    valid: true,
    code,
    remaining,
    message: `Coupon code applied! ${remaining} of 100 free slots remaining.`
  });
});

// --- AUTHENTICATION ROUTES ---

// Sign Up
app.post('/api/auth/signup', (req, res) => {
  const { email, username, password, role, name, phone, bio, paymentId, couponCode } = req.body;
  if (!email || !password || !role || !name) {
    return res.status(400).json({ error: 'Email, password, role, and name are required' });
  }

  const db = readData();
  const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return res.status(400).json({ error: 'Email already registered' });

  if (username) {
    const existsUsername = db.users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase());
    if (existsUsername) return res.status(400).json({ error: 'Username already taken' });
  }

  // Role-based pricing: Recruiters are FREE, Candidates pay ₹99 or use a free coupon code
  let couponApplied = false;
  if (role === 'candidate') {
    if (couponCode) {
      const code = couponCode.toUpperCase();
      const VALID_COUPONS = ['FREE100', 'HYRIQ100', 'FIRST100'];
      
      if (VALID_COUPONS.includes(code)) {
        const uses = db.users.filter(u => u.usedCouponCode === code).length;
        if (uses < 100) {
          couponApplied = true;
        } else {
          return res.status(400).json({ error: 'Coupon code limit reached. Only 100 free slots were available.' });
        }
      } else {
        return res.status(400).json({ error: 'Invalid coupon code.' });
      }
    }

    if (!couponApplied) {
      if (!paymentId) {
        return res.status(402).json({
          error: 'Registration fee required for job seekers.',
          requiresPayment: true,
          amount: 99,
          message: 'A one-time registration fee of ₹99 is required for job seekers. Valid for 1 year.'
        });
      }

      // Verify payment exists in our records
      if (!db.payments) db.payments = [];
      const payment = db.payments.find(p => p.razorpayPaymentId === paymentId && p.status === 'verified');
      if (!payment) {
        return res.status(402).json({
          error: 'Payment verification failed. Please complete the payment first.',
          requiresPayment: true,
          amount: 99
        });
      }

      // Mark payment as used
      payment.status = 'used';
      payment.usedByEmail = email;
    }
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const userId = `user-${Date.now()}`;

  const subscriptionExpiry = role === 'candidate'
    ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  const newUser = {
    id: userId,
    email: email.toLowerCase(),
    username: username ? username.toLowerCase() : undefined,
    passwordHash,
    role,
    name,
    phone: phone || '',
    bio: bio || '',
    skills: role === 'candidate' ? [] : undefined,
    experience: role === 'candidate' ? 'Entry-level' : undefined,
    resumeName: role === 'candidate' ? 'No resume uploaded' : undefined,
    onboardingCompleted: role === 'candidate' ? false : undefined,
    subscriptionExpiry,
    usedCouponCode: couponApplied ? couponCode.toUpperCase() : undefined,
    preferences: role === 'candidate' ? { type: [], mode: [], minSalary: 0, experience: 'Entry-level' } : undefined,
    companyName: role === 'recruiter' ? `${name}'s Organization` : undefined,
    companyBio: role === 'recruiter' ? 'We are hiring progressive talent.' : undefined
  };

  db.users.push(newUser);
  writeData(db);

  // Generate Token
  const token = jwt.sign({ id: userId, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    token,
    user: { id: userId, email: newUser.email, role: newUser.role, name: newUser.name, subscriptionExpiry }
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = readData();
  const user = db.users.find(u => 
    u.email.toLowerCase() === email.toLowerCase() || 
    (u.username && u.username.toLowerCase() === email.toLowerCase())
  );
  if (!user) return res.status(400).json({ error: 'Invalid email or password' });

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role, name: user.name }
  });
});

// Get Current User Profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const db = readData();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { passwordHash, ...userProfile } = user;
  res.json(userProfile);
});

// Update Profile details
app.put('/api/auth/profile', authenticateToken, (req, res) => {
  const db = readData();
  const index = db.users.findIndex(u => u.id === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });

  const currentProfile = db.users[index];
  const updates = req.body;

  // Prevent modifying critical fields directly
  delete updates.id;
  delete updates.email;
  delete updates.passwordHash;
  delete updates.role;

  db.users[index] = {
    ...currentProfile,
    ...updates
  };

  writeData(db);
  const { passwordHash, ...profileWithoutHash } = db.users[index];
  res.json(profileWithoutHash);
});


// Auto-import jobs for location from external ATS sources
app.post('/api/jobs/auto-import', async (req, res) => {
  const { location } = req.body;
  if (!location) {
    return res.status(400).json({ error: 'Location is required' });
  }

  try {
    const db = readData();
    if (!db.jobs) db.jobs = [];

    // Check how many jobs already exist for this location query (case insensitive)
    const existingCount = db.jobs.filter(j => 
      j.location.toLowerCase().includes(location.toLowerCase())
    ).length;

    // If we already have 6+ jobs, don't flood the DB, just return existing
    if (existingCount >= 6) {
      return res.json({ 
        message: 'Jobs already imported', 
        count: existingCount, 
        jobs: db.jobs.filter(j => j.location.toLowerCase().includes(location.toLowerCase())) 
      });
    }

    // Fetch from Arbeitnow (public API, no keys)
    const apiRes = await fetch('https://www.arbeitnow.com/api/job-board-api');
    if (!apiRes.ok) {
      return res.status(502).json({ error: 'Failed to fetch external jobs feed' });
    }

    const data = await apiRes.json();
    const rawJobs = data.data || [];

    // Limit to 8 newly imported jobs to keep it clean and performant
    const jobsToImport = rawJobs.slice(0, 8);
    const newJobs = [];

    jobsToImport.forEach((job, index) => {
      let cleanTitle = job.title;
      if (cleanTitle.includes(' - ')) {
        cleanTitle = cleanTitle.split(' - ')[0];
      }
      if (cleanTitle.includes(' | ')) {
        cleanTitle = cleanTitle.split(' | ')[0];
      }

      // Convert HTML description to text excerpts
      let cleanDesc = job.description ? job.description.replace(/<[^>]*>/g, '') : '';
      if (cleanDesc.length > 300) {
        cleanDesc = cleanDesc.substring(0, 300) + '...';
      }

      const salaryRange = [
        '₹6,00,000 - ₹9,50,000 / year',
        '₹8,50,000 - ₹12,00,000 / year',
        '₹11,00,000 - ₹16,00,000 / year',
        '₹14,00,000 - ₹20,00,000 / year'
      ][index % 4];

      const experienceLevel = [
        'Entry-level',
        'Mid-level',
        'Mid-level',
        'Senior-level'
      ][index % 4];

      // Add a randomized emoji for the logoSeed to match the visual vibe
      const logoEmoji = ['🚀', '💻', '💡', '🔥', '🛡️', '⚡', '🤖', '👾'][index % 8];

      const newJob = {
        id: `job-imported-${Date.now()}-${index}`,
        title: cleanTitle,
        companyName: job.company_name,
        logoSeed: logoEmoji,
        location: `${location}, India`,
        type: 'Full-time',
        mode: job.remote ? 'Remote' : (index % 2 === 0 ? 'Hybrid' : 'On-site'),
        salary: salaryRange,
        experience: experienceLevel,
        skills: job.tags && job.tags.length > 0 ? job.tags.slice(0, 4) : ['Engineering', 'Software', 'Product'],
        description: cleanDesc || 'Join us to build state of the art web interfaces and backend microservices.',
        requirements: [
          'Strong proficiency in HTML, CSS, JavaScript/TypeScript',
          'Prior professional experience with modern web architectures',
          'Excellent collaborative and communication skills',
          'Adherence to the Hyriq Fair Work Pact commitments'
        ],
        benefits: [
          'Flexible working hours & hybrid options',
          'Full medical insurance and wellness cover',
          'Annual learning budget and certification support'
        ],
        postedDate: new Date().toISOString(),
        recruiterId: 'recruiter-imported',
        fairWorkPact: true,
        chatLiveHours: '10:00 AM - 6:00 PM'
      };

      newJobs.push(newJob);
      db.jobs.push(newJob);
    });

    writeData(db);
    res.json({ message: 'Success', count: newJobs.length, jobs: newJobs });
  } catch (err) {
    console.error('Error auto-importing jobs:', err);
    res.status(500).json({ error: 'Failed to import external jobs' });
  }
});

// --- JOBS ROUTES ---

// List all jobs
app.get('/api/jobs', (req, res) => {
  const db = readData();
  res.json(db.jobs);
});

// Post a new job
app.post('/api/jobs', authenticateToken, (req, res) => {
  if (req.user.role !== 'recruiter') {
    return res.status(403).json({ error: 'Only recruiters can post jobs' });
  }

  const { title, companyName, location, type, mode, salary, experience, skills, description, requirements, benefits, fairWorkPact, chatLiveHours } = req.body;
  if (!title || !salary || !description) {
    return res.status(400).json({ error: 'Job title, salary, and description are required' });
  }
  if (!fairWorkPact) {
    return res.status(400).json({ error: 'Upholding the Hyriq Fair Work Pact is mandatory to post jobs' });
  }

  const db = readData();
  const initials = companyName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const newJob = {
    id: `job-${Date.now()}`,
    title,
    companyName: companyName || 'Company',
    logoSeed: initials || 'HQ',
    location: location || 'Remote',
    type,
    mode,
    salary,
    experience,
    skills: skills || [],
    description,
    requirements: requirements || [],
    benefits: benefits || [],
    postedDate: 'Just now',
    recruiterId: req.user.id,
    fairWorkPact: true,
    chatLiveHours: chatLiveHours || 'Not Scheduled'
  };

  db.jobs.unshift(newJob);
  writeData(db);

  res.status(201).json(newJob);
});

// Delete a job listing
app.delete('/api/jobs/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'recruiter') {
    return res.status(403).json({ error: 'Only recruiters can delete jobs' });
  }

  const db = readData();
  const jobIndex = db.jobs.findIndex(j => j.id === req.params.id);

  if (jobIndex === -1) return res.status(404).json({ error: 'Job not found' });
  
  const job = db.jobs[jobIndex];
  if (job.recruiterId !== req.user.id) {
    return res.status(403).json({ error: 'You do not own this job listing' });
  }

  db.jobs.splice(jobIndex, 1);
  // Remove applications for this job too
  db.applications = db.applications.filter(app => app.jobId !== req.params.id);

  writeData(db);
  res.json({ message: 'Job deleted successfully' });
});


// --- APPLICATIONS ROUTES ---

// Get Applications
app.get('/api/applications', authenticateToken, (req, res) => {
  const db = readData();

  if (req.user.role === 'candidate') {
    // Return all applications for this specific candidate
    const candidateApps = db.applications.filter(app => app.candidateId === req.user.id);
    
    // Attach chatHistory by matching application messages
    const appsWithChat = candidateApps.map(app => {
      const chatHistory = db.messages.filter(msg => msg.applicationId === app.id);
      return { ...app, chatHistory };
    });
    
    return res.json(appsWithChat);
  } else {
    // Return applications for jobs posted by this recruiter
    const recruiterJobs = db.jobs.filter(j => j.recruiterId === req.user.id);
    const jobIds = recruiterJobs.map(j => j.id);

    const recruiterApps = db.applications.filter(app => jobIds.includes(app.jobId));
    
    const appsWithChat = recruiterApps.map(app => {
      const chatHistory = db.messages.filter(msg => msg.applicationId === app.id);
      
      // Also fetch and attach candidate profile metadata
      const candidateInfo = db.users.find(u => u.id === app.candidateId);
      let candidateProfile = null;
      if (candidateInfo) {
        const { passwordHash, ...safeInfo } = candidateInfo;
        candidateProfile = safeInfo;
      }

      return { ...app, chatHistory, candidateProfile };
    });

    return res.json(appsWithChat);
  }
});

// Apply for a job
app.post('/api/applications', authenticateToken, (req, res) => {
  if (req.user.role !== 'candidate') {
    return res.status(403).json({ error: 'Only candidates can apply for jobs' });
  }

  const { jobId, candidateSignature } = req.body;
  if (!jobId) return res.status(400).json({ error: 'Job ID is required' });

  const db = readData();
  const job = db.jobs.find(j => j.id === jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  if (job.fairWorkPact && !candidateSignature) {
    return res.status(400).json({ error: 'Candidate signature is required for Fair Work Pact verification' });
  }

  const exists = db.applications.find(app => app.jobId === jobId && app.candidateId === req.user.id);
  if (exists) return res.status(400).json({ error: 'You have already applied for this job' });

  const recruiter = db.users.find(u => u.id === job.recruiterId);
  const recruiterSignature = recruiter ? recruiter.name : job.companyName;

  const appId = `app-${Date.now()}`;
  const newApp = {
    id: appId,
    jobId,
    candidateId: req.user.id,
    appliedDate: 'Just now',
    status: 'Applied',
    candidateSignature: candidateSignature || '',
    candidateSignedAt: candidateSignature ? new Date().toISOString() : null,
    recruiterSignature: job.fairWorkPact ? recruiterSignature : null,
    recruiterSignedAt: job.fairWorkPact ? new Date().toISOString() : null
  };

  const initialMsg = {
    id: `msg-${Date.now()}`,
    applicationId: appId,
    sender: 'candidate',
    text: `Hi there! I am very interested in the ${job.title} position and have applied. Let me know if you need any additional info!`,
    timestamp: 'Just now'
  };

  db.applications.unshift(newApp);
  db.messages.push(initialMsg);
  writeData(db);

  res.status(201).json({
    ...newApp,
    chatHistory: [initialMsg]
  });
});

// Update application status
app.put('/api/applications/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'recruiter') {
    return res.status(403).json({ error: 'Only recruiters can update statuses' });
  }

  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  const db = readData();
  const appIndex = db.applications.findIndex(app => app.id === req.params.id);
  if (appIndex === -1) return res.status(404).json({ error: 'Application not found' });

  // Verify that the recruiter owns this job listing
  const app = db.applications[appIndex];
  const job = db.jobs.find(j => j.id === app.jobId);
  if (!job || job.recruiterId !== req.user.id) {
    return res.status(403).json({ error: 'You do not own the job listing for this application' });
  }

  db.applications[appIndex].status = status;

  // Insert a system-based chat message record
  const systemMsg = {
    id: `msg-sys-${Date.now()}`,
    applicationId: app.id,
    sender: 'recruiter',
    text: `[SYSTEM: Recruiter updated status to "${status}"]`,
    timestamp: 'Just now'
  };
  
  db.messages.push(systemMsg);
  writeData(db);

  res.json({
    ...db.applications[appIndex],
    systemMessage: systemMsg
  });
});


// --- MESSAGING ROUTES ---

// Send a chat message
app.post('/api/applications/:appId/messages', authenticateToken, (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Message text is required' });

  const db = readData();
  const app = db.applications.find(a => a.id === req.params.appId);
  if (!app) return res.status(404).json({ error: 'Application not found' });

  // Security check: Verify that user is either the applicant candidate or the recruiter of the job listing
  const job = db.jobs.find(j => j.id === app.jobId);
  const isCandidate = app.candidateId === req.user.id;
  const isRecruiter = job && job.recruiterId === req.user.id;

  if (!isCandidate && !isRecruiter) {
    return res.status(403).json({ error: 'You are not authorized to access this conversation' });
  }

  const senderType = isCandidate ? 'candidate' : 'recruiter';

  const newMsg = {
    id: `msg-${Date.now()}`,
    applicationId: app.id,
    sender: senderType,
    text,
    timestamp: 'Just now'
  };

  db.messages.push(newMsg);
  writeData(db);

  res.status(201).json(newMsg);
});

// Catch-all route to serve static index.html for Single Page App
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`Hyriq backend server running at http://localhost:${PORT}`);
});
