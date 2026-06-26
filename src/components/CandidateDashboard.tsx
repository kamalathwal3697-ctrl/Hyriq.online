import React, { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Briefcase, Filter, UserCheck, MessageCircle, FileText, Plus, X } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import type { Job, Application } from '../context/AppContext';
import { ChatWindow } from './ChatWindow';
import { OnboardingModal } from './OnboardingModal';

export const CandidateDashboard: React.FC = () => {
  const {
    jobs,
    applications,
    candidateProfile,
    setCandidateProfile,
    applyForJob,
    sendChatMessage
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'explore' | 'applications' | 'profile'>('explore');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [modeFilter, setModeFilter] = useState<string[]>([]);
  const [experienceFilter, setExperienceFilter] = useState<string[]>([]);
  const [matchesOnly, setMatchesOnly] = useState(false);

  const calculateMatchScore = (job: Job) => {
    if (!candidateProfile.preferences || !candidateProfile.onboardingCompleted) return 0;
    const prefs = candidateProfile.preferences;
    let score = 0;

    // 1. Work Mode Compatibility (30 points)
    if (prefs.mode.length === 0 || prefs.mode.includes(job.mode)) {
      score += 30;
    }

    // 2. Job Type Compatibility (25 points)
    if (prefs.type.length === 0 || prefs.type.includes(job.type)) {
      score += 25;
    }

    // 3. Experience Compatibility (15 points)
    if (prefs.experience === job.experience) {
      score += 15;
    } else if (
      (prefs.experience === 'Mid-level' && job.experience === 'Entry-level') ||
      (prefs.experience === 'Senior-level' && job.experience !== 'Senior-level')
    ) {
      score += 8;
    }

    // 4. Skills Compatibility (30 points)
    if (job.skills.length > 0) {
      const matchCount = job.skills.filter(s => 
        candidateProfile.skills.some(cs => cs.toLowerCase() === s.toLowerCase())
      ).length;
      score += Math.round((matchCount / job.skills.length) * 30);
    } else {
      score += 30;
    }

    return Math.min(100, score);
  };

  // Selected details
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  
  // Profile edit states
  const [profileName, setProfileName] = useState(candidateProfile.name);
  const [profileEmail, setProfileEmail] = useState(candidateProfile.email);
  const [profilePhone, setProfilePhone] = useState(candidateProfile.phone);
  const [profileBio, setProfileBio] = useState(candidateProfile.bio);
  const [newSkill, setNewSkill] = useState('');
  const [profileExperience, setProfileExperience] = useState(candidateProfile.experience);
  const [profileSaved, setProfileSaved] = useState(false);

  // Load queries from landing page redirect
  useEffect(() => {
    const landingSearch = localStorage.getItem('hyriq_landing_search');
    const landingLocation = localStorage.getItem('hyriq_landing_location');
    const landingCategory = localStorage.getItem('hyriq_landing_category');

    if (landingSearch) {
      setSearchQuery(landingSearch);
      localStorage.removeItem('hyriq_landing_search');
    }
    if (landingLocation) {
      setLocationQuery(landingLocation);
      localStorage.removeItem('hyriq_landing_location');
    }
    if (landingCategory) {
      setCategoryFilter(landingCategory);
      localStorage.removeItem('hyriq_landing_category');
    }
  }, []);

  // Update details panel selection if jobs list changes
  useEffect(() => {
    if (jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs, selectedJob]);

  // Keep selected application updated with latest chat from global state
  const currentApp = applications.find(app => app.id === selectedApp?.id) || null;

  // Toggle checklist filters
  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  // Filter Jobs logic
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLocation = locationQuery === '' || 
      job.location.toLowerCase().includes(locationQuery.toLowerCase()) ||
      job.mode.toLowerCase().includes(locationQuery.toLowerCase());

    const matchesCategory = categoryFilter === '' || 
      (categoryFilter === 'Tech & Engineering' && (job.title.includes('Engineer') || job.skills.includes('React') || job.skills.includes('TypeScript') || job.skills.includes('Node.js'))) ||
      (categoryFilter === 'Design & Product' && (job.title.includes('Design') || job.skills.includes('UI Design') || job.skills.includes('Figma'))) ||
      (categoryFilter === 'Marketing & Content' && (job.title.includes('Marketing') || job.title.includes('Content') || job.skills.includes('Copywriting') || job.skills.includes('SEO'))) ||
      (categoryFilter === 'Sales & Operations' && (job.title.includes('Sales') || job.title.includes('Operations') || job.title.includes('Advocate')));

    const matchesType = typeFilter.length === 0 || typeFilter.includes(job.type);
    const matchesMode = modeFilter.length === 0 || modeFilter.includes(job.mode);
    const matchesExperience = experienceFilter.length === 0 || experienceFilter.includes(job.experience);

    const matchesPreferenceQuiz = !matchesOnly || calculateMatchScore(job) >= 70;

    return matchesSearch && matchesLocation && matchesCategory && matchesType && matchesMode && matchesExperience && matchesPreferenceQuiz;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (candidateProfile.onboardingCompleted) {
      return calculateMatchScore(b) - calculateMatchScore(a);
    }
    return 0;
  });

  const handleApply = (jobId: string) => {
    applyForJob(jobId);
    // Trigger visual notification or alert
    alert('Applied successfully! Recruiter has been notified.');
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCandidateProfile({
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
      bio: profileBio,
      skills: candidateProfile.skills,
      experience: profileExperience,
      resumeName: candidateProfile.resumeName
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim() || candidateProfile.skills.includes(newSkill.trim())) return;
    setCandidateProfile(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()]
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    setCandidateProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'Applied': return <span className="badge badge-primary">Applied</span>;
      case 'Reviewing': return <span className="badge badge-warning">Under Review</span>;
      case 'Shortlisted': return <span className="badge badge-success">Shortlisted</span>;
      case 'Interview': return <span className="badge badge-secondary" style={{ animation: 'pulseGlow 2s infinite' }}>Interview Scheduled</span>;
      case 'Offered': return <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.25)', border: '1px solid var(--success)' }}>Job Offered 🎉</span>;
      case 'Rejected': return <span className="badge badge-danger">Closed</span>;
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
      {/* Onboarding Preference Overlay */}
      {candidateProfile.onboardingCompleted === false && (
        <OnboardingModal profile={candidateProfile} onSaveProfile={setCandidateProfile} />
      )}
      {/* Dashboard Subheader Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>Welcome back, {candidateProfile.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Let's land your dream workspace.</p>
        </div>

        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            <Briefcase size={16} />
            Explore Jobs
          </button>
          <button 
            className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <MessageCircle size={16} />
            Applications ({applications.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FileText size={16} />
            My Profile
          </button>
        </div>
      </div>

      {/* EXPLORE JOBS VIEW */}
      {activeTab === 'explore' && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }} className="explore-grid">
          {/* Filters Sidebar */}
          <aside className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <Filter size={16} color="var(--primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>Filters</h3>
            </div>

            {/* Category Filter */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Category</label>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="glass-input" 
                style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px' }}
              >
                <option value="">All Categories</option>
                <option value="Tech & Engineering">Tech & Engineering</option>
                <option value="Design & Product">Design & Product</option>
                <option value="Marketing & Content">Marketing & Content</option>
                <option value="Sales & Operations">Sales & Operations</option>
              </select>
            </div>

            {/* Mode Filter */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Work Mode</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Remote', 'Hybrid', 'On-site'].map(mode => (
                  <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={modeFilter.includes(mode)} 
                      onChange={() => toggleFilter(modeFilter, setModeFilter, mode)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    {mode}
                  </label>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Job Type</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Full-time', 'Part-time', 'Internship', 'Contract'].map(type => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={typeFilter.includes(type)} 
                      onChange={() => toggleFilter(typeFilter, setTypeFilter, type)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Experience</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Entry-level', 'Mid-level', 'Senior-level'].map(exp => (
                  <label key={exp} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={experienceFilter.includes(exp)} 
                      onChange={() => toggleFilter(experienceFilter, setExperienceFilter, exp)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    {exp}
                  </label>
                ))}
              </div>
            </div>

            {/* Reset Filters */}
            <button 
              className="btn btn-outline" 
              style={{ fontSize: '12px', padding: '8px 16px' }}
              onClick={() => {
                setCategoryFilter('');
                setTypeFilter([]);
                setModeFilter([]);
                setExperienceFilter([]);
                setSearchQuery('');
                setLocationQuery('');
              }}
            >
              Reset All Filters
            </button>
          </aside>

          {/* Main Job Listing + Detail Split */}
          <main style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }} className="explore-main">
            {/* Job List Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Inline Search Bar */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '8px' }} className="glass-panel">
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '10px 14px', gap: '8px' }}>
                    <Search size={16} color="var(--text-muted)" />
                    <input
                      type="text"
                      placeholder="Title or skill..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '13px', width: '100%' }}
                    />
                  </div>
                  <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '10px 14px', gap: '8px' }}>
                    <MapPin size={16} color="var(--text-muted)" />
                    <input
                      type="text"
                      placeholder="Remote/Location..."
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '13px', width: '100%' }}
                    />
                  </div>
                </div>

                {candidateProfile.onboardingCompleted && (
                  <button
                    type="button"
                    onClick={() => setMatchesOnly(!matchesOnly)}
                    className="btn animate-glow"
                    style={{
                      padding: '10px 16px',
                      fontSize: '13px',
                      background: matchesOnly ? 'var(--secondary-gradient)' : 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                      borderRadius: '12px',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: matchesOnly ? '0 0 10px rgba(6, 182, 212, 0.3)' : 'none'
                    }}
                  >
                    ⚡ Matches Only: {matchesOnly ? 'ON' : 'OFF'}
                  </button>
                )}
              </div>

              {sortedJobs.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No matching jobs found. Try adjusting your filters.
                </div>
              ) : (
                sortedJobs.map(job => {
                  const hasApplied = applications.some(app => app.jobId === job.id && app.candidateId === 'cand-1');
                  const isSelected = selectedJob?.id === job.id;
                  return (
                    <div 
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`glass-panel ${isSelected ? 'active-job-card' : 'glass-panel-hover'}`}
                      style={{
                        padding: '20px',
                        cursor: 'pointer',
                        border: isSelected ? '1px solid var(--border-color-active)' : '1px solid var(--border-color)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card)',
                        boxShadow: isSelected ? '0 0 15px rgba(99, 102, 241, 0.15)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '2px' }}>{job.title}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>{job.companyName}</p>
                        </div>
                        {/* Custom Gradient Avatar */}
                        <div className="avatar" style={{
                          background: `linear-gradient(135deg, #${job.logoSeed.charCodeAt(0).toString(16)}6df2 0%, #a855f7 100%)`
                        }}>
                          {job.logoSeed}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                        <span className="badge badge-primary">{job.mode}</span>
                        <span className="badge badge-secondary">{job.type}</span>
                        <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.06)' }}>{job.salary}</span>
                        
                        {candidateProfile.onboardingCompleted && (
                          <span className="badge" style={{
                            background: calculateMatchScore(job) >= 75 ? 'var(--secondary-gradient)' : 'rgba(255, 255, 255, 0.03)',
                            border: calculateMatchScore(job) >= 75 ? 'none' : '1px solid var(--border-color)',
                            color: '#fff',
                            fontWeight: 700
                          }}>
                            ⚡ {calculateMatchScore(job)}% Match
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '12px' }}>
                        {job.skills.slice(0, 3).map(skill => (
                          <span key={skill} style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>{skill}</span>
                        ))}
                        {job.skills.length > 3 && <span style={{ fontSize: '10px', color: 'var(--text-muted)', alignSelf: 'center' }}>+{job.skills.length - 3} more</span>}
                      </div>

                      {hasApplied && (
                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '12px', fontWeight: 600 }}>
                          <UserCheck size={12} /> Applied
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Job Details Panel */}
            <div style={{ position: 'sticky', top: '100px' }}>
              {selectedJob ? (
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Header */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                      <div>
                        <span className="badge badge-primary" style={{ marginBottom: '8px' }}>{selectedJob.experience}</span>
                        <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{selectedJob.title}</h3>
                        <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '15px' }}>{selectedJob.companyName}</p>
                      </div>
                      <div className="avatar" style={{
                        width: '50px',
                        height: '50px',
                        fontSize: '18px',
                        background: `linear-gradient(135deg, #${selectedJob.logoSeed.charCodeAt(0).toString(16)}6df2 0%, #a855f7 100%)`
                      }}>
                        {selectedJob.logoSeed}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <MapPin size={14} color="var(--text-muted)" /> Location: {selectedJob.location} ({selectedJob.mode})
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <DollarSign size={14} color="var(--text-muted)" /> Compensation: {selectedJob.salary}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <Briefcase size={14} color="var(--text-muted)" /> Job Type: {selectedJob.type}
                      </div>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Required Skills</h4>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {selectedJob.skills.map(skill => (
                        <span key={skill} className="badge badge-secondary" style={{ borderRadius: '6px' }}>{skill}</span>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Job Description</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>{selectedJob.description}</p>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>What you will bring</h4>
                    <ul style={{ paddingLeft: '16px', color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedJob.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Perks & Benefits</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {selectedJob.benefits.map((benefit, i) => (
                        <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                          ✨ {benefit}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Apply Actions */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', gap: '12px' }}>
                    {applications.some(app => app.jobId === selectedJob.id && app.candidateId === 'cand-1') ? (
                      <button className="btn btn-outline" style={{ flex: 1 }} disabled>
                        Applied ✓
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleApply(selectedJob.id)} 
                        className="btn btn-primary animate-glow" 
                        style={{ flex: 1 }}
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Select a job card to view its full details.
                </div>
              )}
            </div>
          </main>
        </div>
      )}

      {/* APPLICATIONS VIEW */}
      {activeTab === 'applications' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }} className="applications-grid">
          {/* Applications list */}
          <aside className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              My Applications
            </h3>
            {applications.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                You haven't applied to any jobs yet. Check "Explore Jobs"!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {applications.map(app => {
                  const job = jobs.find(j => j.id === app.jobId);
                  const isSelected = selectedApp?.id === app.id;
                  if (!job) return null;

                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className="glass-panel glass-panel-hover"
                      style={{
                        padding: '16px',
                        cursor: 'pointer',
                        border: isSelected ? '1px solid var(--border-color-active)' : '1px solid var(--border-color)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                          <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{job.title}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{job.companyName}</p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span>Applied: {app.appliedDate}</span>
                        {app.chatHistory.length > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                            <MessageCircle size={10} /> Active chat
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </aside>

          {/* Chat Window Panel */}
          <main>
            {currentApp ? (
              <div>
                {/* Job info header */}
                <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Chatting about</span>
                    <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>
                      {jobs.find(j => j.id === currentApp.jobId)?.title} at {jobs.find(j => j.id === currentApp.jobId)?.companyName}
                    </h4>
                  </div>
                  <div>
                    {getStatusBadge(currentApp.status)}
                  </div>
                </div>

                <ChatWindow
                  chatHistory={currentApp.chatHistory}
                  currentRole="candidate"
                  onSendMessage={(text) => sendChatMessage(currentApp.id, text, 'candidate')}
                  title={`Sarah Jenkins (Recruiter)`}
                />
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <MessageCircle size={40} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
                <h3>Employer Direct Chat</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Select an application from the sidebar to view status and chat directly with recruiters.
                </p>
              </div>
            )}
          </main>
        </div>
      )}

      {/* PROFILE VIEW */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }} className="profile-grid">
          {/* Main Info Card */}
          <main className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              Candidate Information
            </h3>

            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={profileName} 
                    onChange={(e) => setProfileName(e.target.value)}
                    className="glass-input" 
                    required 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Experience Tier</label>
                  <select 
                    value={profileExperience}
                    onChange={(e) => setProfileExperience(e.target.value)}
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
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
                  <input 
                    type="email" 
                    value={profileEmail} 
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="glass-input" 
                    required 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Phone Number</label>
                  <input 
                    type="tel" 
                    value={profilePhone} 
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="glass-input" 
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Bio / Intro</label>
                <textarea 
                  value={profileBio} 
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="glass-input" 
                  rows={4}
                  style={{ resize: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-primary">Save Profile Info</button>
                
                {candidateProfile.onboardingCompleted && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setCandidateProfile(prev => ({ ...prev, onboardingCompleted: false }));
                      alert('Preferences reset! You will be guided to the onboarding vibe setup.');
                    }}
                    className="btn btn-outline" 
                    style={{ borderColor: 'rgba(244, 63, 94, 0.3)', color: '#fda4af' }}
                  >
                    Reset Onboarding Quiz
                  </button>
                )}

                {profileSaved && <span style={{ color: 'var(--success)', fontSize: '13px', fontWeight: 600 }}>✓ Changes saved in state</span>}
              </div>
            </form>
          </main>

          {/* Sidebar Skills & Resume */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Skills Card */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                My Skills
              </h4>

              {/* Skill chips */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {candidateProfile.skills.map(skill => (
                  <span 
                    key={skill} 
                    className="badge badge-secondary" 
                    style={{ gap: '6px', paddingRight: '6px', fontSize: '12px' }}
                  >
                    {skill}
                    <button 
                      onClick={() => handleRemoveSkill(skill)}
                      style={{ border: 'none', background: 'transparent', color: '#67e8f9', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Skill form */}
              <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={newSkill} 
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g. Next.js, SQL..." 
                  className="glass-input"
                  style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                />
                <button type="submit" className="btn btn-outline" style={{ padding: '0 12px', borderRadius: '12px' }}>
                  <Plus size={16} />
                </button>
              </form>
            </div>

            {/* Resume Uploader Mock */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                Resume
              </h4>
              <div style={{
                border: '1px dashed var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.01)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <FileText size={32} color="var(--primary)" />
                <div>
                  <p style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{candidateProfile.resumeName}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>PDF format (1.2 MB)</p>
                </div>
                <button 
                  onClick={() => alert('Resume upload simulated. File updated in candidate profile!')}
                  className="btn btn-outline" 
                  style={{ fontSize: '12px', padding: '8px 16px', width: '100%' }}
                >
                  Upload New CV
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
