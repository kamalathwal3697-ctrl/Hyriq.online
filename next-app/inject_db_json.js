import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../db.json');

const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const job1 = {
  "id": "job-" + Date.now() + "1",
  "title": "Sales Executive (Boy/Girl)",
  "company": "Hyriq Official",
  "location": "Pan India (Remote/On-site)",
  "type": "Full-time",
  "salary": "₹8,000 - ₹15,000",
  "description": "We are looking for dynamic, motivated, and energetic individuals to fill immediate openings in our growing team. Both freshers and experienced candidates are welcome to apply! 3 Openings available.",
  "requirements": ["12th Pass or above", "Good communication & confidence"],
  "responsibilities": ["Interact with customers and explain product/service benefits.", "Meet daily/weekly sales targets.", "Maintain a positive and professional attitude."],
  "tags": ["Sales", "Executive", "Fresher"],
  "logo": "Hyriq",
  "postedById": "recruiter-1",
  "postedDate": new Date().toISOString()
};

const job2 = {
  "id": "job-" + Date.now() + "2",
  "title": "Team Leader (TL - Male)",
  "company": "Hyriq Official",
  "location": "Pan India (Remote/On-site)",
  "type": "Full-time",
  "salary": "₹15,000 - ₹20,000",
  "description": "We are looking for a dynamic and motivated Team Leader to fill immediate openings in our growing team. Experienced candidates only. 1 Opening available.",
  "requirements": ["Graduate / Experienced", "Leadership skills & sales experience"],
  "responsibilities": ["Manage, motivate, and guide a team of 3-4 sales executives.", "Track team performance and ensure targets are met.", "Provide daily reporting to management."],
  "tags": ["Sales", "Team Leader", "Management"],
  "logo": "Hyriq",
  "postedById": "recruiter-1",
  "postedDate": new Date(Date.now() + 1000).toISOString()
};

if (!data.jobs) data.jobs = [];

// Prepend to array
data.jobs.unshift(job2, job1);

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('Successfully injected jobs to db.json');
