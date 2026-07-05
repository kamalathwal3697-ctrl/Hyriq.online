import React, { useState, useEffect } from 'react';
import { Briefcase, Users, MessageSquare, Plus, Check, X, Calendar, Award, Trash2, Bell } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import type { Application } from '../context/AppContext';
import { ChatWindow } from './ChatWindow';
import { NotificationsPage } from './NotificationsPage';
import { getLocationDetails } from '../utils/locationHelper';
import { calculateMatchScore } from '../utils/aiMatching';

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
    user,
    token
  } = useAppState();
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractApp, setContractApp] = useState<any>(null);
  const [allCandidates, setAllCandidates] = useState<any[]>([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedKanbanCandidate, setSelectedKanbanCandidate] = useState<any>(null);
  const [calendarDate, setCalendarDate] = useState('2026-07-06');
  const [calendarTime, setCalendarTime] = useState('10:00');

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

  useEffect(() => {
    if (user?.email === 'raj_athwal' && activeTab === 'overview' && token) {
      fetch('/api/admin/candidates', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Unauthorized');
        })
        .then(data => setAllCandidates(data))
        .catch(err => console.error('Failed to load registered candidates:', err));
    }
  }, [user, activeTab, token]);

  const [sheetUrl, setSheetUrl] = useState('');

  // Fetch sheets configuration on mount
  useEffect(() => {
    if (user?.email === 'raj_athwal' && activeTab === 'overview' && token) {
      fetch('/api/admin/sheets-config', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.googleSheetWebappUrl) {
            setSheetUrl(data.googleSheetWebappUrl);
          }
        })
        .catch(err => console.error('Failed to load sheets config:', err));
    }
  }, [user, activeTab, token]);

  const handleSaveSheetConfig = () => {
    if (!token) return;
    fetch('/api/admin/sheets-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ googleSheetWebappUrl: sheetUrl })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Google Sheet Web App URL updated successfully!');
        } else {
          alert('Error: ' + data.error);
        }
      })
      .catch(err => {
        console.error('Failed to save sheets config:', err);
        alert('Failed to save configuration.');
      });
  };

  const handleSyncAllSheets = () => {
    if (!token) return;
    if (!confirm('Are you sure you want to sync all registered candidates and recruiters to the Google Sheet? This will append all records.')) return;
    
    fetch('/api/admin/sync-sheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(data.message);
        } else {
          alert('Error: ' + data.error);
        }
      })
      .catch(err => {
        console.error('Failed to trigger sheets sync:', err);
        alert('Failed to trigger synchronization.');
      });
  };

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
  const manageActiveJob = jobs.find(j => j.id === selectedJobId) || null;
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

        <div className="tabs-header md:hidden flex">
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
          <button 
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={16} />
            Notifications
          </button>
        </div>
      </div>

       {/* OVERVIEW VIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Row with Create Requisition button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Command Center</h2>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Talent sourcing pipeline and analytics overview.</p>
            </div>
            <button 
              onClick={() => setActiveTab('post-job')}
              className="btn-primary"
            >
              Create New Requisition
            </button>
          </div>

          {/* Admin Real-Time Metrics Panel */}
          {user?.email === 'raj_athwal' && realStats && (
            <div className="card-flat" style={{ padding: '20px', backgroundColor: '#f8fafc', borderStyle: 'dashed' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🛡️ Live System Administrator Monitor (REAL DATA)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="card-flat" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Real Visits (All Time)</span>
                  <h4 style={{ fontSize: '24px', color: '#0f172a', fontWeight: 850, marginTop: '4px' }}>{realStats.total.toLocaleString()}</h4>
                </div>
                <div className="card-flat" style={{ padding: '16px', position: 'relative' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Real Live (Last 5 mins)</span>
                  <h4 style={{ fontSize: '24px', color: '#10b981', fontWeight: 850, marginTop: '4px' }}>{realStats.live}</h4>
                  <span className="pulse-live" style={{ position: 'absolute', top: '16px', right: '16px', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                </div>
                <div className="card-flat" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Real Registered Users</span>
                  <h4 style={{ fontSize: '24px', color: '#0f172a', fontWeight: 850, marginTop: '4px' }}>{realStats.registered}</h4>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Summary Cards (Flat corporate styling) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="card-flat" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                <Briefcase size={20} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>My Listings</span>
                <h3 style={{ fontSize: '24px', color: '#0f172a', fontWeight: 700 }}>{myJobs.length}</h3>
              </div>
            </div>
            
            <div className="card-flat" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                <Users size={20} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Total Candidates</span>
                <h3 style={{ fontSize: '24px', color: '#0f172a', fontWeight: 700 }}>{activeApplications.length}</h3>
              </div>
            </div>

            <div className="card-flat" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <MessageSquare size={20} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Active Chats</span>
                <h3 style={{ fontSize: '24px', color: '#0f172a', fontWeight: 700 }}>{activeChatsCount}</h3>
              </div>
            </div>

            <div className="card-flat" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                <Award size={20} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Shortlisted</span>
                <h3 style={{ fontSize: '24px', color: '#0f172a', fontWeight: 700 }}>
                  {activeApplications.filter(app => app.status === 'Shortlisted' || app.status === 'Interview').length}
                </h3>
              </div>
            </div>
          </div>

          {/* Kanban Candidate Pipeline Board */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '8px 0 0 0' }}>Candidate Pipeline</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="kanban-board-grid">
              {/* Column 1: Sourced */}
              <div className="kanban-column flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-1">
                  <span className="text-xs font-bold text-slate-800 uppercase">Sourced</span>
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                    {activeApplications.filter(app => app.status === 'Applied' || app.status === 'Reviewing').length}
                  </span>
                </div>
                {activeApplications.filter(app => app.status === 'Applied' || app.status === 'Reviewing').map(app => {
                  const job = jobs.find(j => j.id === app.jobId);
                  return (
                    <div key={app.id} className="bg-white border border-slate-250 rounded p-3.5 shadow-sm flex flex-col gap-2">
                      <div className="text-xs font-bold text-slate-800">{app.candidateProfile?.name || 'Candidate'}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">{job?.title || 'Job Opening'}</div>
                      <button 
                        onClick={() => {
                          setSelectedKanbanCandidate(app);
                          setShowCalendarModal(true);
                        }}
                        className="btn-primary py-1 px-3 text-[10px] mt-2 w-full text-center"
                      >
                        Schedule Interview
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Column 2: Interviewing */}
              <div className="kanban-column flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-1">
                  <span className="text-xs font-bold text-slate-800 uppercase">Interviewing</span>
                  <span className="bg-[#2563eb]/10 text-[#2563eb] text-[10px] font-bold px-2 py-0.5 rounded">
                    {activeApplications.filter(app => app.status === 'Interview' || app.status === 'Shortlisted').length}
                  </span>
                </div>
                {activeApplications.filter(app => app.status === 'Interview' || app.status === 'Shortlisted').map(app => {
                  const job = jobs.find(j => j.id === app.jobId);
                  return (
                    <div key={app.id} className="bg-white border border-slate-250 rounded p-3.5 shadow-sm flex flex-col gap-2">
                      <div className="text-xs font-bold text-slate-800">{app.candidateProfile?.name || 'Candidate'}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">{job?.title || 'Job Opening'}</div>
                      <button 
                        onClick={() => updateApplicationStatus(app.id, 'Offered')}
                        className="btn-accent py-1 px-3 text-[10px] mt-2 w-full text-center border-[#2563eb] text-[#2563eb] hover:bg-blue-50"
                      >
                        Send Offer
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Column 3: Offered */}
              <div className="kanban-column flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-1">
                  <span className="text-xs font-bold text-slate-800 uppercase">Offered</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    {activeApplications.filter(app => app.status === 'Offered').length}
                  </span>
                </div>
                {activeApplications.filter(app => app.status === 'Offered').map(app => {
                  const job = jobs.find(j => j.id === app.jobId);
                  return (
                    <div key={app.id} className="bg-white border border-slate-250 rounded p-3.5 shadow-sm flex flex-col gap-2">
                      <div className="text-xs font-bold text-slate-800">{app.candidateProfile?.name || 'Candidate'}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">{job?.title || 'Job Opening'}</div>
                      <button 
                        onClick={() => updateApplicationStatus(app.id, 'Hired')}
                        className="btn-primary bg-emerald-600 hover:bg-emerald-700 border-none py-1 px-3 text-[10px] mt-2 w-full text-center"
                      >
                        Confirm Hire
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Column 4: Hired */}
              <div className="kanban-column flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-1">
                  <span className="text-xs font-bold text-slate-800 uppercase">Hired</span>
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {activeApplications.filter(app => app.status === 'Hired').length}
                  </span>
                </div>
                {activeApplications.filter(app => app.status === 'Hired').map(app => {
                  const job = jobs.find(j => j.id === app.jobId);
                  return (
                    <div key={app.id} className="bg-emerald-50/50 border border-emerald-100 rounded p-3.5 shadow-sm flex flex-col gap-2">
                      <div className="text-xs font-bold text-emerald-800">{app.candidateProfile?.name || 'Candidate'}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">{job?.title || 'Job Opening'}</div>
                      <div className="text-[10px] text-emerald-700 font-bold bg-emerald-100/50 p-1.5 rounded text-center mt-2">
                        🎉 Hired Successfully
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recruiter Profile Details Card */}
          <div className="card-flat" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 750, color: '#0f172a', marginBottom: '16px' }}>Verified Company Profile</h3>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}>
                {recruiterProfile.companyName.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: '#0f172a', fontSize: '16px', margin: 0 }}>{recruiterProfile.companyName}</h4>
                <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>Representative: {recruiterProfile.recruiterName}</p>
                <p style={{ color: '#64748b', fontSize: '12px', marginTop: '6px', fontStyle: 'italic' }}>"{recruiterProfile.bio}"</p>
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

          {/* Admin section: All Registered Candidates */}
          {user?.email === 'raj_athwal' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                👥 Registered Candidates ({allCandidates.length})
              </h3>
              {allCandidates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
                  No candidates registered yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {allCandidates.map((cand, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', textAlign: 'left' }}>
                      
                      {/* Candidate Header Summary */}
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'start', flexWrap: 'wrap' }}>
                        <div className="avatar" style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--tech-orange) 0%, #1A3E62 100%)',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
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
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, margin: 0 }}>{cand.name || 'Anonymous User'}</h4>
                          <span style={{ fontSize: '11px', color: 'var(--tech-orange)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginTop: '4px' }}>
                            ⚡ {cand.experience || 'Entry-level'}
                          </span>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                            {cand.bio || 'No biography details provided.'}
                          </p>
                        </div>
                        
                        {/* Contact details badge card */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div>✉️ <strong>{cand.email}</strong></div>
                          <div>📞 <strong>{cand.phone || 'No phone number'}</strong></div>
                          <div>📄 <strong>{cand.resumeName || 'No resume uploaded'}</strong></div>
                        </div>
                      </div>

                      {/* Detailed sections: Skills, Academics, Work History, Certifications */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                        
                        {/* Column 1: Skills & Preferences */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Key Skills</span>
                            {cand.skills && cand.skills.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {cand.skills.map((s: string) => (
                                  <span key={s} className="badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '10px', padding: '3px 8px', borderRadius: '4px' }}>
                                    {s}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>None selected</span>
                            )}
                          </div>
                          
                          {cand.preferences && (
                            <div style={{ marginTop: '4px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Preferences</span>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                <div>🏡 Mode: {cand.preferences.mode?.join(', ') || 'Any'}</div>
                                <div>💼 Type: {cand.preferences.type?.join(', ') || 'Any'}</div>
                                <div>💰 Target: ₹{cand.preferences.minSalary?.toLocaleString()}/mo</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Column 2: Academics */}
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Education / Academics</span>
                          {cand.academicsList && cand.academicsList.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {cand.academicsList.map((ac: any, i: number) => (
                                <div key={i} style={{ fontSize: '12px', background: 'rgba(255,255,255,0.01)', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                  <strong style={{ color: '#fff' }}>{ac.degree}</strong>
                                  <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>{ac.school} ({ac.year}) • {ac.grade}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No education data provided.</span>
                          )}
                        </div>

                        {/* Column 3: Work Experiences */}
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Work Experience</span>
                          {cand.workExperiences && cand.workExperiences.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {cand.workExperiences.map((we: any, i: number) => (
                                <div key={i} style={{ fontSize: '12px', background: 'rgba(255,255,255,0.01)', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                  <strong style={{ color: '#fff' }}>{we.role}</strong> at <span style={{ color: 'var(--tech-orange)' }}>{we.company}</span>
                                  <div style={{ color: 'var(--text-muted)', fontSize: '10.5px', margin: '2px 0 4px 0' }}>{we.duration}</div>
                                  <div style={{ color: 'var(--text-secondary)', fontSize: '11px', lineHeight: 1.4 }}>{we.description}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No work experiences provided.</span>
                          )}
                        </div>

                        {/* Column 4: Certifications */}
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Certifications</span>
                          {cand.certifications && cand.certifications.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {cand.certifications.map((cer: any, i: number) => (
                                <div key={i} style={{ fontSize: '12px', background: 'rgba(255,255,255,0.01)', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                  <strong style={{ color: '#fff' }}>{cer.name}</strong>
                                  <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>Issuer: {cer.issuer} ({cer.year})</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No certifications provided.</span>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Admin section: Google Sheet Integration */}
          {user?.email === 'raj_athwal' && (
            <div className="glass-panel" style={{ padding: '24px', marginTop: '24px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📊 Google Sheets Integration
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Automatically stream registered candidate and recruiter data to a Google Sheet. Follow the instructions below to configure.
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    className="glass-input"
                    style={{ flex: 1, minWidth: '280px' }}
                  />
                  <button onClick={handleSaveSheetConfig} className="btn btn-primary" style={{ padding: '10px 20px' }}>
                    Save Configuration
                  </button>
                  {sheetUrl && (
                    <button onClick={handleSyncAllSheets} className="btn btn-outline" style={{ padding: '10px 20px' }}>
                      Sync All Existing Users
                    </button>
                  )}
                </div>

                {/* Setup Instructions Accordion */}
                <details style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '12px 16px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#fff', fontSize: '13.5px' }}>
                    📖 Step-by-Step Configuration Guide & Apps Script Code
                  </summary>
                  <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '12px', lineHeight: 1.6 }}>
                    <div>
                      1. Create a new Google Sheet. Rename the first sheet tab to <strong>Candidates</strong> and create a second sheet tab named <strong>Recruiters</strong>.
                    </div>
                    <div>
                      2. From the top menu, go to <strong>Extensions &gt; Apps Script</strong>.
                    </div>
                    <div>
                      3. Delete any default code in the editor, and paste the following Google Apps Script code:
                      <pre style={{ background: '#090714', padding: '14px', borderRadius: '6px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--tech-orange)', fontSize: '11px', marginTop: '6px' }}>
{`function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheetName = data.role === 'candidate' ? 'Candidates' : 'Recruiters';
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (data.role === 'candidate') {
        sheet.appendRow(['Registered At', 'ID', 'Name', 'Email', 'Phone', 'Experience', 'Bio', 'Skills']);
      } else {
        sheet.appendRow(['Registered At', 'ID', 'Name', 'Email', 'Phone', 'Company Name', 'Bio']);
      }
    }
    
    var timestamp = new Date();
    if (data.role === 'candidate') {
      sheet.appendRow([
        timestamp,
        data.id || '',
        data.name || '',
        data.email || '',
        data.phone || '',
        data.experience || 'Entry-level',
        data.bio || '',
        (data.skills || []).join(', ')
      ]);
    } else {
      sheet.appendRow([
        timestamp,
        data.id || '',
        data.name || '',
        data.email || '',
        data.phone || '',
        data.companyName || '',
        data.bio || ''
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`}
                      </pre>
                    </div>
                    <div>
                      4. Click the <strong>Save</strong> icon. Then click <strong>Deploy &gt; New Deployment</strong>.
                    </div>
                    <div>
                      5. Select gear icon ⚙️ next to Select type, choose <strong>Web App</strong>. Set description, set "Execute as" to <strong>Me</strong>, and set "Who has access" to <strong>Anyone</strong> (critical so the server can push registrations).
                    </div>
                    <div>
                      6. Click <strong>Deploy</strong>, authorize Google permissions if prompted, copy the generated <strong>Web App URL</strong>, paste it into the field above, and click <strong>Save Configuration</strong>.
                    </div>
                  </div>
                </details>

              </div>
            </div>
          )}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ 
                            fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px',
                            background: `rgba(${calculateMatchScore(candidateProfile.skills, manageActiveJob?.requirements || [], manageActiveJob?.skills || []).score >= 70 ? '16, 185, 129' : '245, 158, 11'}, 0.1)`,
                            color: calculateMatchScore(candidateProfile.skills, manageActiveJob?.requirements || [], manageActiveJob?.skills || []).score >= 70 ? '#10b981' : '#f59e0b',
                            border: `1px solid ${calculateMatchScore(candidateProfile.skills, manageActiveJob?.requirements || [], manageActiveJob?.skills || []).score >= 70 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                          }}>
                            ⚡ {calculateMatchScore(candidateProfile.skills, manageActiveJob?.requirements || [], manageActiveJob?.skills || []).score}% Match
                          </span>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--tech-orange)', textTransform: 'uppercase', lineHeight: '1.1', fontFamily: 'Outfit', letterSpacing: '0.5px' }}>
                            {candidateProfile.name ? candidateProfile.name.split(' ')[0] : 'Candidate'}<br/>
                            {candidateProfile.name ? candidateProfile.name.split(' ').slice(1).join(' ') : 'Name'}
                          </h2>
                          <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            width: '50px', height: '50px', borderRadius: '12px',
                            background: `rgba(${calculateMatchScore(candidateProfile.skills, manageActiveJob?.requirements || [], manageActiveJob?.skills || []).score >= 70 ? '16, 185, 129' : '245, 158, 11'}, 0.1)`,
                            border: `2px solid ${calculateMatchScore(candidateProfile.skills, manageActiveJob?.requirements || [], manageActiveJob?.skills || []).score >= 70 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                            color: calculateMatchScore(candidateProfile.skills, manageActiveJob?.requirements || [], manageActiveJob?.skills || []).score >= 70 ? '#10b981' : '#f59e0b'
                          }}>
                            <span style={{ fontSize: '18px', fontWeight: 800 }}>
                              {calculateMatchScore(candidateProfile.skills, manageActiveJob?.requirements || [], manageActiveJob?.skills || []).score}
                            </span>
                            <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' }}>Match</span>
                          </div>
                        </div>
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

      {/* Calendar Invitation Scheduling Modal */}
      {showCalendarModal && selectedKanbanCandidate && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1050,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              🗓️ Schedule Calendar Invite
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
              Select date and time to invite <strong>{selectedKanbanCandidate.candidateProfile?.name || 'Candidate'}</strong> for the <strong>{jobs.find(j => j.id === selectedKanbanCandidate.jobId)?.title || 'Role'}</strong> interview.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>Date</label>
                <input 
                  type="date" 
                  value={calendarDate} 
                  onChange={(e) => setCalendarDate(e.target.value)}
                  className="input-flat text-slate-800"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>Time</label>
                <input 
                  type="time" 
                  value={calendarTime} 
                  onChange={(e) => setCalendarTime(e.target.value)}
                  className="input-flat text-slate-800"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'end' }}>
              <button 
                onClick={() => setShowCalendarModal(false)}
                className="btn-ghost py-2 px-4 text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  updateApplicationStatus(selectedKanbanCandidate.id, 'Interview');
                  alert(`Calendar invite sent successfully to ${selectedKanbanCandidate.candidateProfile?.name || 'Candidate'} for ${calendarDate} at ${calendarTime}!`);
                  setShowCalendarModal(false);
                }}
                className="btn-primary py-2 px-4 text-xs"
              >
                Send Invite
              </button>
            </div>
          </div>
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

      {/* NOTIFICATIONS VIEW */}
      {activeTab === 'notifications' && (
        <NotificationsPage />
      )}

      {/* WORKSPACE VIEW - Recruiter Dashboard with Stats */}
      {activeTab === 'workspace' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Stats Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Active Jobs</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>{jobs.length}</div>
              <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>Live listings</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Applications</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--tech-orange)' }}>{applications.length}</div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>Total received</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Shortlisted</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>{applications.filter(a => a.status === 'Shortlisted' || a.status === 'Interview').length}</div>
              <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>Interviews scheduled</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Pending Review</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b' }}>{applications.filter(a => a.status === 'Reviewing').length}</div>
              <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600, marginTop: '4px' }}>Awaiting action</div>
            </div>
          </div>

          {/* Profile Card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>Company Profile</h3>
              <button
                onClick={() => setActiveTab('settings')}
                style={{
                  background: 'rgba(242,153,74,0.1)',
                  color: 'var(--tech-orange)',
                  border: '1px solid rgba(242,153,74,0.3)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Edit Profile
              </button>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #1A3E62, #F2994A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                💼
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{recruiterProfile.companyName || 'Your Company'}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{recruiterProfile.recruiterName || user?.name || 'Recruiter'}</div>
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>Recent Applications</h3>
              <button
                onClick={() => setActiveTab('manage')}
                style={{
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                View All →
              </button>
            </div>
            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '13px', margin: 0 }}>No applications received yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {applications.slice(0, 5).map(app => {
                  const job = jobs.find(j => j.id === app.jobId);
                  return (
                    <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #1A3E62, #F2994A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                        👤
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.candidateProfile?.name || 'Candidate'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{job?.title || 'Unknown Position'}</div>
                      </div>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '12px',
                        background: app.status === 'Shortlisted' ? 'rgba(16,185,129,0.15)' : app.status === 'Reviewing' ? 'rgba(242,153,74,0.15)' : 'rgba(255,255,255,0.05)',
                        color: app.status === 'Shortlisted' ? '#10b981' : app.status === 'Reviewing' ? 'var(--tech-orange)' : 'var(--text-secondary)'
                      }}>
                        {app.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setActiveTab('post-job')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: 'rgba(242,153,74,0.05)',
                  border: '1px solid rgba(242,153,74,0.15)',
                  borderRadius: '10px',
                  color: 'var(--tech-orange)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Plus size={16} />
                Post New Job
              </button>
              <button
                onClick={() => setActiveTab('chats')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: 'rgba(16,185,129,0.05)',
                  border: '1px solid rgba(16,185,129,0.15)',
                  borderRadius: '10px',
                  color: '#10b981',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <MessageSquare size={16} />
                View Chats
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Briefcase size={16} />
                Manage Jobs
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <span>📊</span>
                Full Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHATS VIEW - Active Chat Threads with Candidates */}
      {activeTab === 'chats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Active Conversations</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {applications.filter(a => a.chatHistory && a.chatHistory.length > 0).length} active
            </span>
          </div>

          {applications.filter(a => a.chatHistory && a.chatHistory.length > 0).length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '40px', textAlign: 'center', borderRadius: '14px' }}>
              <MessageSquare size={40} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0' }}>No active chats yet</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>Applications with chat messages will appear here</p>
            </div>
          ) : (
            applications
              .filter(a => a.chatHistory && a.chatHistory.length > 0)
              .sort((a, b) => {
                const aLastMsg = a.chatHistory[a.chatHistory.length - 1];
                const bLastMsg = b.chatHistory[b.chatHistory.length - 1];
                return new Date(bLastMsg.timestamp).getTime() - new Date(aLastMsg.timestamp).getTime();
              })
              .map(app => {
                const job = jobs.find(j => j.id === app.jobId);
                const lastMessage = app.chatHistory[app.chatHistory.length - 1];
                const isUnread = lastMessage.sender === 'candidate';
                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedJobId(app.jobId);
                      setSelectedAppId(app.id);
                      setActiveTab('manage');
                    }}
                    style={{
                      background: isUnread ? 'rgba(242,153,74,0.03)' : 'rgba(255,255,255,0.03)',
                      border: isUnread ? '1px solid rgba(242,153,74,0.3)' : '1px solid rgba(255,255,255,0.08)',
                      padding: '16px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #1A3E62, #F2994A)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        flexShrink: 0
                      }}>
                        👤
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{app.candidateProfile?.name || 'Candidate'}</span>
                          {isUnread && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--tech-orange)', flexShrink: 0 }} />}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{job?.title || 'Job Position'}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                            {lastMessage.sender === 'recruiter' ? 'You: ' : ''}{lastMessage.text}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px' }}>
                            {new Date(lastMessage.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
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
          { id: 'workspace', label: 'Workspace', icon: '📊' },
          { id: 'overview', label: 'Dashboard', icon: '🏠' },
          { id: 'post-job', label: 'Post Job', icon: '➕' },
          { id: 'chats', label: 'Chats', icon: '💬' },
          { id: 'manage', label: 'Manage', icon: '📁' },
          { id: 'notifications', label: 'Alerts', icon: '🔔' }
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
