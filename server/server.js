import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, readData, writeData } from './db.js';

const app = express();
const PORT = 5000;
const JWT_SECRET = 'hyriq_super_secret_vibe_key_123';

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

// Sign Up
app.post('/api/auth/signup', (req, res) => {
  const { email, password, role, name, phone, bio } = req.body;
  if (!email || !password || !role || !name) {
    return res.status(400).json({ error: 'Email, password, role, and name are required' });
  }

  const db = readData();
  const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return res.status(400).json({ error: 'Email already registered' });

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const userId = `user-${Date.now()}`;

  const newUser = {
    id: userId,
    email: email.toLowerCase(),
    passwordHash,
    role,
    name,
    phone: phone || '',
    bio: bio || '',
    skills: role === 'candidate' ? [] : undefined,
    experience: role === 'candidate' ? 'Entry-level' : undefined,
    resumeName: role === 'candidate' ? 'No resume uploaded' : undefined,
    onboardingCompleted: role === 'candidate' ? false : undefined,
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
    user: { id: userId, email: newUser.email, role: newUser.role, name: newUser.name }
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = readData();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
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

  const { title, companyName, location, type, mode, salary, experience, skills, description, requirements, benefits } = req.body;
  if (!title || !salary || !description) {
    return res.status(400).json({ error: 'Job title, salary, and description are required' });
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
    recruiterId: req.user.id
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

  const { jobId } = req.body;
  if (!jobId) return res.status(400).json({ error: 'Job ID is required' });

  const db = readData();
  const job = db.jobs.find(j => j.id === jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const exists = db.applications.find(app => app.jobId === jobId && app.candidateId === req.user.id);
  if (exists) return res.status(400).json({ error: 'You have already applied for this job' });

  const appId = `app-${Date.now()}`;
  const newApp = {
    id: appId,
    jobId,
    candidateId: req.user.id,
    appliedDate: 'Just now',
    status: 'Applied'
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
