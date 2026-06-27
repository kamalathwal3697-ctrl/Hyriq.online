import React, { useState, useEffect } from 'react';
import { Search, MapPin, IndianRupee, Briefcase, Filter, UserCheck, MessageCircle, FileText, Plus, X, Sparkles } from 'lucide-react';
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

  const [activeTab, setActiveTab] = useState<'explore' | 'applications' | 'profile' | 'govt'>('explore');
  const [detailsTab, setDetailsTab] = useState<'info' | 'pact'>('info');
  const [showApplyPactModal, setShowApplyPactModal] = useState(false);
  const [pactChecked, setPactChecked] = useState(false);
  const [typedSignature, setTypedSignature] = useState('');
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractApp, setContractApp] = useState<Application | null>(null);

  // Government Jobs States
  const [govtJobs, setGovtJobs] = useState<any[]>([]);
  const [selectedGovtJob, setSelectedGovtJob] = useState<any | null>(null);
  const [govtJobsLoading, setGovtJobsLoading] = useState(false);
  const [govtJobsError, setGovtJobsError] = useState('');
  const [selectedGovtJobDetails, setSelectedGovtJobDetails] = useState('');
  const [govtJobDetailsLoading, setgovtJobDetailsLoading] = useState(false);

  // Fetch Government Job Details when a card is selected
  useEffect(() => {
    if (selectedGovtJob) {
      setSelectedGovtJobDetails('');
      setgovtJobDetailsLoading(true);
      fetch(`/api/govt-jobs/details?url=${encodeURIComponent(selectedGovtJob.applyLink)}`)
        .then(res => {
          if (!res.ok) throw new Error('Details not found');
          return res.json();
        })
        .then(data => {
          setSelectedGovtJobDetails(data.html);
          setgovtJobDetailsLoading(false);
        })
        .catch(() => {
          setSelectedGovtJobDetails('');
          setgovtJobDetailsLoading(false);
        });
    } else {
      setSelectedGovtJobDetails('');
    }
  }, [selectedGovtJob]);

  // Fetch Government Jobs on tab activation
  useEffect(() => {
    if (activeTab === 'govt' && govtJobs.length === 0) {
      setGovtJobsLoading(true);
      setGovtJobsError('');
      fetch('/api/govt-jobs')
        .then(res => {
          if (!res.ok) throw new Error('Failed to load government jobs');
          return res.json();
        })
        .then(data => {
          setGovtJobs(data);
          if (data.length > 0) setSelectedGovtJob(data[0]);
          setGovtJobsLoading(false);
        })
        .catch(err => {
          setGovtJobsError(err.message || 'Failed to load government jobs');
          setGovtJobsLoading(false);
        });
    }
  }, [activeTab]);

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

  useEffect(() => {
    setDetailsTab('info');
  }, [selectedJob]);

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

  const handleApply = (jobId: string, signature?: string) => {
    applyForJob(jobId, signature);
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

  const isLightMode = activeTab === 'explore' || activeTab === 'govt';

  return (
    <div 
      className="container animate-fade-in" 
      style={{ 
        paddingTop: '32px', 
        paddingBottom: '60px', 
        background: isLightMode ? '#F5F7FA' : 'transparent',
        minHeight: '100vh',
        color: isLightMode ? 'var(--corporate-blue)' : '#fff',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Onboarding Preference Overlay */}
        {candidateProfile.onboardingCompleted === false && (
          <OnboardingModal profile={candidateProfile} onSaveProfile={setCandidateProfile} />
        )}
        {/* Dashboard Subheader Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: isLightMode ? 'var(--corporate-blue)' : '#fff' }}>
              Welcome back, {candidateProfile.name}
            </h2>
            <p style={{ color: isLightMode ? '#475569' : 'var(--text-secondary)', fontSize: '14px' }}>
              Let's land your dream workspace.
            </p>
          </div>

          <div className="tabs-header" style={{ background: isLightMode ? 'rgba(26, 62, 98, 0.08)' : 'rgba(0, 0, 0, 0.2)', border: isLightMode ? '1px solid rgba(26, 62, 98, 0.1)' : '1px solid var(--border-color)' }}>
            <button 
              className={`tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
              onClick={() => setActiveTab('explore')}
              style={{ color: activeTab === 'explore' ? '#fff' : (isLightMode ? 'var(--corporate-blue)' : 'var(--text-secondary)'), background: activeTab === 'explore' ? 'var(--corporate-blue)' : 'transparent' }}
            >
              <Briefcase size={16} />
              Explore Jobs
            </button>
            <button 
              className={`tab-btn ${activeTab === 'govt' ? 'active' : ''}`}
              onClick={() => setActiveTab('govt')}
              style={{ color: activeTab === 'govt' ? '#fff' : (isLightMode ? 'var(--corporate-blue)' : 'var(--text-secondary)'), background: activeTab === 'govt' ? 'var(--corporate-blue)' : 'transparent' }}
            >
              🏛️ Govt Jobs
            </button>
            <button 
              className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
              style={{ color: activeTab === 'applications' ? '#fff' : (isLightMode ? 'var(--corporate-blue)' : 'var(--text-secondary)'), background: activeTab === 'applications' ? 'var(--corporate-blue)' : 'transparent' }}
            >
              <MessageCircle size={16} />
              Applications ({applications.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
              style={{ color: activeTab === 'profile' ? '#fff' : (isLightMode ? 'var(--corporate-blue)' : 'var(--text-secondary)'), background: activeTab === 'profile' ? 'var(--corporate-blue)' : 'transparent' }}
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
            <aside className="seeker-light-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(26, 62, 98, 0.1)', paddingBottom: '12px' }}>
                <Filter size={16} color="var(--tech-orange)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--corporate-blue)' }}>Filters</h3>
              </div>

              {/* Category Filter */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--corporate-blue)', display: 'block', marginBottom: '8px' }}>Category</label>
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="seeker-light-input" 
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px' }}
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
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--corporate-blue)', display: 'block', marginBottom: '8px' }}>Work Mode</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['Remote', 'Hybrid', 'On-site'].map(mode => (
                    <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>
                      <input 
                        type="checkbox" 
                        checked={modeFilter.includes(mode)} 
                        onChange={() => toggleFilter(modeFilter, setModeFilter, mode)}
                        style={{ accentColor: 'var(--tech-orange)' }}
                      />
                      {mode}
                    </label>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--corporate-blue)', display: 'block', marginBottom: '8px' }}>Job Type</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['Full-time', 'Part-time', 'Internship', 'Contract'].map(type => (
                    <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>
                      <input 
                        type="checkbox" 
                        checked={typeFilter.includes(type)} 
                        onChange={() => toggleFilter(typeFilter, setTypeFilter, type)}
                        style={{ accentColor: 'var(--tech-orange)' }}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--corporate-blue)', display: 'block', marginBottom: '8px' }}>Experience</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['Entry-level', 'Mid-level', 'Senior-level'].map(exp => (
                    <label key={exp} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>
                      <input 
                        type="checkbox" 
                        checked={experienceFilter.includes(exp)} 
                        onChange={() => toggleFilter(experienceFilter, setExperienceFilter, exp)}
                        style={{ accentColor: 'var(--tech-orange)' }}
                      />
                      {exp}
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              <button 
                className="btn btn-outline" 
                style={{ fontSize: '12px', padding: '8px 16px', borderColor: 'rgba(26, 62, 98, 0.2)', color: 'var(--corporate-blue)', fontWeight: 600 }}
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
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '8px', padding: '2px 8px' }} className="seeker-light-card">
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '10px 14px', gap: '8px' }}>
                    <Search size={16} color="var(--corporate-blue)" />
                    <input
                      type="text"
                      placeholder="Title or skill..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--corporate-blue)', fontSize: '13px', width: '100%', fontWeight: 500 }}
                    />
                  </div>
                  <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(26, 62, 98, 0.15)' }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '10px 14px', gap: '8px' }}>
                    <MapPin size={16} color="var(--corporate-blue)" />
                    <input
                      type="text"
                      placeholder="Remote/Location..."
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--corporate-blue)', fontSize: '13px', width: '100%', fontWeight: 500 }}
                    />
                  </div>
                </div>

                {candidateProfile.onboardingCompleted && (
                  <button
                    type="button"
                    onClick={() => setMatchesOnly(!matchesOnly)}
                    className="btn btn-seeker-active"
                    style={{
                      padding: '12px 18px',
                      fontSize: '13px',
                      borderRadius: '12px',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: matchesOnly ? 1 : 0.75,
                      background: matchesOnly ? 'var(--tech-orange)' : 'var(--corporate-blue)'
                    }}
                  >
                    ⚡ Matches Only: {matchesOnly ? 'ON' : 'OFF'}
                  </button>
                )}
              </div>

              {sortedJobs.length === 0 ? (
                <div className="seeker-light-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
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
                      className="seeker-light-card"
                      style={{
                        padding: '20px',
                        cursor: 'pointer',
                        border: isSelected ? '2px solid var(--tech-orange)' : '1px solid #E2E8F0',
                        background: isSelected ? 'rgba(242, 153, 74, 0.05)' : '#ffffff',
                        transform: isSelected ? 'translateY(-2px)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ color: 'var(--corporate-blue)', fontSize: '16px', fontWeight: 800, marginBottom: '2px' }}>{job.title}</h4>
                          <p style={{ color: '#475569', fontSize: '13px', fontWeight: 600 }}>{job.companyName}</p>
                        </div>
                        {/* Custom Gradient Avatar */}
                        <div className="avatar" style={{
                          background: `linear-gradient(135deg, #${job.logoSeed.charCodeAt(0).toString(16)}6df2 0%, #F2994A 100%)`
                        }}>
                          {job.logoSeed}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                        <span className="badge seeker-tag-blue">{job.mode}</span>
                        <span className="badge seeker-tag-blue">{job.type}</span>
                        <span className="badge seeker-tag-orange">{job.salary}</span>
                        
                        {job.fairWorkPact && (
                          <span className="badge" style={{
                            background: 'rgba(16, 185, 129, 0.08)',
                            border: '1px solid var(--success)',
                            color: '#10b981',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 700
                          }}>
                            🛡️ Fair Work Pact
                          </span>
                        )}

                        {candidateProfile.onboardingCompleted && (
                          <span className="badge seeker-tag" style={{
                            background: calculateMatchScore(job) >= 75 ? 'rgba(242, 153, 74, 0.15)' : 'rgba(26, 62, 98, 0.05)',
                            border: calculateMatchScore(job) >= 75 ? '1px solid var(--tech-orange)' : '1px solid rgba(26, 62, 98, 0.1)',
                            color: calculateMatchScore(job) >= 75 ? 'var(--tech-orange)' : 'var(--corporate-blue)',
                            fontWeight: 700
                          }}>
                            ⚡ {calculateMatchScore(job)}% Match
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid rgba(26,62,98,0.06)', paddingTop: '12px' }}>
                        {job.skills.slice(0, 3).map(skill => (
                          <span key={skill} style={{ fontSize: '11px', color: 'var(--corporate-blue)', background: 'rgba(26,62,98,0.05)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(26,62,98,0.08)', fontWeight: 500 }}>{skill}</span>
                        ))}
                        {job.skills.length > 3 && <span style={{ fontSize: '10px', color: '#64748b', alignSelf: 'center', fontWeight: 600 }}>+{job.skills.length - 3} more</span>}
                      </div>

                      {hasApplied && (
                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '12px', fontWeight: 700 }}>
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
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#0B0E14', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {/* Header */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                      <div>
                        <span className="badge badge-primary" style={{ marginBottom: '8px', background: 'rgba(242,153,74,0.15)', color: 'var(--tech-orange)', border: '1px solid rgba(242,153,74,0.3)' }}>{selectedJob.experience}</span>
                        <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>{selectedJob.title}</h3>
                        <p style={{ color: 'var(--tech-orange)', fontWeight: 700, fontSize: '15px' }}>{selectedJob.companyName}</p>
                      </div>
                      <div className="avatar" style={{
                        width: '50px',
                        height: '50px',
                        fontSize: '18px',
                        background: `linear-gradient(135deg, #1A3E62 0%, #F2994A 100%)`
                      }}>
                        {selectedJob.logoSeed}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <MapPin size={14} color="var(--text-muted)" /> Location: {selectedJob.location} ({selectedJob.mode})
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <IndianRupee size={14} color="var(--text-muted)" /> Compensation: {selectedJob.salary}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <Briefcase size={14} color="var(--text-muted)" /> Job Type: {selectedJob.type}
                      </div>
                    </div>
                  </div>

                  {/* Compatibility Score Widget */}
                  {candidateProfile.onboardingCompleted && (
                    <div style={{
                      background: 'linear-gradient(135deg, #132B45 0%, #1A3E62 100%)',
                      border: '1.5px solid rgba(242, 153, 74, 0.4)',
                      borderRadius: '16px',
                      padding: '20px',
                      color: '#fff',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      boxShadow: '0 8px 24px rgba(26, 62, 98, 0.3)'
                    }}>
                      <div style={{ flex: 1, zIndex: 2 }}>
                        <h5 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: 'var(--tech-orange)', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Compatibility Score
                        </h5>
                        <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.4' }}>
                          Based on work mode alignment, experience tier, job type, and key skills.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                          <span style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
                            {calculateMatchScore(selectedJob)}%
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            background: 'rgba(242, 153, 74, 0.2)',
                            color: 'var(--tech-orange)',
                            padding: '2px 8px',
                            borderRadius: '20px'
                          }}>
                            {calculateMatchScore(selectedJob) >= 80 ? 'High Vibe 🔥' : calculateMatchScore(selectedJob) >= 50 ? 'Good Vibe' : 'Low Alignment'}
                          </span>
                        </div>
                      </div>
                      
                      <img src="/logo.png" alt="Logo" className="animate-glow" style={{ width: '72px', height: '72px', borderRadius: '12px', objectFit: 'cover', zIndex: 1 }} />
                    </div>
                  )}

                  {/* Job Details Tabs */}
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '16px', marginBottom: '8px' }}>
                    <button
                      onClick={() => setDetailsTab('info')}
                      style={{
                        padding: '8px 0 12px 0',
                        background: 'transparent',
                        border: 'none',
                        color: detailsTab === 'info' ? 'var(--tech-orange)' : 'var(--text-secondary)',
                        borderBottom: detailsTab === 'info' ? '2px solid var(--tech-orange)' : 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                    >
                      Job Details
                    </button>
                    <button
                      onClick={() => setDetailsTab('pact')}
                      style={{
                        padding: '8px 0 12px 0',
                        background: 'transparent',
                        border: 'none',
                        color: detailsTab === 'pact' ? 'var(--tech-orange)' : 'var(--text-secondary)',
                        borderBottom: detailsTab === 'pact' ? '2px solid var(--tech-orange)' : 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      🛡️ Fair Work Pact {selectedJob.fairWorkPact && <span style={{ fontSize: '10px', color: 'var(--success)' }}>● Verified</span>}
                    </button>
                  </div>

                  {detailsTab === 'info' ? (
                    <>
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
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="glass-panel" style={{
                        background: 'rgba(16, 185, 129, 0.04)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        padding: '16px',
                        borderRadius: '12px'
                      }}>
                        <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '16px' }}>🛡️</span> Fair Work Pact Signed
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.5 }}>
                          Both the candidate and the employer commit to a mutual standard of respect, security, and accountability.
                        </p>
                      </div>

                      <div>
                        <h5 style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                          🛡️ Worker Rights (Employer Commitments)
                        </h5>
                        <ul style={{ paddingLeft: '16px', color: 'var(--text-secondary)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <li><strong>Fair Working Hours:</strong> Strict adherence to a standard, limited work schedule.</li>
                          <li><strong>Overtime Pay:</strong> Guaranteed extra compensation for any hours worked beyond the daily limit.</li>
                          <li><strong>Health & Well-being:</strong> Access to basic medical benefits and a safe working environment.</li>
                          <li><strong>Accommodation Support:</strong> Housing allowance or safe, provided accommodation where applicable.</li>
                          <li><strong>Job Security:</strong> Protection against unfair firing without valid cause or proper notice.</li>
                          <li><strong>Merit-Based Growth:</strong> Guaranteed salary raises or promotions upon successfully achieving predefined work targets.</li>
                        </ul>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                        <h5 style={{ color: 'var(--secondary)', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                          🤝 Worker Duties (Employee Commitments)
                        </h5>
                        <ul style={{ paddingLeft: '16px', color: 'var(--text-secondary)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <li><strong>Punctuality:</strong> Consistently arriving on time and respecting the work schedule.</li>
                          <li><strong>Prompt Communication:</strong> Timely and professional responses to all work-related messages or requests.</li>
                          <li><strong>Responsibility:</strong> Taking full ownership of assigned tasks and performing them diligently.</li>
                          <li><strong>Absolute Integrity:</strong> Honesty in reporting hours, tasks, and issues.</li>
                          <li><strong>Professional Conduct:</strong> Respectful behavior towards coworkers and clients.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Apply Actions */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', gap: '12px' }}>
                    {applications.some(app => app.jobId === selectedJob.id && app.candidateId === 'cand-1') ? (
                      <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                        <button className="btn btn-outline" style={{ flex: 1 }} disabled>
                          Applied ✓
                        </button>
                        {selectedJob.fairWorkPact && (
                          <button 
                            onClick={() => {
                              const matchingApp = applications.find(app => app.jobId === selectedJob.id && app.candidateId === 'cand-1');
                              if (matchingApp) {
                                setContractApp(matchingApp);
                                setShowContractModal(true);
                              }
                            }}
                            className="btn btn-primary animate-glow" 
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                          >
                            🛡️ View Pact Deed
                          </button>
                        )}
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          if (selectedJob.fairWorkPact) {
                            setPactChecked(false);
                            setTypedSignature('');
                            setShowApplyPactModal(true);
                          } else {
                            handleApply(selectedJob.id);
                          }
                        }} 
                        className="btn animate-glow" 
                        style={{ 
                          flex: 1, 
                          background: 'var(--tech-orange)', 
                          color: '#fff',
                          fontWeight: 700,
                          boxShadow: '0 4px 15px -3px rgba(242, 153, 74, 0.4)'
                        }}
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

      {/* GOVT JOBS VIEW */}
      {activeTab === 'govt' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }} className="explore-grid">
          {/* Left Column: Govt Jobs List */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--corporate-blue)' }}>
                Punjab Government Notifications (Live)
              </h3>
              <span className="seeker-tag" style={{ background: 'rgba(242, 153, 74, 0.1)', color: 'var(--tech-orange)', fontWeight: 600 }}>
                {govtJobs.length} Notifications Found
              </span>
            </div>

            {govtJobsLoading && (
              <div className="seeker-light-card" style={{ padding: '40px', textAlign: 'center' }}>
                <div className="animate-pulse" style={{ color: 'var(--corporate-blue)', fontWeight: 600 }}>
                  🔍 Fetching latest government job listings...
                </div>
              </div>
            )}

            {govtJobsError && (
              <div className="seeker-light-card" style={{ padding: '24px', borderLeft: '4px solid var(--danger)', color: 'red' }}>
                ⚠️ {govtJobsError}
              </div>
            )}

            {!govtJobsLoading && !govtJobsError && govtJobs.length === 0 && (
              <div className="seeker-light-card" style={{ padding: '40px', textAlign: 'center' }}>
                No active notifications found. Please check back later.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {govtJobs.map((job) => {
                const isSelected = selectedGovtJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    className={`seeker-light-card ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedGovtJob(job)}
                    style={{
                      padding: '16px',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid var(--tech-orange)' : '1px solid rgba(26, 62, 98, 0.1)',
                      boxShadow: isSelected ? '0 4px 12px rgba(26, 62, 98, 0.08)' : 'none',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <span className="seeker-tag" style={{ background: 'rgba(26, 62, 98, 0.08)', color: 'var(--corporate-blue)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {job.recruitmentBoard}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        Posted: {job.postDate}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--corporate-blue)', marginBottom: '8px', lineHeight: '1.4' }}>
                      {job.title}
                    </h4>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#475569' }}>
                      <div>
                        <strong>🎓 Qualification:</strong> {job.qualification}
                      </div>
                      {job.lastDate && (
                        <div>
                          <strong>📅 Last Date:</strong> {job.lastDate}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </main>

          {/* Right Column: Sticky Detail Panel */}
          <aside style={{ position: 'sticky', top: '24px' }}>
            {selectedGovtJob ? (
              <div className="seeker-light-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid rgba(26, 62, 98, 0.1)' }}>
                <div>
                  <span className="seeker-tag" style={{ background: 'rgba(26, 62, 98, 0.08)', color: 'var(--corporate-blue)', marginBottom: '12px', display: 'inline-block' }}>
                    {selectedGovtJob.recruitmentBoard}
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--corporate-blue)', lineHeight: '1.4' }}>
                    {selectedGovtJob.title}
                  </h3>
                </div>

                {govtJobDetailsLoading ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--corporate-blue)', fontWeight: 600 }}>
                    <div className="animate-pulse">
                      ⏳ Loading full notifications, fee details & vacancy tables from FreeJobAlert...
                    </div>
                  </div>
                ) : selectedGovtJobDetails ? (
                  <div 
                    className="govt-details-content"
                    dangerouslySetInnerHTML={{ __html: selectedGovtJobDetails }} 
                    style={{ 
                      maxHeight: '450px', 
                      overflowY: 'auto', 
                      padding: '16px', 
                      background: 'rgba(26, 62, 98, 0.02)', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(26, 62, 98, 0.08)',
                      color: 'var(--corporate-blue)'
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid rgba(26, 62, 98, 0.1)', borderBottom: '1px solid rgba(26, 62, 98, 0.1)', padding: '16px 0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '14px' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Advt No:</span>
                      <span style={{ color: 'var(--corporate-blue)' }}>{selectedGovtJob.advtNo || '—'}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '14px' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Qualification:</span>
                      <span style={{ color: 'var(--corporate-blue)', fontWeight: 600 }}>{selectedGovtJob.qualification}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '14px' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Last Date:</span>
                      <span style={{ color: 'var(--corporate-blue)', fontWeight: 600 }}>{selectedGovtJob.lastDate || '—'}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '14px' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Posted On:</span>
                      <span style={{ color: 'var(--corporate-blue)' }}>{selectedGovtJob.postDate}</span>
                    </div>
                  </div>
                )}

                <a
                  href={selectedGovtJob.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderColor: 'var(--corporate-blue)',
                    color: 'var(--corporate-blue)',
                    fontWeight: 600,
                    padding: '10px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    textAlign: 'center',
                    fontSize: '13px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Open Original Page on FreeJobAlert 🌐
                </a>
              </div>
            ) : (
              <div className="seeker-light-card" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                Select a notification to view application details.
              </div>
            )}
          </aside>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="no-print">
                    {jobs.find(j => j.id === currentApp.jobId)?.fairWorkPact && (
                      <button
                        onClick={() => {
                          setContractApp(currentApp);
                          setShowContractModal(true);
                        }}
                        className="btn btn-outline"
                        style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        🛡️ Legal Pact Deed
                      </button>
                    )}
                    {getStatusBadge(currentApp.status)}
                  </div>
                </div>

                <ChatWindow
                  chatHistory={currentApp.chatHistory}
                  currentRole="candidate"
                  onSendMessage={(text) => sendChatMessage(currentApp.id, text, 'candidate')}
                  title={`Sarah Jenkins (Recruiter)`}
                  showReciprocalBanner={currentApp.status === 'Shortlisted' || currentApp.status === 'Interview'}
                  onConfirmProfile={() => {
                    sendChatMessage(currentApp.id, "[SYSTEM: Candidate confirmed profile and verified mutual interest.]", 'candidate');
                  }}
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

      {/* Fair Work Pact Application Intercept Modal */}
      {showApplyPactModal && selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 3, 10, 0.8)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel animate-glow" style={{
            width: '100%',
            maxWidth: '500px',
            padding: '32px',
            position: 'relative',
            border: '1px solid rgba(34, 211, 238, 0.25)',
            boxShadow: '0 0 30px rgba(34, 211, 238, 0.1)'
          }}>
            <button 
              onClick={() => setShowApplyPactModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'rgba(34, 211, 238, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                border: '1px solid rgba(34, 211, 238, 0.3)'
              }}>
                <Sparkles size={24} color="#22d3ee" style={{ display: 'block', margin: 'auto' }} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>
                Commit to the Fair Work Pact
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
                Applying for <strong>{selectedJob.title}</strong> at {selectedJob.companyName}
              </p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              padding: '16px',
              borderRadius: '10px',
              marginBottom: '24px',
              maxHeight: '240px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>YOUR EMPLOYEE COMMITMENTS</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: '#fff' }}> Punctuality:</strong> Consistently arriving on time and respecting the work schedule.
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: '#fff' }}> Prompt Communication:</strong> Timely and professional responses to all work-related messages or requests.
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: '#fff' }}> Responsibility:</strong> Taking full ownership of assigned tasks and performing them diligently.
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: '#fff' }}> Absolute Integrity:</strong> Honesty in reporting hours, tasks, and issues.
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: '#fff' }}> Professional Conduct:</strong> Respectful behavior towards coworkers and clients.
                </div>
              </div>
            </div>

            <label style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              cursor: 'pointer',
              padding: '12px',
              borderRadius: '8px',
              background: pactChecked ? 'rgba(34, 211, 238, 0.05)' : 'transparent',
              border: pactChecked ? '1px solid rgba(34, 211, 238, 0.2)' : '1px solid transparent',
              marginBottom: '16px',
              transition: 'all 0.2s ease'
            }}>
              <input
                type="checkbox"
                checked={pactChecked}
                onChange={(e) => setPactChecked(e.target.checked)}
                style={{
                  accentColor: 'var(--secondary)',
                  width: '18px',
                  height: '18px',
                  marginTop: '2px'
                }}
              />
              <span style={{ fontSize: '13px', color: '#fff', lineHeight: 1.4 }}>
                I commit to the Worker Duties (Punctuality, Integrity, Responsibility) as defined in the Fair Work Pact
              </span>
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Type your full legal name to digitally sign
              </label>
              <input
                type="text"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder="e.g. Amanpreet Singh"
                className="glass-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowApplyPactModal(false)}
                className="btn btn-outline"
                style={{ flex: 1, padding: '12px' }}
              >
                Cancel
              </button>
              <button 
                disabled={!pactChecked || !typedSignature.trim()}
                onClick={() => {
                  setShowApplyPactModal(false);
                  handleApply(selectedJob.id, typedSignature.trim());
                  setTypedSignature('');
                }}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: (pactChecked && typedSignature.trim()) ? 'var(--secondary-gradient)' : 'var(--border-color)',
                  borderColor: (pactChecked && typedSignature.trim()) ? 'transparent' : 'var(--border-color)',
                  opacity: (pactChecked && typedSignature.trim()) ? 1 : 0.6
                }}
              >
                Submit Application
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
    </div>
  );
};
