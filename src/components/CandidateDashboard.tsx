import React, { useState, useEffect } from 'react';
import { Search, MapPin, IndianRupee, Briefcase, Filter, UserCheck, MessageCircle, FileText, Plus, X, Sparkles, ArrowLeft, Settings } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import type { Job, Application } from '../context/AppContext';
import { ChatWindow } from './ChatWindow';
import { OnboardingModal } from './OnboardingModal';
import { AppTour } from './AppTour';
import { SUPPORTED_LOCATIONS, getLocationDetails } from '../utils/locationHelper';

export const CandidateDashboard: React.FC = () => {
  const {
    jobs,
    applications,
    candidateProfile,
    setCandidateProfile,
    applyForJob,
    sendChatMessage,
    candidateTab: activeTab,
    setCandidateTab: setActiveTab,
    selectedJobId,
    setSelectedJobId,
    currentLocation,
    setCurrentLocation,
    setPerspective
  } = useAppState();
  const [detailsTab, setDetailsTab] = useState<'info' | 'pact'>('info');
  const [showApplyPactModal, setShowApplyPactModal] = useState(false);
  const [pactChecked, setPactChecked] = useState(false);
  const [typedSignature, setTypedSignature] = useState('');
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractApp, setContractApp] = useState<Application | null>(null);
  const [showTour, setShowTour] = useState(false);
  const locDetails = getLocationDetails(currentLocation);

  useEffect(() => {
    const tourCompleted = localStorage.getItem('hyriq_tour_completed');
    if (!tourCompleted) {
      setShowTour(true);
    }
  }, []);

  // Government Jobs States
  const [govtJobs, setGovtJobs] = useState<any[]>([]);
  const [selectedGovtJob, setSelectedGovtJob] = useState<any | null>(null);
  const [govtJobsLoading, setGovtJobsLoading] = useState(false);
  const [govtJobsError, setGovtJobsError] = useState('');
  const [selectedGovtJobDetails, setSelectedGovtJobDetails] = useState('');
  const [govtJobDetailsLoading, setgovtJobDetailsLoading] = useState(false);
  const [selectedGovtCategory, setSelectedGovtCategory] = useState('all');
  const [selectedGovtState, setSelectedGovtState] = useState('all');
  const [inAppBrowserUrl, setInAppBrowserUrl] = useState<string | null>(null);
  const [isClosingExplore, setIsClosingExplore] = useState(false);
  const [isClosingGovt, setIsClosingGovt] = useState(false);

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

  // Fetch Government Jobs based on state & category filters
  useEffect(() => {
    if (activeTab === 'govt') {
      setGovtJobsLoading(true);
      setGovtJobsError('');
      setSelectedGovtJob(null);
      
      const query = new URLSearchParams();
      if (selectedGovtCategory !== 'all') query.append('category', selectedGovtCategory);
      if (selectedGovtState !== 'all') query.append('state', selectedGovtState);
      
      fetch(`/api/govt-jobs?${query.toString()}`)
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
          setGovtJobs([]);
          setGovtJobsError(err.message || 'No job notifications match this selection.');
          setGovtJobsLoading(false);
        });
    }
  }, [activeTab, selectedGovtCategory, selectedGovtState]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState(currentLocation);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    setLocationQuery(currentLocation);
  }, [currentLocation]);
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
  const selectedJob = jobs.find(j => j.id === selectedJobId) || null;
  const setSelectedJob = (job: Job | null) => {
    setSelectedJobId(job ? job.id : null);
  };
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  
  // Profile edit states
  const [profileName, setProfileName] = useState(candidateProfile.name);
  const [profileEmail, setProfileEmail] = useState(candidateProfile.email);
  const [profilePhone, setProfilePhone] = useState(candidateProfile.phone);
  const [profileBio, setProfileBio] = useState(candidateProfile.bio);
  const [newSkill, setNewSkill] = useState('');
  const [profileExperience, setProfileExperience] = useState(candidateProfile.experience);
  const [profileSaved, setProfileSaved] = useState(false);

  // Extended Resume States
  const [profileAvatar, setProfileAvatar] = useState(candidateProfile.logoSeed || '🧑‍💻');
  const [academics, setAcademics] = useState<Array<{ degree: string; school: string; year: string; grade: string }>>(
    candidateProfile.academicsList || [
      { degree: 'B.Tech in Computer Science', school: 'Thapar University, Patiala', year: '2025', grade: '8.5 CGPA' }
    ]
  );
  const [workExperiences, setWorkExperiences] = useState<Array<{ role: string; company: string; duration: string; description: string }>>(
    candidateProfile.workExperiences || [
      { role: 'Frontend Intern', company: 'Google Development Group', duration: '3 Months (2025)', description: 'Assisted in designing clean UI panels for GDG portals using React.' }
    ]
  );
  const [certifications, setCertifications] = useState<Array<{ name: string; issuer: string; year: string }>>(
    candidateProfile.certifications || [
      { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: '2025' }
    ]
  );

  // Form helpers
  const [newDegree, setNewDegree] = useState('');
  const [newSchool, setNewSchool] = useState('');
  const [newAcadYear, setNewAcadYear] = useState('');
  const [newGrade, setNewGrade] = useState('');

  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newWorkDuration, setNewWorkDuration] = useState('');
  const [newWorkDesc, setNewWorkDesc] = useState('');

  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertYear, setNewCertYear] = useState('');

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

  // Update details panel selection if jobs list changes (only on desktop layout)
  useEffect(() => {
    const isDesktop = window.innerWidth > 1024;
    if (isDesktop && jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs]);

  useEffect(() => {
    setDetailsTab('info');
  }, [selectedJob]);

  // Handle browser/webview popstate back gesture to close job details overlay on mobile
  useEffect(() => {
    const handlePopState = () => {
      if (selectedJob) {
        setIsClosingExplore(true);
        setTimeout(() => {
          setSelectedJob(null);
          setIsClosingExplore(false);
        }, 280);
      }
      if (selectedGovtJob) {
        setIsClosingGovt(true);
        setTimeout(() => {
          setSelectedGovtJob(null);
          setIsClosingGovt(false);
        }, 280);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedJob, selectedGovtJob]);

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    if (window.innerWidth <= 1024) {
      window.history.pushState({ jobDetailOpen: true }, '');
    }
  };

  const handleCloseJobDetails = () => {
    setIsClosingExplore(true);
    setTimeout(() => {
      setSelectedJob(null);
      setIsClosingExplore(false);
    }, 280);
    if (window.innerWidth <= 1024 && window.history.state?.jobDetailOpen) {
      window.history.back();
    }
  };

  const handleSelectGovtJob = (job: any) => {
    setSelectedGovtJob(job);
    if (window.innerWidth <= 1024) {
      window.history.pushState({ govtJobDetailOpen: true }, '');
    }
  };

  const handleCloseGovtJobDetails = () => {
    setIsClosingGovt(true);
    setTimeout(() => {
      setSelectedGovtJob(null);
      setIsClosingGovt(false);
    }, 280);
    if (window.innerWidth <= 1024 && window.history.state?.govtJobDetailOpen) {
      window.history.back();
    }
  };

  // Keep selected application updated with latest chat from global state
  const currentApp = applications.find(app => app.id === selectedApp?.id) || null;

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
      resumeName: candidateProfile.resumeName,
      logoSeed: profileAvatar,
      academicsList: academics,
      workExperiences: workExperiences,
      certifications: certifications
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  // Add & Remove Helpers
  const handleAddAcademic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDegree.trim() || !newSchool.trim()) return;
    setAcademics(prev => [
      ...prev,
      { degree: newDegree.trim(), school: newSchool.trim(), year: newAcadYear.trim() || '2026', grade: newGrade.trim() || 'N/A' }
    ]);
    setNewDegree('');
    setNewSchool('');
    setNewAcadYear('');
    setNewGrade('');
  };

  const handleRemoveAcademic = (index: number) => {
    setAcademics(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.trim() || !newCompany.trim()) return;
    setWorkExperiences(prev => [
      ...prev,
      { role: newRole.trim(), company: newCompany.trim(), duration: newWorkDuration.trim() || 'Present', description: newWorkDesc.trim() || 'No description provided.' }
    ]);
    setNewRole('');
    setNewCompany('');
    setNewWorkDuration('');
    setNewWorkDesc('');
  };

  const handleRemoveExperience = (index: number) => {
    setWorkExperiences(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddCertification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertName.trim() || !newCertIssuer.trim()) return;
    setCertifications(prev => [
      ...prev,
      { name: newCertName.trim(), issuer: newCertIssuer.trim(), year: newCertYear.trim() || '2026' }
    ]);
    setNewCertName('');
    setNewCertIssuer('');
    setNewCertYear('');
  };

  const handleRemoveCertification = (index: number) => {
    setCertifications(prev => prev.filter((_, i) => i !== index));
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
    <>
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
              {locDetails.greeting} Welcome back, {candidateProfile.name}
            </h2>
            <p style={{ color: isLightMode ? '#475569' : 'var(--text-secondary)', fontSize: '14px' }}>
              Let's land your dream workspace in {locDetails.city}.
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
            <button 
              className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
              style={{ color: activeTab === 'settings' ? '#fff' : (isLightMode ? 'var(--corporate-blue)' : 'var(--text-secondary)'), background: activeTab === 'settings' ? 'var(--corporate-blue)' : 'transparent' }}
            >
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>

        {/* EXPLORE JOBS VIEW */}
        {activeTab === 'explore' && (
          <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="explore-grid">
            {/* Compact Inline Filter Bar */}
            <aside className="seeker-light-card" style={{ padding: '10px 16px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--tech-orange)', flexShrink: 0 }}>
                  <Filter size={14} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--corporate-blue)' }}>Filters</span>
                </div>

                {/* Category */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(26,62,98,0.06)', borderRadius: '8px', padding: '4px 8px' }}>
                  <Briefcase size={13} color="var(--corporate-blue)" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{ border: 'none', background: 'transparent', fontSize: '11px', fontWeight: 600, color: 'var(--corporate-blue)', outline: 'none', cursor: 'pointer', padding: '2px 0' }}
                  >
                    <option value="">Category</option>
                    <option value="Tech & Engineering">Tech & Engineering</option>
                    <option value="Design & Product">Design & Product</option>
                    <option value="Marketing & Content">Marketing & Content</option>
                    <option value="Sales & Operations">Sales & Operations</option>
                  </select>
                </div>

                {/* Work Mode */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(26,62,98,0.06)', borderRadius: '8px', padding: '4px 8px' }}>
                  <MapPin size={13} color="var(--corporate-blue)" />
                  <select
                    value={modeFilter.length === 1 ? modeFilter[0] : ''}
                    onChange={(e) => setModeFilter(e.target.value ? [e.target.value] : [])}
                    style={{ border: 'none', background: 'transparent', fontSize: '11px', fontWeight: 600, color: 'var(--corporate-blue)', outline: 'none', cursor: 'pointer', padding: '2px 0' }}
                  >
                    <option value="">Mode</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                {/* Job Type */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(26,62,98,0.06)', borderRadius: '8px', padding: '4px 8px' }}>
                  <FileText size={13} color="var(--corporate-blue)" />
                  <select
                    value={typeFilter.length === 1 ? typeFilter[0] : ''}
                    onChange={(e) => setTypeFilter(e.target.value ? [e.target.value] : [])}
                    style={{ border: 'none', background: 'transparent', fontSize: '11px', fontWeight: 600, color: 'var(--corporate-blue)', outline: 'none', cursor: 'pointer', padding: '2px 0' }}
                  >
                    <option value="">Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                {/* Experience */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(26,62,98,0.06)', borderRadius: '8px', padding: '4px 8px' }}>
                  <Sparkles size={13} color="var(--corporate-blue)" />
                  <select
                    value={experienceFilter.length === 1 ? experienceFilter[0] : ''}
                    onChange={(e) => setExperienceFilter(e.target.value ? [e.target.value] : [])}
                    style={{ border: 'none', background: 'transparent', fontSize: '11px', fontWeight: 600, color: 'var(--corporate-blue)', outline: 'none', cursor: 'pointer', padding: '2px 0' }}
                  >
                    <option value="">Exp</option>
                    <option value="Entry-level">Entry</option>
                    <option value="Mid-level">Mid</option>
                    <option value="Senior-level">Senior</option>
                  </select>
                </div>

                {/* Reset */}
                <button
                  onClick={() => {
                    setCategoryFilter('');
                    setTypeFilter([]);
                    setModeFilter([]);
                    setExperienceFilter([]);
                    setSearchQuery('');
                    setLocationQuery('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '4px 6px',
                    borderRadius: '6px',
                    flexShrink: 0,
                    transition: 'background 0.15s'
                  }}
                  title="Reset All Filters"
                >
                  <X size={14} />
                </button>

                {/* Matches Only Toggle */}
                {candidateProfile.onboardingCompleted && (
                  <button
                    type="button"
                    onClick={() => setMatchesOnly(!matchesOnly)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: matchesOnly ? 'var(--tech-orange)' : 'rgba(26,62,98,0.06)',
                      color: matchesOnly ? '#fff' : 'var(--corporate-blue)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                      flexShrink: 0
                    }}
                  >
                    <Sparkles size={12} />
                    Match {matchesOnly ? 'ON' : 'OFF'}
                  </button>
                )}
              </div>
            </aside>

          {/* Main Job Listing + Detail Split */}
          <main style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }} className="explore-main">
            {/* Job List Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Single Search Bar: Title / Location */}
              <div className="seeker-light-card" style={{ display: 'flex', alignItems: 'center', padding: '4px 12px', borderRadius: '12px' }}>
                <Search size={15} color="var(--corporate-blue)" style={{ flexShrink: 0 }} />
                <input
                  id="dashboard-search-input"
                  type="text"
                  placeholder="Title or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--corporate-blue)', fontSize: '13px', fontWeight: 500, flex: 1, padding: '10px 8px', minWidth: 0 }}
                />
                <span style={{ color: 'rgba(26,62,98,0.3)', fontSize: '16px', fontWeight: 300, flexShrink: 0, userSelect: 'none' }}>/</span>
                <MapPin size={15} color="var(--corporate-blue)" style={{ flexShrink: 0, marginLeft: '4px' }} />
                <input
                  type="text"
                  placeholder="Location..."
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--corporate-blue)', fontSize: '13px', fontWeight: 500, flex: 1, padding: '10px 8px', minWidth: 0 }}
                />
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
                      onClick={() => handleSelectJob(job)}
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
          </main>
        </div>

        {/* Job Details Panel has been moved to the bottom of the component to bypass Android WebView transform rendering bugs */}
        </>
      )}

      {/* GOVT JOBS VIEW */}
      {activeTab === 'govt' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }} className="explore-grid">
          {/* Left Column: Govt Jobs List */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* TABS ROW 1: Categories */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              {[
                { id: 'all', label: 'All India Govt Jobs' },
                { id: 'bank', label: 'Bank Jobs' },
                { id: 'teaching', label: 'Teaching Jobs' },
                { id: 'engineering', label: 'Engineering Jobs' },
                { id: 'railway', label: 'Railway Jobs' },
                { id: 'defence', label: 'Police/Defence Jobs' }
              ].map(cat => {
                const isActive = selectedGovtCategory === cat.id && selectedGovtState === 'all';
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedGovtCategory(cat.id);
                      setSelectedGovtState('all');
                    }}
                    style={{
                      background: isActive ? 'var(--corporate-blue)' : 'rgba(26, 62, 98, 0.08)',
                      color: isActive ? '#fff' : 'var(--corporate-blue)',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* TABS ROW 2: States */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', borderBottom: '1px solid rgba(26, 62, 98, 0.1)', paddingBottom: '16px' }}>
              {[
                { id: 'all', label: 'All States' },
                { id: 'pb', label: 'Punjab (PB)' },
                { id: 'hr', label: 'Haryana (HR)' },
                { id: 'dl', label: 'Delhi (DL)' },
                { id: 'hp', label: 'Himachal (HP)' },
                { id: 'rj', label: 'Rajasthan (RJ)' },
                { id: 'up', label: 'Uttar Pradesh (UP)' },
                { id: 'mh', label: 'Maharashtra (MH)' },
                { id: 'ap', label: 'Andhra (AP)' },
                { id: 'as', label: 'Assam (AS)' },
                { id: 'br', label: 'Bihar (BR)' },
                { id: 'cg', label: 'Chhattisgarh (CG)' },
                { id: 'gj', label: 'Gujarat (GJ)' },
                { id: 'jh', label: 'Jharkhand (JH)' },
                { id: 'ka', label: 'Karnataka (KA)' },
                { id: 'kl', label: 'Kerala (KL)' },
                { id: 'mp', label: 'Madhya Pradesh (MP)' },
                { id: 'od', label: 'Odisha (OD)' },
                { id: 'tn', label: 'Tamil Nadu (TN)' },
                { id: 'ts', label: 'Telangana (TS)' },
                { id: 'uk', label: 'Uttarakhand (UK)' },
                { id: 'wb', label: 'West Bengal (WB)' }
              ].map(st => {
                const isActive = selectedGovtState === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      setSelectedGovtState(st.id);
                      setSelectedGovtCategory('all');
                    }}
                    style={{
                      background: isActive ? 'var(--tech-orange)' : 'rgba(26, 62, 98, 0.04)',
                      color: isActive ? '#fff' : '#64748b',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--corporate-blue)' }}>
                {selectedGovtState !== 'all' 
                  ? `${selectedGovtState.toUpperCase()} Government Notifications` 
                  : selectedGovtCategory !== 'all' 
                    ? `${selectedGovtCategory.toUpperCase()} Government Notifications`
                    : "National Government Notifications"
                }
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

            {!govtJobsLoading && !govtJobsError && govtJobs.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {govtJobs.map((job) => {
                  const isSelected = selectedGovtJob?.id === job.id;
                  return (
                    <div 
                      key={job.id}
                      onClick={() => handleSelectGovtJob(job)}
                      className="seeker-light-card animate-glow"
                      style={{
                        padding: '20px',
                        cursor: 'pointer',
                        border: isSelected ? '2px solid var(--tech-orange)' : '1px solid #E2E8F0',
                        background: isSelected ? 'rgba(242, 153, 74, 0.05)' : '#ffffff',
                        transition: 'all 0.15s ease',
                        transform: isSelected ? 'translateY(-2px)' : 'none',
                        borderRadius: '12px',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'start' }}>
                        <div>
                          <span className="badge badge-primary" style={{ marginBottom: '8px', background: 'rgba(26, 62, 98, 0.08)', color: 'var(--corporate-blue)', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', fontSize: '11px' }}>
                            🏛️ {job.recruitmentBoard}
                          </span>
                          <h4 style={{ color: 'var(--corporate-blue)', fontSize: '15px', fontWeight: 800, marginTop: '8px', marginBottom: '2px', lineHeight: '1.4' }}>
                            {job.title}
                          </h4>
                        </div>
                        <div className="avatar" style={{
                          background: 'linear-gradient(135deg, #1A3E62 0%, #F2994A 100%)',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 700,
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          Govt
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        <span className="badge seeker-tag-blue" style={{ fontSize: '11px', padding: '3px 8px' }}>📅 Posted: {job.postDate}</span>
                        <span className="badge seeker-tag-blue" style={{ fontSize: '11px', padding: '3px 8px' }}>🎓 Req: {job.qualification}</span>
                        <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', fontWeight: 700, fontSize: '11px', padding: '3px 8px' }}>
                          ⌛ Last Date: {job.lastDate || '—'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(26,62,98,0.06)', paddingTop: '10px' }}>
                        <span>📍 State: {job.state ? job.state.toUpperCase() : 'National'}</span>
                        <span style={{ color: 'rgba(0,0,0,0.15)' }}>•</span>
                        <span>Category: {job.category ? job.category.toUpperCase() : 'General'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          {/* Right Column: Sticky Detail Panel */}
          <aside className="govt-sidebar" style={{ position: 'sticky', top: '24px' }}>
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
                      ⏳ Loading official job notifications, fee details & vacancy tables...
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

                <button
                  type="button"
                  onClick={() => setInAppBrowserUrl(selectedGovtJob.applyLink)}
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
                    textAlign: 'center',
                    fontSize: '13px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                >
                  Open Official Application Portal 🏛️
                </button>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }} className="profile-grid">
          {/* Main Info Card */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                👤 Personal Details & DP
              </h3>

              {/* Avatar / DP Picker */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>Select App Display Picture (DP)</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {['🧑‍💻', '🚀', '🤖', '🎨', '💼', '🎓', '🦖', '🌟', '🦄'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setProfileAvatar(emoji)}
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        fontSize: '22px',
                        background: profileAvatar === emoji ? 'var(--corporate-blue)' : 'rgba(255,255,255,0.03)',
                        border: profileAvatar === emoji ? '2px solid var(--tech-orange)' : '1px solid rgba(255,255,255,0.08)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      {emoji}
                    </button>
                  ))}

                  {/* Custom Upload Button */}
                  <label 
                    htmlFor="profile-image-upload-input"
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      fontSize: '18px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px dashed var(--tech-orange)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      color: 'var(--tech-orange)'
                    }}
                    title="Upload Custom Image"
                  >
                    📸
                  </label>
                  <input
                    type="file"
                    id="profile-image-upload-input"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setProfileAvatar(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

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
                  <button type="submit" className="btn btn-primary">Save Personal Details</button>
                  
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

                  {profileSaved && <span style={{ color: 'var(--success)', fontSize: '13px', fontWeight: 600 }}>✓ Info saved in profile</span>}
                </div>
              </form>
            </div>

            {/* Academics & Qualifications Editor */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                🎓 Academics & Qualifications
              </h3>
              
              {/* Existing Academic Entries */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {academics.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No academic credentials added yet.</p>
                ) : (
                  academics.map((acad, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <strong style={{ color: '#fff', fontSize: '14px' }}>{acad.degree}</strong>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{acad.school} ({acad.year}) — {acad.grade}</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveAcademic(idx)}
                        style={{ border: 'none', background: 'transparent', color: '#f43f5e', cursor: 'pointer' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Academic Form */}
              <form onSubmit={handleAddAcademic} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Add Qualification</span>
                <input 
                  type="text" 
                  value={newDegree} 
                  onChange={(e) => setNewDegree(e.target.value)} 
                  placeholder="Degree e.g. B.Tech Computer Science" 
                  className="glass-input" 
                  style={{ padding: '10px 14px', fontSize: '13px' }}
                />
                <input 
                  type="text" 
                  value={newSchool} 
                  onChange={(e) => setNewSchool(e.target.value)} 
                  placeholder="School / University Name" 
                  className="glass-input" 
                  style={{ padding: '10px 14px', fontSize: '13px' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input 
                    type="text" 
                    value={newAcadYear} 
                    onChange={(e) => setNewAcadYear(e.target.value)} 
                    placeholder="Year (e.g. 2025)" 
                    className="glass-input" 
                    style={{ padding: '10px 14px', fontSize: '13px' }}
                  />
                  <input 
                    type="text" 
                    value={newGrade} 
                    onChange={(e) => setNewGrade(e.target.value)} 
                    placeholder="Score / Grade (e.g. 8.5 CGPA)" 
                    className="glass-input" 
                    style={{ padding: '10px 14px', fontSize: '13px' }}
                  />
                </div>
                <button type="submit" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', padding: '10px' }}>
                  <Plus size={14} /> Add Academic Record
                </button>
              </form>
            </div>

            {/* Work Experiences Editor */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                💼 Past Work Experience
              </h3>

              {/* Existing Work Entries */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {workExperiences.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No work history added yet.</p>
                ) : (
                  workExperiences.map((work, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', background: 'rgba(255,255,255,0.02)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <strong style={{ color: '#fff', fontSize: '14px' }}>{work.role} at {work.company}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--tech-orange)', display: 'block', margin: '2px 0' }}>{work.duration}</span>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{work.description}</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveExperience(idx)}
                        style={{ border: 'none', background: 'transparent', color: '#f43f5e', cursor: 'pointer', marginTop: '2px' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Work Form */}
              <form onSubmit={handleAddExperience} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Add Work Experience</span>
                <input 
                  type="text" 
                  value={newRole} 
                  onChange={(e) => setNewRole(e.target.value)} 
                  placeholder="Job Role / Title e.g. React Developer" 
                  className="glass-input" 
                  style={{ padding: '10px 14px', fontSize: '13px' }}
                />
                <input 
                  type="text" 
                  value={newCompany} 
                  onChange={(e) => setNewCompany(e.target.value)} 
                  placeholder="Company / Employer Name" 
                  className="glass-input" 
                  style={{ padding: '10px 14px', fontSize: '13px' }}
                />
                <input 
                  type="text" 
                  value={newWorkDuration} 
                  onChange={(e) => setNewWorkDuration(e.target.value)} 
                  placeholder="Duration (e.g. June 2024 - Dec 2024)" 
                  className="glass-input" 
                  style={{ padding: '10px 14px', fontSize: '13px' }}
                />
                <textarea 
                  value={newWorkDesc} 
                  onChange={(e) => setNewWorkDesc(e.target.value)} 
                  placeholder="Role description & key deliverables..." 
                  className="glass-input" 
                  rows={2}
                  style={{ padding: '10px 14px', fontSize: '13px', resize: 'none' }}
                />
                <button type="submit" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', padding: '10px' }}>
                  <Plus size={14} /> Add Experience record
                </button>
              </form>
            </div>

            {/* Certifications Editor */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                📜 Certifications & Credentials
              </h3>

              {/* Existing Certs Entries */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {certifications.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No certifications added yet.</p>
                ) : (
                  certifications.map((cert, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <strong style={{ color: '#fff', fontSize: '14px' }}>{cert.name}</strong>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{cert.issuer} ({cert.year})</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveCertification(idx)}
                        style={{ border: 'none', background: 'transparent', color: '#f43f5e', cursor: 'pointer' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Cert Form */}
              <form onSubmit={handleAddCertification} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Add Certification</span>
                <input 
                  type="text" 
                  value={newCertName} 
                  onChange={(e) => setNewCertName(e.target.value)} 
                  placeholder="Credential Name e.g. AWS practitioner" 
                  className="glass-input" 
                  style={{ padding: '10px 14px', fontSize: '13px' }}
                />
                <input 
                  type="text" 
                  value={newCertIssuer} 
                  onChange={(e) => setNewCertIssuer(e.target.value)} 
                  placeholder="Issuer Organisation e.g. Amazon Web Services" 
                  className="glass-input" 
                  style={{ padding: '10px 14px', fontSize: '13px' }}
                />
                <input 
                  type="text" 
                  value={newCertYear} 
                  onChange={(e) => setNewCertYear(e.target.value)} 
                  placeholder="Year Achieved" 
                  className="glass-input" 
                  style={{ padding: '10px 14px', fontSize: '13px' }}
                />
                <button type="submit" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', padding: '10px' }}>
                  <Plus size={14} /> Add Certification
                </button>
              </form>
            </div>
          </main>

          {/* Live CV Resume Card Preview Panel (Aside) */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '100px' }}>
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
                  <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--tech-orange)', textTransform: 'uppercase', lineHeight: '1.1', fontFamily: 'Outfit', letterSpacing: '0.5px' }}>
                    {profileName ? profileName.split(' ')[0] : 'Candidate'}<br/>
                    {profileName ? profileName.split(' ').slice(1).join(' ') : 'Name'}
                  </h2>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginTop: '6px', letterSpacing: '1px' }}>
                    {profileExperience ? `${profileExperience.toUpperCase()} PROFESSIONAL` : 'JOB SEEKER'}
                  </span>
                </div>
                
                {/* Highlighted DP Container (circular orange frame) */}
                <div style={{
                  position: 'relative',
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--tech-orange) 0%, #1A3E62 100%)',
                  padding: '4px',
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
                    fontSize: profileAvatar && profileAvatar.length > 4 ? '18px' : '44px',
                    overflow: 'hidden'
                  }}>
                    {profileAvatar && (profileAvatar.startsWith('data:image/') || profileAvatar.startsWith('http')) ? (
                      <img src={profileAvatar} alt="DP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      profileAvatar
                    )}
                  </div>
                </div>
              </div>

              {/* Layout Grid inside Card */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
                
                {/* Column blocks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
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
                      {profileBio || 'Write a brief description about your core competencies, qualifications, and personal career path objectives.'}
                    </p>
                  </div>

                  {/* Education */}
                  {academics.length > 0 && (
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>Education</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {academics.map((acad, idx) => (
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
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(skill)}
                                style={{ border: 'none', background: 'transparent', color: '#f43f5e', cursor: 'pointer', padding: 0, fontSize: '10px' }}
                              >
                                Remove
                              </button>
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
                  {workExperiences.length > 0 && (
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>Experience Timeline</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {workExperiences.map((work, idx) => (
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
                  {certifications.length > 0 && (
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>Certifications</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {certifications.map((cert, idx) => (
                          <div key={idx} style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '10px' }}>
                            🏆 <strong style={{ color: '#fff' }}>{cert.name}</strong>
                            <p style={{ color: 'var(--text-muted)', fontSize: '10.5px', margin: '2px 0 0 0' }}>{cert.issuer} — {cert.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✉️ <strong>{profileEmail}</strong></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📞 <strong>{profilePhone}</strong></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📍 <strong>{currentLocation}, {locDetails.state}</strong></div>
              </div>
            </div>

            {/* Add Skill Widget inside preview column */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>
                Add Skills
              </h4>
              <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={newSkill} 
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g. React, Python..." 
                  className="glass-input"
                  style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                />
                <button type="submit" className="btn btn-outline" style={{ padding: '0 12px', borderRadius: '12px' }}>
                  <Plus size={16} />
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}

      {/* SETTINGS VIEW */}
      {activeTab === 'settings' && (
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Account Settings Header */}
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>⚙️ App Settings</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Manage your account, privacy, notifications, and app preferences.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
             {/* Section 1: Account & Profile */}
             <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ color: 'var(--tech-orange)', fontSize: '16px', fontWeight: 700 }}>1. Account & Profile</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Account Type Perspective</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setPerspective('candidate');
                      }}
                      className="btn"
                      style={{ flex: 1, padding: '10px', fontSize: '12px', background: 'var(--corporate-blue)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      Job Seeker
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPerspective('recruiter');
                      }}
                      className="btn"
                      style={{ flex: 1, padding: '10px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      Recruiter
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Region/Location (National)</label>
                  <select 
                    className="glass-input" 
                    style={{ fontSize: '13px', background: '#090714', color: '#fff' }}
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                  >
                    {Object.keys(SUPPORTED_LOCATIONS).map(loc => (
                      <option key={loc} value={loc} style={{ background: '#090714', color: '#fff' }}>
                        {loc} ({SUPPORTED_LOCATIONS[loc].state})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Portfolio & Website Link</label>
                  <input type="url" placeholder="https://myportfolio.com" className="glass-input" style={{ fontSize: '13px' }} />
                </div>
             </div>

             {/* Section 2: Notifications */}
             <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ color: 'var(--tech-orange)', fontSize: '16px', fontWeight: 700 }}>2. Notifications</h4>
                
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Direct Messages (Chat)</span>
                  <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                </label>

                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Application status updates</span>
                  <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                </label>

                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Interview requests</span>
                  <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                </label>

                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Daily email job matches</span>
                  <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                </label>
             </div>

             {/* Section 3: Privacy & Visibility */}
             <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ color: 'var(--tech-orange)', fontSize: '16px', fontWeight: 700 }}>3. Privacy & Visibility</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Profile Status</label>
                  <select className="glass-input" style={{ fontSize: '13px' }}>
                    <option>Actively Looking</option>
                    <option>Open to Offers</option>
                    <option>Not Looking</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Resume Visibility</label>
                  <select className="glass-input" style={{ fontSize: '13px' }}>
                    <option>Public to all recruiters</option>
                    <option>Visible only to applied jobs</option>
                    <option>Completely hidden</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Block Companies</label>
                  <input type="text" placeholder="Enter company names to block..." className="glass-input" style={{ fontSize: '13px' }} />
                </div>
             </div>

             {/* Section 4: Security & Access */}
             <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ color: 'var(--tech-orange)', fontSize: '16px', fontWeight: 700 }}>4. Security & Access</h4>
                
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Two-Factor (2FA)</span>
                  <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Reset Password</label>
                  <input type="password" placeholder="New password" className="glass-input" style={{ fontSize: '13px' }} />
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  🛡️ Active Sessions: 1 (Android WebView)
                </div>
             </div>

             {/* Section 5: App Preferences */}
             <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ color: 'var(--tech-orange)', fontSize: '16px', fontWeight: 700 }}>5. App Preferences</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Appearance Theme</label>
                  <select className="glass-input" style={{ fontSize: '13px' }}>
                    <option>Dark Mode (Default)</option>
                    <option>Light Mode</option>
                    <option>System Default</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>App Language / ਬੋਲੀ</label>
                  <select className="glass-input" style={{ fontSize: '13px' }}>
                    <option>English</option>
                    <option>Punjabi (ਪੰਜਾਬੀ)</option>
                    <option>Hindi (हिन्दी)</option>
                  </select>
                </div>

                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Auto-play Wi-Fi Only</span>
                  <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                </label>
             </div>
          </div>
        </div>
      )}

      {/* Fair Work Pact Modals have been moved to the bottom of the component (outside the container) to bypass Android WebView transform rendering bugs */}
      {/* Mobile Bottom Navigation Bar – Icon Only */}
      {!selectedJob && (
        <div className="mobile-bottom-nav" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: isLightMode ? 'rgba(255,255,255,0.95)' : 'rgba(11,14,20,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: isLightMode ? '1px solid rgba(26,62,98,0.12)' : '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
        boxShadow: isLightMode ? '0 -2px 16px rgba(0,0,0,0.06)' : '0 -4px 20px rgba(0,0,0,0.5)',
        padding: '0 4px'
      }}>
        {[
          { id: 'explore', icon: <Briefcase size={20} />, label: 'Explore' },
          { id: 'govt', icon: <span style={{ fontSize: '18px' }}>🏛️</span>, label: 'Govt' },
          { id: 'search', icon: <Search size={20} />, label: 'Search', action: () => {
              setActiveTab('explore');
              setTimeout(() => {
                const el = document.getElementById('dashboard-search-input');
                if (el) {
                  el.focus();
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 150);
            }
          },
          { id: 'applications', icon: <MessageCircle size={20} />, label: 'Apps' },
          { id: 'profile', icon: <UserCheck size={20} />, label: 'Profile' },
          { id: 'settings', icon: <Settings size={20} />, label: 'Settings' }
        ].map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={item.action ? item.action : () => setActiveTab(item.id as any)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isActive ? 'var(--tech-orange)' : (isLightMode ? '#94a3b8' : 'rgba(255,255,255,0.35)'),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                cursor: 'pointer',
                flex: 1,
                padding: '6px 0',
                transition: 'color 0.2s',
                position: 'relative'
              }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute',
                  top: '-1px',
                  width: '20px',
                  height: '3px',
                  borderRadius: '0 0 4px 4px',
                  background: 'var(--tech-orange)'
                }} />
              )}
              {item.icon}
              <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.3px' }}>{item.label}</span>
            </button>
          );
        })}
      </div>
      )}
      </div> {/* Close container here to bypass Android WebView coordinate transform bug */}

      {/* Standalone full-page overlay details view rendered outside .container to bypass Android WebView transform rendering context bugs */}
      {activeTab === 'explore' && selectedJob && (
        <div className={`job-detail-panel job-detail-open ${isClosingExplore ? 'job-detail-closing' : ''}`}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#0B0E14', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Header */}
            <div>
              <button
                onClick={handleCloseJobDetails}
                style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '16px',
                      padding: '4px 0'
                    }}
                    className="mobile-back-btn"
                  >
                    <ArrowLeft size={16} /> Back to Listings
                  </button>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#10b981', fontWeight: 600, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                      💬 Chat Live Hours: {selectedJob.chatLiveHours || '10:00 AM - 1:00 PM'}
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
                <div className="mobile-fixed-bottom-actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', gap: '12px' }}>
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
          </div>
      )}

      {/* Standalone full-page overlay details view for Government Jobs rendered outside .container to bypass Android WebView transform rendering context bugs */}
      {activeTab === 'govt' && selectedGovtJob && (
        <div className={`job-detail-panel job-detail-open ${isClosingGovt ? 'job-detail-closing' : ''}`}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#0B0E14', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Header */}
            <div>
              <button
                onClick={handleCloseGovtJobDetails}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '16px',
                  padding: '4px 0'
                }}
                className="mobile-back-btn"
              >
                <ArrowLeft size={16} /> Back to Listings
              </button>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: '8px', background: 'rgba(26, 62, 98, 0.15)', color: 'var(--corporate-blue)', border: '1px solid rgba(26, 62, 98, 0.3)' }}>
                    {selectedGovtJob.recruitmentBoard}
                  </span>
                  <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, marginBottom: '4px', lineHeight: '1.4' }}>{selectedGovtJob.title}</h3>
                </div>
                <div className="avatar" style={{
                  width: '50px',
                  height: '50px',
                  fontSize: '14px',
                  fontWeight: 700,
                  background: `linear-gradient(135deg, #1A3E62 0%, #F2994A 100%)`
                }}>
                  Govt
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <MapPin size={14} color="var(--text-muted)" /> State/Region: {selectedGovtJob.state ? selectedGovtJob.state.toUpperCase() : 'All India'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <Briefcase size={14} color="var(--text-muted)" /> Qualification Required: {selectedGovtJob.qualification}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
                  ⌛ Last Date to Apply: {selectedGovtJob.lastDate || '—'}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '16px', marginBottom: '8px' }}>
              <button
                className="tab-btn active"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '14px',
                  paddingBottom: '8px',
                  borderBottom: '2px solid var(--tech-orange)',
                  cursor: 'pointer'
                }}
              >
                Official Notification & Info
              </button>
            </div>

            {/* Details Content */}
            {govtJobDetailsLoading ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <div className="animate-pulse">
                  ⏳ Loading official job notifications, fee details & vacancy tables...
                </div>
              </div>
            ) : selectedGovtJobDetails ? (
              <div 
                className="govt-details-content"
                dangerouslySetInnerHTML={{ __html: selectedGovtJobDetails }} 
                style={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto', 
                  padding: '16px', 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '12px', 
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#e2e8f0'
                }} 
              />
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No notification details available.
              </div>
            )}

            {/* Bottom Actions */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }} className="mobile-fixed-bottom-actions">
              <button 
                className="btn btn-outline" 
                onClick={handleCloseGovtJobDetails}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '13px' }}
              >
                Close Details
              </button>
              <button 
                type="button"
                onClick={() => setInAppBrowserUrl(selectedGovtJob.applyLink)}
                className="btn btn-primary"
                style={{ flex: 2, padding: '12px', borderRadius: '12px', fontSize: '13px', textAlign: 'center', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
              >
                Apply Online 🏛️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Fair Work Pact Application Intercept Modal rendered outside .container to bypass Android WebView transform rendering context bugs */}
      {showApplyPactModal && selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 3, 10, 0.8)',
          backdropFilter: 'blur(10px)',
          zIndex: 2000,
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

      {/* Standalone Fair Work Pact Legal Document Modal rendered outside .container to bypass Android WebView transform rendering context bugs */}
      {showContractModal && contractApp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 3, 10, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 2000,
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

      {showTour && (
        <AppTour
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onComplete={() => setShowTour(false)}
        />
      )}

      {/* In-App Browser / Iframe Modal for Government Portals */}
      {inAppBrowserUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#0B0E14',
          zIndex: 3000,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Browser Header Bar */}
          <div style={{
            height: '56px',
            background: 'rgba(26, 62, 98, 0.95)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            color: '#fff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={() => setInAppBrowserUrl(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                ✕
              </button>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ fontSize: '14px', display: 'block' }}>Official Portal</strong>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', display: 'block', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {inAppBrowserUrl}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <a 
                href={inAppBrowserUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', textDecoration: 'none' }}
              >
                Open External ↗
              </a>
            </div>
          </div>

          {/* Iframe Viewport */}
          <div style={{ flex: 1, position: 'relative', background: '#fff' }}>
            <iframe 
              src={inAppBrowserUrl} 
              title="Official Portal Viewport"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: '#fff'
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
