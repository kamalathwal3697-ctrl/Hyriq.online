import React, { useState, useEffect } from 'react';
import { Briefcase, Users, MessageSquare, Plus, Check, X, Calendar, Award, Trash2 } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import type { Application } from '../context/AppContext';
import { ChatWindow } from './ChatWindow';
import { getLocationDetails } from '../utils/locationHelper';

export const RecruiterDashboard: React.FC = () => {
  const {
    jobs,
    applications,
    recruiterProfile,
    candidateProfile,
    createJob,
    updateApplicationStatus,
    sendChatMessage,
    deleteJob,
    recruiterTab: activeTab,
    setRecruiterTab: setActiveTab,
    currentLocation,
    user
  } = useAppState();
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractApp, setContractApp] = useState<any>(null);

  // Job post form states
  const [jobTitle, setJobTitle] = useState('');
  const [jobCategory, setJobCategory] = useState('Tech & Engineering');
  const [jobType, setJobType] = useState<'Full-time' | 'Part-time' | 'Internship' | 'Contract'>('Full-time');
  const [jobMode, setJobMode] = useState<'Remote' | 'Hybrid' | 'On-site'>('Remote');
  const [jobSalary, setJobSalary] = useState('');
  const [jobExp, setJobExp] = useState<'Entry-level' | 'Mid-level' | 'Senior-level'>('Mid-level');
  const [jobLoc, setJobLoc] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [jobSkills, setJobSkills] = useState<string[]>([]);
  const [jobDesc, setJobDesc] = useState('');
  const [reqsText, setReqsText] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [fairWorkPactChecked, setFairWorkPactChecked] = useState(false);
  const [chatLiveHours, setChatLiveHours] = useState('10:00 AM - 12:00 PM');

  // Manage listings states
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedAppId, setSelectedAppId] = useState<string>('');

  // Saved Candidate Profiles
  const [savedCandidates, setSavedCandidates] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('hyriq_recruiter_saved_candidates') || '[]');
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('hyriq_recruiter_saved_candidates', JSON.stringify(savedCandidates));
  }, [savedCandidates]);

  const handleSaveCandidate = () => {
    const exists = savedCandidates.some(c => c.email === candidateProfile.email);
    if (exists) {
      setSavedCandidates(savedCandidates.filter(c => c.email !== candidateProfile.email));
    } else {
      setSavedCandidates([...savedCandidates, candidateProfile]);
    }
  };

  const [realStats, setRealStats] = useState<{ total: number, live: number, registered: number } | null>(null);

  useEffect(() => {
    if (user?.email === 'raj_athwal') {
      const fetchStats = () => {
        fetch('/api/visitor/stats')
          .then(res => res.json())
          .then(data => setRealStats(data))
          .catch(err => console.error('Failed to fetch real stats:', err));
      };
      fetchStats();
      const interval = setInterval(fetchStats, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Set default selected job
  useEffect(() => {
    const recruiterJobs = jobs.filter(j => j.recruiterId === (user?.id || 'rec-1'));
    if (recruiterJobs.length > 0 && !selectedJobId) {
      setSelectedJobId(recruiterJobs[0].id);
    }
  }, [jobs, selectedJobId, user]);

  // Recruiter posted jobs
  const myJobs = jobs.filter(job => job.recruiterId === (user?.id || 'rec-1'));
  const activeApplications = applications.filter(app => 
    myJobs.some(j => j.id === app.jobId)
  );

  // Active Chats count
  const activeChatsCount = activeApplications.filter(app => app.chatHistory.length > 0).length;

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobSalary.trim() || !jobDesc.trim()) return;
    if (!fairWorkPactChecked) {
      alert('You must commit to uphold the Hyriq Fair Work Pact to publish this job listing.');
      return;
    }

    const requirements = reqsText.split('\n').map(r => r.trim()).filter(Boolean);
    const benefits = benefitsText.split('\n').map(b => b.trim()).filter(Boolean);

    createJob({
      title: jobTitle,
      companyName: recruiterProfile.companyName,
      location: jobLoc || 'Remote',
      type: jobType,
      mode: jobMode,
      salary: jobSalary,
      experience: jobExp,
      skills: jobSkills.length > 0 ? jobSkills : ['React', 'TypeScript'],
      description: jobDesc,
      requirements: requirements.length > 0 ? requirements : ['2+ years experience in the field.'],
      benefits: benefits.length > 0 ? benefits : ['Flexible hours.'],
      fairWorkPact: true,
      chatLiveHours: chatLiveHours || 'Not Scheduled'
    });

    // Reset Form
    setJobTitle('');
    setJobSalary('');
    setJobLoc('');
    setJobSkills([]);
    setJobDesc('');
    setReqsText('');
    setBenefitsText('');
    setFairWorkPactChecked(false);
    setChatLiveHours('10:00 AM - 12:00 PM');

    alert('Job posted successfully! View it in "Manage Jobs" tab.');
    setActiveTab('manage');
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim() || jobSkills.includes(newSkill.trim())) return;
    setJobSkills(prev => [...prev, newSkill.trim()]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    setJobSkills(prev => prev.filter(s => s !== skill));
  };

  // Selected job applicants
  const currentJobApplicants = applications.filter(app => app.jobId === selectedJobId);
  const currentApplication = applications.find(app => app.id === selectedAppId) || null;

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'Applied': return <span className="badge badge-primary">Applied</span>;
      case 'Reviewing': return <span className="badge badge-warning">Reviewing</span>;
      case 'Shortlisted': return <span className="badge badge-success">Shortlisted</span>;
      case 'Interview': return <span className="badge badge-secondary">Interviewing</span>;
      case 'Offered': return <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.25)', border: '1px solid var(--success)' }}>Offered</span>;
      case 'Rejected': return <span className="badge badge-danger">Rejected</span>;
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
      {/* Dashboard Subheader Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>Recruiter Command Center</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Managing talent for {recruiterProfile.companyName}.</p>
        </div>

        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Briefcase size={16} />
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'post-job' ? 'active' : ''}`}
            onClick={() => setActiveTab('post-job')}
          >
            <Plus size={16} />
            Post a Job
          </button>
          <button 
            className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <Users size={16} />
            Applicants & Jobs ({activeApplications.length})
          </button>
        </div>
      </div>

       {/* OVERVIEW VIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Admin Real-Time Metrics Panel */}
          {user?.email === 'raj_athwal' && realStats && (
            <div className="glass-panel" style={{ padding: '24px', border: '1px dashed var(--tech-orange)', background: 'rgba(242, 153, 74, 0.03)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--tech-orange)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🛡️ Live System Administrator Monitor (REAL DATA)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Real Visits (All Time)</span>
                  <h4 style={{ fontSize: '24px', color: '#fff', fontWeight: 800, marginTop: '4px' }}>{realStats.total.toLocaleString()}</h4>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', position: 'relative' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Real Live (Last 5 mins)</span>
                  <h4 style={{ fontSize: '24px', color: '#10b981', fontWeight: 800, marginTop: '4px' }}>{realStats.live}</h4>
                  <span className="pulse-live" style={{ position: 'absolute', top: '16px', right: '16px', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Real Registered Users</span>
                  <h4 style={{ fontSize: '24px', color: '#fff', fontWeight: 800, marginTop: '4px' }}>{realStats.registered}</h4>
                </div>
              </div>
            </div>
          )}
          {/* Dashboard Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
                <Briefcase size={24} />
              </div>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>My Listings</span>
                <h3 style={{ fontSize: '28px', color: '#fff', fontWeight: 700 }}>{myJobs.length}</h3>
              </div>
            </div>
            
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--secondary)' }}>
                <Users size={24} />
              </div>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Candidates</span>
                <h3 style={{ fontSize: '28px', color: '#fff', fontWeight: 700 }}>{activeApplications.length}</h3>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                <MessageSquare size={24} />
              </div>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Active Chats</span>
                <h3 style={{ fontSize: '28px', color: '#fff', fontWeight: 700 }}>{activeChatsCount}</h3>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', color: 'var(--accent)' }}>
                <Award size={24} />
              </div>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Shortlisted</span>
                <h3 style={{ fontSize: '28px', color: '#fff', fontWeight: 700 }}>
                  {activeApplications.filter(app => app.status === 'Shortlisted' || app.status === 'Interview').length}
                </h3>
              </div>
            </div>
          </div>

          {/* Recruiter Profile Details Card */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Verified Company Profile</h3>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="avatar" style={{ width: '60px', height: '60px', fontSize: '22px', background: 'var(--secondary-gradient)' }}>
                {recruiterProfile.companyName.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: '#fff', fontSize: '18px' }}>{recruiterProfile.companyName}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Representative: {recruiterProfile.recruiterName}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px', fontStyle: 'italic' }}>"{recruiterProfile.bio}"</p>
              </div>
            </div>
          </div>

          {/* Quick List of Active Jobs */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Active Job Listings</h3>
            {myJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
                No active listings. Create one in the "Post a Job" tab!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {myJobs.map(job => {
                  const applicantsCount = applications.filter(app => app.jobId === job.id).length;
                  return (
                    <div key={job.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>{job.title}</h4>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{job.type} • {job.mode}</span>
                        </div>
                        <button 
                          onClick={() => deleteJob(job.id)}
                          className="btn btn-ghost" 
                          style={{ color: 'var(--danger)', padding: '6px', borderRadius: '6px' }}
                          title="Delete Job"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Applicants: <strong>{applicantsCount}</strong></span>
                        <button 
                          onClick={() => {
                            setSelectedJobId(job.id);
                            setActiveTab('manage');
                          }}
                          className="btn btn-outline" 
                          style={{ padding: '6px 12px', fontSize: '11px' }}
                        >
                          Review Applicants
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Saved Candidate Profiles Section */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Saved Candidate Profiles</h3>
            {savedCandidates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
                No saved candidate profiles yet. Review applicants to save top talent!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {savedCandidates.map((cand, idx) => {
                  return (
                    <div key={idx} className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--tech-orange) 0%, #1A3E62 100%)',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          background: '#0B0E14',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          overflow: 'hidden'
                        }}>
                          {cand.logoSeed && (cand.logoSeed.startsWith('data:image/') || cand.logoSeed.startsWith('http')) ? (
                            <img src={cand.logoSeed} alt="DP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            cand.logoSeed || '🧑‍💻'
                          )}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 600, margin: 0 }}>{cand.name}</h4>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                          {cand.experience || 'Entry-level'}
                        </span>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <button
                            onClick={() => {
                              const app = applications.find(appObj => !!appObj.id);
                              if (app) {
                                setSelectedJobId(app.jobId);
                                setSelectedAppId(app.id);
                                setActiveTab('manage');
                              } else {
                                alert("No active applications found for this candidate.");
                              }
                            }}
                            className="btn btn-outline"
                            style={{ padding: '4px 10px', fontSize: '10px' }}
                          >
                            Chat / View
                          </button>
                          <button
                            onClick={() => {
                              setSavedCandidates(savedCandidates.filter(c => c.email !== cand.email));
                            }}
                            className="btn btn-ghost"
                            style={{ padding: '4px 8px', fontSize: '10px', color: 'var(--danger)' }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* POST A JOB VIEW */}
      {activeTab === 'post-job' && (
        <form onSubmit={handlePostJob} className="glass-panel animate-fade-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            List a New Opportunity
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Job Title</label>
              <input
                type="text"
                placeholder="e.g. Frontend Specialist, Product Designer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="glass-input"
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</label>
              <select
                value={jobCategory}
                onChange={(e) => setJobCategory(e.target.value)}
                className="glass-input"
                style={{ height: '45px' }}
              >
                <option value="Tech & Engineering">Tech & Engineering</option>
                <option value="Design & Product">Design & Product</option>
                <option value="Marketing & Content">Marketing & Content</option>
                <option value="Sales & Operations">Sales & Operations</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Job Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as any)}
                className="glass-input"
                style={{ height: '45px' }}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Work Mode</label>
              <select
                value={jobMode}
                onChange={(e) => setJobMode(e.target.value as any)}
                className="glass-input"
                style={{ height: '45px' }}
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Experience Tier</label>
              <select
                value={jobExp}
                onChange={(e) => setJobExp(e.target.value as any)}
                className="glass-input"
                style={{ height: '45px' }}
              >
                <option value="Entry-level">Entry-level</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior-level">Senior-level</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Compensation Range</label>
              <input
                type="text"
                placeholder="e.g. ₹20,000 - ₹30,000 / mo, ₹15,000 / mo"
                value={jobSalary}
                onChange={(e) => setJobSalary(e.target.value)}
                className="glass-input"
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Location / Core Timezone</label>
              <input
                type="text"
                placeholder="e.g. Remote (US), San Francisco, CA"
                value={jobLoc}
                onChange={(e) => setJobLoc(e.target.value)}
                className="glass-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Daily Chat Live Hours</label>
              <input
                type="text"
                placeholder="e.g. 10:00 AM - 12:00 PM, 2:00 PM - 5:00 PM"
                value={chatLiveHours}
                onChange={(e) => setChatLiveHours(e.target.value)}
                className="glass-input"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Chat Mode Status Indicator</label>
              <div style={{ display: 'flex', alignItems: 'center', height: '45px', padding: '0 12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                ℹ️ Display scheduled hour blocks dynamically to matching applicants.
              </div>
            </div>
          </div>

          {/* Required Skills Adder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Required Skills</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {jobSkills.map(skill => (
                <span key={skill} className="badge badge-secondary" style={{ gap: '6px', paddingRight: '6px' }}>
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)} style={{ border: 'none', background: 'transparent', color: '#67e8f9', cursor: 'pointer' }}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Type skill (e.g. React, SQL) and click Add"
                className="glass-input"
                style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
              />
              <button type="button" onClick={handleAddSkill} className="btn btn-outline" style={{ padding: '0 16px' }}>
                Add Skill
              </button>
            </div>
          </div>

          {/* Job Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Job Description Summary</label>
            <textarea
              placeholder="Provide a high-level overview of the role, challenges, and context..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              className="glass-input"
              rows={4}
              style={{ resize: 'none' }}
              required
            />
          </div>

          {/* Requirements List (Newline separated) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Candidate Requirements (one per line)</label>
            <textarea
              placeholder="e.g.&#10;3+ years of React development&#10;Familiarity with SQL databases&#10;Excellent communication skills"
              value={reqsText}
              onChange={(e) => setReqsText(e.target.value)}
              className="glass-input"
              rows={3}
              style={{ resize: 'none' }}
            />
          </div>

          {/* Benefits List (Newline separated) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Perks & Benefits (one per line)</label>
            <textarea
              placeholder="e.g.&#10;Unlimited PTO&#10;Home office stipend ($1,500)&#10;Health/dental/vision coverage"
              value={benefitsText}
              onChange={(e) => setBenefitsText(e.target.value)}
              className="glass-input"
              rows={3}
              style={{ resize: 'none' }}
            />
          </div>

          {/* Fair Work Pact Commitment Checkbox */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.04)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '20px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🛡️</span> The Hyriq Fair Work Pact Commitment
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
              By listing this job, you commit to respecting Worker Rights: limited fair working hours, guaranteed overtime compensation, safe working conditions, housing allowance/accommodation where applicable, merit-based advancement, and protection against unfair termination.
            </p>
            <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={fairWorkPactChecked}
                onChange={(e) => setFairWorkPactChecked(e.target.checked)}
                style={{ accentColor: 'var(--success)', width: '16px', height: '16px' }}
                required
              />
              <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>
                I commit to uphold the Hyriq Fair Work Pact for this listing
              </span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '14px 28px', alignSelf: 'flex-start' }}>
            Publish Job Listing
          </button>
        </form>
      )}

      {/* APPLICANTS & JOBS VIEW */}
      {activeTab === 'manage' && (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }} className="manage-grid">
          {/* Active Jobs sidebar selector */}
          <aside className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              Select Job Listing
            </h3>
            {myJobs.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center' }}>No active listings.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {myJobs.map(job => {
                  const applicantsCount = applications.filter(app => app.jobId === job.id).length;
                  const isSelected = selectedJobId === job.id;
                  return (
                    <div
                      key={job.id}
                      onClick={() => {
                        setSelectedJobId(job.id);
                        setSelectedAppId(''); // Reset selected applicant
                      }}
                      className="glass-panel glass-panel-hover"
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        border: isSelected ? '1px solid var(--border-color-active)' : '1px solid var(--border-color)',
                        background: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255, 255, 255, 0.02)'
                      }}
                    >
                      <h4 style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{job.title}</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span>{job.type}</span>
                        <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>{applicantsCount} applicants</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </aside>

          {/* Job applicants detailed overview */}
          <main style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }} className="manage-main">
            {/* Candidates list for selected job */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                Applicants ({currentJobApplicants.length})
              </h3>
              {currentJobApplicants.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                  No applicants for this job yet. Try applying from the "Job Seeker" view to test!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentJobApplicants.map(app => {
                    // In our mock database, candidate ID 'cand-1' represents candidateProfile
                    const isSelected = selectedAppId === app.id;
                    return (
                      <div
                        key={app.id}
                        onClick={() => setSelectedAppId(app.id)}
                        className="glass-panel glass-panel-hover"
                        style={{
                          padding: '14px',
                          cursor: 'pointer',
                          border: isSelected ? '1px solid var(--border-color-active)' : '1px solid var(--border-color)',
                          background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.01)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                          <h4 style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{candidateProfile.name}</h4>
                          {getStatusBadge(app.status)}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '11px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {candidateProfile.skills.slice(0, 3).join(' • ')}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '10px', color: 'var(--text-muted)' }}>
                          <span>Applied: {app.appliedDate}</span>
                          {app.chatHistory.length > 0 && <span style={{ color: 'var(--primary)' }}>Chat active</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Applicant details + Chat panel */}
            <div>
              {currentApplication ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Candidate Details summary card */}
                  <div className="glass-panel" style={{ padding: '24px', background: '#0B0E14', border: '2px solid var(--corporate-blue)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Profile Card Header (Francisco style) */}
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap-reverse' }}>
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        {/* Visual Page dots */}
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--tech-orange)' }}></span>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-muted)' }}></span>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-muted)' }}></span>
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--tech-orange)', textTransform: 'uppercase', lineHeight: '1.1', fontFamily: 'Outfit', letterSpacing: '0.5px' }}>
                          {candidateProfile.name ? candidateProfile.name.split(' ')[0] : 'Candidate'}<br/>
                          {candidateProfile.name ? candidateProfile.name.split(' ').slice(1).join(' ') : 'Name'}
                        </h2>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginTop: '6px', letterSpacing: '1px' }}>
                          {candidateProfile.experience ? `${candidateProfile.experience.toUpperCase()} PROFESSIONAL` : 'JOB SEEKER'}
                        </span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
                          <button
                            onClick={handleSaveCandidate}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              border: '1px solid',
                              borderColor: savedCandidates.some(c => c.email === candidateProfile.email) ? 'var(--tech-orange)' : 'rgba(255,255,255,0.15)',
                              color: savedCandidates.some(c => c.email === candidateProfile.email) ? 'var(--tech-orange)' : 'var(--text-secondary)',
                              background: savedCandidates.some(c => c.email === candidateProfile.email) ? 'rgba(242,153,74,0.08)' : 'transparent',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {savedCandidates.some(c => c.email === candidateProfile.email) ? '❤️ Saved Profile' : '🤍 Save Profile'}
                          </button>
                        </div>
                      </div>
                      
                      {/* Highlighted DP Container (circular orange frame) */}
                      <div style={{
                        position: 'relative',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--tech-orange) 0%, #1A3E62 100%)',
                        padding: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(242, 153, 74, 0.25)'
                      }}>
                        <div style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          background: '#0B0E14',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: candidateProfile.logoSeed && candidateProfile.logoSeed.length > 4 ? '18px' : '38px',
                          overflow: 'hidden'
                        }}>
                          {candidateProfile.logoSeed && (candidateProfile.logoSeed.startsWith('data:image/') || candidateProfile.logoSeed.startsWith('http')) ? (
                            <img src={candidateProfile.logoSeed} alt="DP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            candidateProfile.logoSeed || '🧑‍💻'
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Layout Grid inside Card */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
                      
                      {/* About Me Orange check block */}
                      <div style={{
                        background: 'rgba(242, 153, 74, 0.05)',
                        border: '1px solid rgba(242, 153, 74, 0.15)',
                        padding: '16px',
                        borderRadius: '16px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {/* Tiny Checkered graphic mimic */}
                        <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '12px', opacity: 0.35 }}>🏁</div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--tech-orange)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>About Me</span>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.45', margin: 0 }}>
                          {candidateProfile.bio || 'No bio provided.'}
                        </p>
                      </div>

                      {/* Education */}
                      {candidateProfile.academicsList && candidateProfile.academicsList.length > 0 && (
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>Education</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {candidateProfile.academicsList.map((acad, idx) => (
                              <div key={idx} style={{ position: 'relative', paddingLeft: '14px', borderLeft: '2px solid var(--tech-orange)' }}>
                                <strong style={{ color: '#fff', fontSize: '12.5px', display: 'block' }}>{acad.degree}</strong>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{acad.school}</span>
                                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Year: {acad.year} • Score: {acad.grade}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skills with Progress bars */}
                      {candidateProfile.skills.length > 0 && (
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>Skills & Proficiencies</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {candidateProfile.skills.map((skill, index) => (
                              <div key={skill} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{skill}</span>
                                </div>
                                {/* Visual Progress bar */}
                                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{
                                    width: `${Math.max(45, 95 - index * 10)}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, var(--corporate-blue) 0%, var(--tech-orange) 100%)',
                                    borderRadius: '3px'
                                  }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Past Experiences */}
                      {candidateProfile.workExperiences && candidateProfile.workExperiences.length > 0 && (
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>Experience Timeline</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {candidateProfile.workExperiences.map((work, idx) => (
                              <div key={idx} style={{ position: 'relative', paddingLeft: '14px', borderLeft: '2px solid var(--corporate-blue)' }}>
                                <strong style={{ color: '#fff', fontSize: '13px', display: 'block' }}>{work.role}</strong>
                                <span style={{ fontSize: '11.5px', color: 'var(--tech-orange)', fontWeight: 600 }}>{work.company}</span>
                                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', margin: '2px 0' }}>{work.duration}</span>
                                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: '1.4' }}>{work.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Certifications */}
                      {candidateProfile.certifications && candidateProfile.certifications.length > 0 && (
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>Certifications</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {candidateProfile.certifications.map((cert, idx) => (
                              <div key={idx} style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '10px' }}>
                                🏆 <strong style={{ color: '#fff' }}>{cert.name}</strong>
                                <p style={{ color: 'var(--text-muted)', fontSize: '10.5px', margin: '2px 0 0 0' }}>{cert.issuer} — {cert.year}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Bottom Contact Card Bar */}
                    <div style={{
                      background: 'rgba(242, 153, 74, 0.07)',
                      border: '1px solid rgba(242, 153, 74, 0.15)',
                      padding: '16px',
                      borderRadius: '16px',
                      marginTop: '10px',
                      display: 'grid',
                      gridTemplateColumns: '1fr',
                      gap: '8px',
                      fontSize: '11.5px',
                      color: 'var(--text-secondary)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✉️ <strong>{candidateProfile.email}</strong></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📞 <strong>{candidateProfile.phone}</strong></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📍 <strong>{currentLocation}, {getLocationDetails(currentLocation).state}</strong></div>
                    </div>

                    {/* View Signed Legal Pact Button */}
                    {jobs.find(j => j.id === currentApplication.jobId)?.fairWorkPact && (
                      <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setContractApp(currentApplication);
                            setShowContractModal(true);
                          }}
                          className="btn btn-primary animate-glow"
                          style={{ width: '100%', padding: '10px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                          🛡️ View Signed Legal Pact Agreement
                        </button>
                      </div>
                    )}

                    {/* Quick Status Action Controls */}
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => updateApplicationStatus(currentApplication.id, 'Shortlisted')}
                        className="btn btn-outline"
                        style={{ padding: '8px 12px', fontSize: '12px', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#6ee7b7' }}
                      >
                        <Check size={12} /> Shortlist
                      </button>
                      
                      <button
                        onClick={() => updateApplicationStatus(currentApplication.id, 'Interview')}
                        className="btn btn-outline"
                        style={{ padding: '8px 12px', fontSize: '12px', borderColor: 'rgba(99, 102, 241, 0.3)', color: '#a5b4fc' }}
                      >
                        <Calendar size={12} /> Schedule Interview
                      </button>

                      <button
                        onClick={() => updateApplicationStatus(currentApplication.id, 'Offered')}
                        className="btn btn-outline"
                        style={{ padding: '8px 12px', fontSize: '12px', borderColor: 'rgba(6, 182, 212, 0.3)', color: '#67e8f9' }}
                      >
                        <Award size={12} /> Make Offer
                      </button>

                      <button
                        onClick={() => updateApplicationStatus(currentApplication.id, 'Rejected')}
                        className="btn btn-outline"
                        style={{ padding: '8px 12px', fontSize: '12px', borderColor: 'rgba(244, 63, 94, 0.3)', color: '#fda4af' }}
                      >
                        <X size={12} /> Reject
                      </button>
                    </div>
                  </div>

                  {/* Candidate Chat Window */}
                  <ChatWindow
                    chatHistory={currentApplication.chatHistory}
                    currentRole="recruiter"
                    onSendMessage={(text) => sendChatMessage(currentApplication.id, text, 'recruiter')}
                    title={`Direct Chat with ${candidateProfile.name}`}
                    showReciprocalBanner={currentApplication.status === 'Shortlisted' || currentApplication.status === 'Interview'}
                    onConfirmProfile={() => {
                      sendChatMessage(currentApplication.id, "[SYSTEM: Recruiter confirmed profile details and verified interest.]", 'recruiter');
                    }}
                  />
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <h3>Candidate Workspace</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Select a job listing on the left, then select an applicant to view details and chat.
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      )}

      {/* Fair Work Pact Legal Document Modal */}
      {showContractModal && contractApp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 3, 10, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} className="contract-modal-overlay">
          <div className="glass-panel contract-printable-area animate-glow" style={{
            width: '100%',
            maxWidth: '700px',
            background: '#0d0a15',
            padding: '40px',
            position: 'relative',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 0 40px rgba(16, 185, 129, 0.1)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Close / Action Buttons */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              display: 'flex',
              gap: '12px'
            }} className="no-print">
              <button
                onClick={() => window.print()}
                className="btn btn-outline"
                style={{ padding: '6px 14px', fontSize: '12px', borderColor: 'var(--success)', color: '#6ee7b7' }}
              >
                🖨️ Print / PDF
              </button>
              <button 
                onClick={() => {
                  setShowContractModal(false);
                  setContractApp(null);
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Document Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px double rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '24px' }}>
              <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 700, letterSpacing: '2px', display: 'block', marginBottom: '6px' }}>
                MUTUAL COVENANT AGREEMENT
              </span>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: '#fff', margin: 0 }}>
                THE FAIR WORK PACT
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                DIGITALLY SIGNED AND EXECUTED VIA HYRIQ TRUST NETWORK • ID: Pact-{contractApp.id}
              </p>
            </div>

            {/* Parties */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>FIRST PARTY (EMPLOYER)</span>
                <strong style={{ fontSize: '15px', color: '#fff', display: 'block', marginTop: '4px' }}>
                  {jobs.find(j => j.id === contractApp.jobId)?.companyName}
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Authorized Signatory: {contractApp.recruiterSignature || 'Company Representative'}
                </span>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '24px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>SECOND PARTY (WORKER)</span>
                <strong style={{ fontSize: '15px', color: '#fff', display: 'block', marginTop: '4px' }}>
                  {candidateProfile.name}
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Signatory Name: {contractApp.candidateSignature || candidateProfile.name}
                </span>
              </div>
            </div>

            {/* Covenant Terms */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '32px' }}>
              <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-muted)', textAlign: 'center' }}>
                "This document records the mutual covenants entered into by the First Party and the Second Party to ensure respect, safety, and accountability in the workplace."
              </p>

              <div>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                  SECTION 1: WORKER RIGHTS (Employer Commitments)
                </strong>
                <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
                  <li><strong>Fair Working Hours:</strong> Strict adherence to a standard, limited work schedule.</li>
                  <li><strong>Overtime Pay:</strong> Guaranteed extra compensation for any hours worked beyond the daily limit.</li>
                  <li><strong>Health & Well-being:</strong> Access to basic medical benefits and a safe working environment.</li>
                  <li><strong>Accommodation Support:</strong> Housing allowance or safe, provided accommodation where applicable.</li>
                  <li><strong>Job Security:</strong> Protection against unfair firing without valid cause or proper notice.</li>
                  <li><strong>Merit-Based Growth:</strong> Guaranteed salary raises or promotions upon successfully achieving predefined work targets.</li>
                </ul>
              </div>

              <div>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                  SECTION 2: WORKER DUTIES (Employee Commitments)
                </strong>
                <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
                  <li><strong>Punctuality:</strong> Consistently arriving on time and respecting the work schedule.</li>
                  <li><strong>Prompt Communication:</strong> Timely and professional responses to all work-related messages or requests.</li>
                  <li><strong>Responsibility:</strong> Taking full ownership of assigned tasks and performing them diligently.</li>
                  <li><strong>Absolute Integrity:</strong> Honesty in reporting hours, tasks, and issues.</li>
                  <li><strong>Professional Conduct:</strong> Respectful behavior towards coworkers and clients.</li>
                </ul>
              </div>
            </div>

            {/* Execution / Signatures */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>First Party Signature</span>
                <span style={{ fontFamily: 'Dancing Script, cursive, Georgia', fontSize: '22px', color: '#6366f1', display: 'block', padding: '10px 0', borderBottom: '1px dashed rgba(255,255,255,0.1)', fontStyle: 'italic' }}>
                  {contractApp.recruiterSignature || 'Gaurav Gupta'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>
                  Signed: {contractApp.recruiterSignedAt ? new Date(contractApp.recruiterSignedAt).toLocaleString() : 'Executed upon posting'}
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Second Party Signature</span>
                <span style={{ fontFamily: 'Dancing Script, cursive, Georgia', fontSize: '22px', color: '#22d3ee', display: 'block', padding: '10px 0', borderBottom: '1px dashed rgba(255,255,255,0.1)', fontStyle: 'italic' }}>
                  {contractApp.candidateSignature || 'Amanpreet Singh'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>
                  Signed: {contractApp.candidateSignedAt ? new Date(contractApp.candidateSignedAt).toLocaleString() : 'Executed upon applying'}
                </span>
              </div>
            </div>

            {/* Digital Seal */}
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <span className="badge badge-success" style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '8px 16px',
                fontSize: '11px',
                color: '#10b981',
                borderRadius: '8px'
              }}>
                🛡️ SECURED & VALID CONTRACT RECORDED
              </span>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-bottom-nav" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: '#0B0E14',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'none',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
        paddingBottom: 'safe-area-inset-bottom'
      }}>
        {[
          { id: 'overview', label: 'Dashboard', icon: '📊' },
          { id: 'post-job', label: 'Post Job', icon: '➕' },
          { id: 'manage', label: 'Manage Jobs', icon: '📁' }
        ].map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isActive ? 'var(--tech-orange)' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                flex: 1,
                padding: '8px 0',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
