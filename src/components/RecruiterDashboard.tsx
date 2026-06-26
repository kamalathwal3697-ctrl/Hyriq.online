import React, { useState, useEffect } from 'react';
import { Briefcase, Users, MessageSquare, Plus, Check, X, Calendar, Award, Trash2 } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import type { Application } from '../context/AppContext';
import { ChatWindow } from './ChatWindow';

export const RecruiterDashboard: React.FC = () => {
  const {
    jobs,
    applications,
    recruiterProfile,
    candidateProfile,
    createJob,
    updateApplicationStatus,
    sendChatMessage,
    deleteJob
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'overview' | 'post-job' | 'manage'>('overview');

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

  // Manage listings states
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedAppId, setSelectedAppId] = useState<string>('');

  // Set default selected job
  useEffect(() => {
    const recruiterJobs = jobs.filter(j => j.recruiterId === 'rec-1');
    if (recruiterJobs.length > 0 && !selectedJobId) {
      setSelectedJobId(recruiterJobs[0].id);
    }
  }, [jobs, selectedJobId]);

  // Recruiter posted jobs
  const myJobs = jobs.filter(job => job.recruiterId === 'rec-1');
  const activeApplications = applications.filter(app => 
    myJobs.some(j => j.id === app.jobId)
  );

  // Active Chats count
  const activeChatsCount = activeApplications.filter(app => app.chatHistory.length > 0).length;

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobSalary.trim() || !jobDesc.trim()) return;

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
      benefits: benefits.length > 0 ? benefits : ['Flexible hours.']
    });

    // Reset Form
    setJobTitle('');
    setJobSalary('');
    setJobLoc('');
    setJobSkills([]);
    setJobDesc('');
    setReqsText('');
    setBenefitsText('');

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
                placeholder="e.g. $80,000 - $110,000 / yr, $40 - $60 / hr"
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
                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>{candidateProfile.name}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{candidateProfile.email} • {candidateProfile.phone}</p>
                        <p style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>Experience: {candidateProfile.experience}</p>
                      </div>
                      <div className="avatar" style={{ width: '50px', height: '50px', fontSize: '18px', background: 'var(--primary-gradient)' }}>
                        {candidateProfile.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>BIO / INTRO</label>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5' }}>{candidateProfile.bio}</p>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>CANDIDATE SKILLS</label>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {candidateProfile.skills.map(s => (
                          <span key={s} className="badge badge-secondary" style={{ fontSize: '11px', borderRadius: '4px' }}>{s}</span>
                        ))}
                      </div>
                    </div>

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
    </div>
  );
};
