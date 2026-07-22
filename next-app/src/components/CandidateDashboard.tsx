import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Building, Briefcase, FileText, CheckCircle, ChevronDown, Download, Check, RefreshCw, X, Sparkles, Filter, ExternalLink, BookmarkPlus, Play, AlertCircle, Upload, IndianRupee, UserCheck, MessageCircle, Plus, ArrowLeft, Settings, Bell } from 'lucide-react';
import { calculateMatchScore } from '../utils/aiMatching';
import { useAppState } from '../context/AppContext';
import type { Job, Application } from '../context/AppContext';
import { ChatWindow } from './ChatWindow';
import { NotificationsPage } from './NotificationsPage';
import { OnboardingModal } from './OnboardingModal';
import { AppTour } from './AppTour';
import { SUPPORTED_LOCATIONS, getLocationDetails } from '../utils/locationHelper';

const isMobileLayout = () => {
  const isPortrait = window.innerHeight > window.innerWidth;
  return window.innerWidth <= 767 || (window.innerWidth <= 1024 && isPortrait);
};

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
    perspective,
    setPerspective
  } = useAppState();
  const [detailsTab, setDetailsTab] = useState<'info' | 'pact'>('info');
  const [isAvailable, setIsAvailable] = useState(true);
  const [showApplyPactModal, setShowApplyPactModal] = useState(false);
  const [pactChecked, setPactChecked] = useState(false);
  const [typedSignature, setTypedSignature] = useState('');
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractApp, setContractApp] = useState<Application | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [showResumeBuilderModal, setShowResumeBuilderModal] = useState(false);
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
  
  // Saved Government Jobs full objects
  const [savedGovtJobs, setSavedGovtJobs] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('hyriq_saved_govt_job_objects') || '[]');
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('hyriq_saved_govt_job_objects', JSON.stringify(savedGovtJobs));
  }, [savedGovtJobs]);

  const [applicationsSubTab, setApplicationsSubTab] = useState<'applied' | 'saved'>('applied');
  const [selectedSavedJob, setSelectedSavedJob] = useState<any | null>(null);
  const [savedJobDetailsHtml, setSavedJobDetailsHtml] = useState('');
  const [savedJobDetailsLoading, setSavedJobDetailsLoading] = useState(false);
  const [savedJobApplyLink, setSavedJobApplyLink] = useState('');
  const [savedJobResourceLinks, setSavedJobResourceLinks] = useState<{ label: string, url: string }[]>([]);
  const [showSavedLinksDropdown, setShowSavedLinksDropdown] = useState(false);

  useEffect(() => {
    if (selectedSavedJob) {
      setSavedJobDetailsHtml('');
      setSavedJobApplyLink(selectedSavedJob.applyLink || '');
      setSavedJobResourceLinks([]);
      setShowSavedLinksDropdown(false);
      setSavedJobDetailsLoading(true);
      fetch(`/api/govt-jobs/details?url=${encodeURIComponent(selectedSavedJob.applyLink)}`)
        .then(res => {
          if (!res.ok) throw new Error('Details not found');
          return res.json();
        })
        .then(data => {
          setSavedJobDetailsHtml(data.html);
          if (data.directApplyLink) {
            setSavedJobApplyLink(data.directApplyLink);
          }
          if (data.resourceLinks) {
            setSavedJobResourceLinks(data.resourceLinks);
          }
        })
        .catch(err => {
          console.error(err);
          setSavedJobDetailsHtml(`<p>Job Title: <strong>${selectedSavedJob.title}</strong></p><p>Location: ${selectedSavedJob.location || 'N/A'}</p><p>Department: ${selectedSavedJob.companyName || 'Govt Department'}</p>`);
        })
        .finally(() => {
          setSavedJobDetailsLoading(false);
        });
    }
  }, [selectedSavedJob]);

  const [currentGovtApplyLink, setCurrentGovtApplyLink] = useState('');
  const [govtResourceLinks, setGovtResourceLinks] = useState<{ label: string, url: string }[]>([]);
  const [showLinksDropdown, setShowLinksDropdown] = useState(false);

  // Fetch Government Job Details when a card is selected
  useEffect(() => {
    if (selectedGovtJob) {
      setSelectedGovtJobDetails('');
      setCurrentGovtApplyLink(selectedGovtJob.applyLink); // default fallback
      setGovtResourceLinks([]);
      setShowLinksDropdown(false);
      setgovtJobDetailsLoading(true);
      fetch(`/api/govt-jobs/details?url=${encodeURIComponent(selectedGovtJob.applyLink)}`)
        .then(res => {
          if (!res.ok) throw new Error('Details not found');
          return res.json();
        })
        .then(data => {
          setSelectedGovtJobDetails(data.html);
          if (data.directApplyLink) {
            setCurrentGovtApplyLink(data.directApplyLink);
          }
          if (data.resourceLinks) {
            setGovtResourceLinks(data.resourceLinks);
          }
          setgovtJobDetailsLoading(false);
        })
        .catch(() => {
          setSelectedGovtJobDetails('');
          setgovtJobDetailsLoading(false);
        });
    } else {
      setSelectedGovtJobDetails('');
      setGovtResourceLinks([]);
      setShowLinksDropdown(false);
    }
  }, [selectedGovtJob]);

  // Fetch Government Jobs based on state & category filters
  useEffect(() => {
    if (activeTab === 'govt') {
      setSelectedGovtJob(null);
      
      if (selectedGovtCategory === 'saved') {
        setGovtJobsLoading(true);
        setGovtJobs(savedGovtJobs);
        if (savedGovtJobs.length > 0 && !isMobileLayout()) {
          setSelectedGovtJob(savedGovtJobs[0]);
        }
        setGovtJobsLoading(false);
        setGovtJobsError('');
        return;
      }

      setGovtJobsLoading(true);
      setGovtJobsError('');
      
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
          if (data.length > 0 && !isMobileLayout()) {
            setSelectedGovtJob(data[0]);
          }
          setGovtJobsLoading(false);
        })
        .catch(err => {
          setGovtJobs([]);
          setGovtJobsError(err.message || 'No job notifications match this selection.');
          setGovtJobsLoading(false);
        });
    }
  }, [activeTab, selectedGovtCategory, selectedGovtState, savedGovtJobs]);

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

  const getAIFeedback = (job: Job) => {
    return calculateMatchScore(candidateProfile.skills, job.requirements || [], job.skills || []);
  };

  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingResume(true);
    const formData = new FormData();
    formData.append('resume', file);
    // @ts-ignore
    formData.append('userId', window.user?.id || 'guest');
    try {
      const res = await fetch('/api/resume/parse', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
         setCandidateProfile(prev => ({...prev, skills: data.parsedData.skills, resumeName: data.parsedData.fileName}));
         alert('Resume parsed successfully! ' + data.parsedData.skills.length + ' skills extracted.');
      } else {
         alert(data.error || 'Failed to parse resume');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading resume');
    } finally {
      setIsUploadingResume(false);
    }
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

  // Keep profile edit states synced with candidateProfile once fetched
  useEffect(() => {
    if (candidateProfile.name) setProfileName(candidateProfile.name);
    if (candidateProfile.email) setProfileEmail(candidateProfile.email);
    if (candidateProfile.phone) setProfilePhone(candidateProfile.phone);
    if (candidateProfile.bio) setProfileBio(candidateProfile.bio);
    if (candidateProfile.experience) setProfileExperience(candidateProfile.experience);
    if (candidateProfile.logoSeed) setProfileAvatar(candidateProfile.logoSeed);
  }, [candidateProfile]);

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
    const isDesktop = !isMobileLayout();
    if (isDesktop && jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs]);

  useEffect(() => {
    setDetailsTab('info');
  }, [selectedJob]);

  // Ref tracking to allow mount-once event listeners to always access latest state
  const isClosingExploreRef = useRef(isClosingExplore);
  const isClosingGovtRef = useRef(isClosingGovt);
  const selectedJobRef = useRef(selectedJob);
  const selectedGovtJobRef = useRef(selectedGovtJob);

  useEffect(() => { isClosingExploreRef.current = isClosingExplore; }, [isClosingExplore]);
  useEffect(() => { isClosingGovtRef.current = isClosingGovt; }, [isClosingGovt]);
  useEffect(() => { selectedJobRef.current = selectedJob; }, [selectedJob]);
  useEffect(() => { selectedGovtJobRef.current = selectedGovtJob; }, [selectedGovtJob]);

  // Support Android gesture swiping & hardware back key to close details modal overlays
  useEffect(() => {
    const handlePopState = () => {
      // If closing animation is already in progress from a UI click, ignore the event
      if (isClosingExploreRef.current || isClosingGovtRef.current) {
        return;
      }

      if (selectedJobRef.current) {
        setIsClosingExplore(true);
        setTimeout(() => {
          setSelectedJob(null);
          setIsClosingExplore(false);
        }, 280);
      }
      if (selectedGovtJobRef.current) {
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
  }, []);

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    if (isMobileLayout()) {
      window.history.pushState({ jobDetailOpen: true }, '');
    }
  };

  const handleCloseJobDetails = () => {
    if (isClosingExplore) return; // Prevent double clicks
    setIsClosingExplore(true);
    setTimeout(() => {
      setSelectedJob(null);
      setIsClosingExplore(false);
    }, 280);
    // Safely pop history state to keep browser back stack in sync
    if (isMobileLayout() && window.history.state?.jobDetailOpen) {
      window.history.back();
    }
  };

  const handleSelectGovtJob = (job: any) => {
    setSelectedGovtJob(job);
    if (isMobileLayout()) {
      window.history.pushState({ govtJobDetailOpen: true }, '');
    }
  };

  const handleCloseGovtJobDetails = () => {
    if (isClosingGovt) return; // Prevent double clicks
    setIsClosingGovt(true);
    setTimeout(() => {
      setSelectedGovtJob(null);
      setIsClosingGovt(false);
    }, 280);
    // Safely pop history state to keep browser back stack in sync
    if (isMobileLayout() && window.history.state?.govtJobDetailOpen) {
      window.history.back();
    }
  };

  const handleToggleSaveGovtJob = (job: any) => {
    const exists = savedGovtJobs.some(sj => sj.id === job.id);
    if (exists) {
      setSavedGovtJobs(savedGovtJobs.filter(sj => sj.id !== job.id));
    } else {
      setSavedGovtJobs([...savedGovtJobs, job]);
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
      (categoryFilter === 'Sales & Operations' && (job.title.includes('Sales') || job.title.includes('Operations') || job.skills.includes('Advocate')));

    const matchesType = typeFilter.length === 0 || typeFilter.includes(job.type);
    const matchesMode = modeFilter.length === 0 || modeFilter.includes(job.mode);
    const matchesExperience = experienceFilter.length === 0 || experienceFilter.includes(job.experience);

    const matchesPreferenceQuiz = !matchesOnly || getAIFeedback(job).score >= 70;

    return matchesSearch && matchesLocation && matchesCategory && matchesType && matchesMode && matchesExperience && matchesPreferenceQuiz;
  });

  const getJobTimestamp = (job: any) => {
    // Try extracting from job ID first (e.g., job-1719849600000-3)
    if (job.id.startsWith('job-')) {
      const parts = job.id.split('-');
      const timestampStr = parts[1];
      if (timestampStr && /^\d+$/.test(timestampStr)) {
        const ts = parseInt(timestampStr, 10);
        if (ts > 1000000000000) {
          return ts;
        }
      }
    }
    // Fallback to postedDate
    if (job.postedDate) {
      const ts = new Date(job.postedDate).getTime();
      if (!isNaN(ts)) return ts;
    }
    return 0;
  };

  const isJobNew = (job: any) => {
    const ts = getJobTimestamp(job);
    if (ts === 0) return false;
    const hoursSince = (Date.now() - ts) / (1000 * 60 * 60);
    return hoursSince < 24;
  };

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const timeA = getJobTimestamp(a);
    const timeB = getJobTimestamp(b);
    if (timeA !== timeB) {
      return timeB - timeA;
    }
    if (candidateProfile.onboardingCompleted) {
      return getAIFeedback(b).score - getAIFeedback(a).score;
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

  const renderJobDetailsContent = (job: Job) => {
    const isApplied = applications.some(app => app.jobId === job.id && app.candidateId === 'cand-1');
    const matchingApp = applications.find(app => app.jobId === job.id && app.candidateId === 'cand-1');
    const matchInfo = getAIFeedback(job);
    const matchScore = matchInfo.score;
    const matchLabel = matchInfo.label;

    let barColor = 'bg-emerald-500';
    let textColor = 'text-emerald-600';
    if (matchScore < 40) {
      barColor = 'bg-rose-500';
      textColor = 'text-rose-600';
    } else if (matchScore < 80) {
      barColor = 'bg-amber-500';
      textColor = 'text-amber-600';
    }

    // Initials for avatar
    const initials = job.companyName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
      <div className="flex flex-col h-full bg-white text-[#111827] rounded-2xl overflow-hidden border border-[#E5E7EB]">
        {/* Header Block */}
        <div className="p-6 border-b border-[#E5E7EB] flex-shrink-0">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="min-w-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 mb-2 border border-slate-200">{job.experience}</span>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-1 leading-snug">{job.title}</h3>
              <p className="text-[#2563EB] font-bold text-base hover:underline cursor-pointer">{job.companyName}</p>
            </div>
            
            {/* Initials Avatar */}
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center font-extrabold text-sm flex-shrink-0 select-none">
              {initials}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1"><MapPin size={13} className="text-[#2563EB]" /> {job.location} ({job.mode})</span>
            <span className="text-slate-300 select-none">•</span>
            <span className="flex items-center gap-1"><IndianRupee size={13} className="text-[#2563EB]" /> {job.salary}</span>
            <span className="text-slate-300 select-none">•</span>
            <span className="flex items-center gap-1"><Briefcase size={13} className="text-[#2563EB]" /> {job.type}</span>
          </div>

          {job.chatLiveHours && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-3 bg-emerald-50/50 border border-emerald-100 rounded-lg px-2.5 py-1 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Chat: {job.chatLiveHours}
            </div>
          )}
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6" style={{ maxHeight: 'calc(100vh - 380px)' }}>
          {/* Compatibility score progress bar */}
          {candidateProfile.onboardingCompleted && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Candidate Fit</span>
                <span className={`text-xs font-black ${textColor}`}>{matchScore}% Match ({matchLabel})</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${matchScore}%` }} />
              </div>
            </div>
          )}

          {/* Skills Badges */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Key Skills Required</h4>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map(skill => (
                <span key={skill} className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1 rounded-lg font-bold">{skill}</span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Job Description</h4>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {/* Requirements */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Key Requirements</h4>
            <ul className="list-disc pl-5 text-slate-600 text-sm flex flex-col gap-1.5">
              {job.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Comp & Benefits</h4>
            <ul className="list-disc pl-5 text-slate-600 text-sm flex flex-col gap-1.5">
              {job.benefits.map((benefit, i) => (
                <li key={i}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sticky Apply Button Bar at Bottom */}
        <div className="p-6 border-t border-[#E5E7EB] bg-slate-50 flex-shrink-0">
          {isApplied ? (
            <div className="flex gap-3">
              {matchingApp?.status === 'Offered' ? (
                <button 
                  onClick={() => {
                    setContractApp(matchingApp);
                    setShowContractModal(true);
                  }}
                  className="flex-grow py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  ✍️ Sign Fair Work Contract
                </button>
              ) : (
                <div className="flex-grow text-center py-3 bg-slate-100 border border-slate-200 text-slate-500 font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 select-none">
                  📩 Applied {job.fairWorkPact && "• Pact Secured 🛡️"}
                </div>
              )}

              {job.fairWorkPact && (
                <button 
                  onClick={() => {
                    if (matchingApp) {
                      setContractApp(matchingApp);
                      setShowContractModal(true);
                    }
                  }}
                  className="px-4 py-3 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1"
                >
                  View Deed
                </button>
              )}
            </div>
          ) : (
            <button 
              onClick={() => {
                if (job.fairWorkPact) {
                  setPactChecked(false);
                  setTypedSignature('');
                  setShowApplyPactModal(true);
                } else {
                  handleApply(job.id);
                }
              }} 
              className="w-full py-3.5 px-6 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-extrabold rounded-xl shadow-lg shadow-blue-500/10 active:scale-98 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              {job.fairWorkPact ? '🛡️ Quick Apply with Fair Work Pact' : 'Apply Now'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const isLightMode = false; // Always use dark theme for the premium Acrylic & Pop Design System

  return (
    <>
      <div 
        className="w-full flex-grow flex flex-col animate-fade-in pb-16 relative z-10"
        style={{ 
          color: '#fff',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Onboarding Preference Overlay */}
        {candidateProfile.onboardingCompleted === false && (
          <OnboardingModal profile={candidateProfile} onSaveProfile={setCandidateProfile} />
        )}
        
        {/* Premium SaaS Greeting Card */}
        <div className="w-full bg-white border border-[#E5E7EB] p-5 rounded-2xl mb-6 shadow-sm">
          <div>
            {/* SaaS style badge showing active sidebar option */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">
              {activeTab === 'explore' && <><Briefcase size={10} className="text-[#2563EB]" /> Explore Jobs</>}
              {activeTab === 'govt' && <><span style={{ fontSize: '10px' }}>🏛️</span> Govt Jobs Info</>}
              {activeTab === 'applications' && <><FileText size={10} className="text-[#2563EB]" /> My Applications</>}
              {activeTab === 'profile' && <><UserCheck size={10} className="text-[#2563EB]" /> Candidate Profile</>}
              {activeTab === 'chats' && <><Sparkles size={10} className="text-[#2563EB]" /> AI Copilot Chats</>}
              {activeTab === 'settings' && <><Settings size={10} className="text-[#2563EB]" /> Settings</>}
              {activeTab === 'notifications' && <><Bell size={10} className="text-[#2563EB]" /> Notifications</>}
            </div>
            
            <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-0.5 font-sans flex items-center flex-wrap gap-2">
              <span>{locDetails.greeting} Welcome back, {candidateProfile.name}</span>
              {candidateProfile.preferences?.plan && (candidateProfile.preferences.plan === 'regular' || candidateProfile.preferences.plan === 'premium') && (
                <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/50 text-[10px] font-extrabold select-none">
                  🛡️ Verified Candidate
                </span>
              )}
            </h2>
            <p className="text-slate-500 text-xs font-medium">
              Let's land your dream workspace in {locDetails.city}.
            </p>

            {candidateProfile.preferences?.plan === 'premium' && (
              <div className="mt-4 p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1">
                    ✨ Premium Career Prep Kit Unlocked!
                  </h4>
                  <p className="text-[10px] text-blue-700 font-semibold mt-0.5">
                    Your exclusive Resume Review Guide and Mock Interview Prep sheets are ready for download.
                  </p>
                </div>
                <a 
                  href="/hyriq_premium_prep_kit.pdf" 
                  download 
                  className="inline-flex items-center justify-center gap-1 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer select-none no-underline border-none flex-shrink-0"
                >
                  📥 Download PDF Kit
                </a>
              </div>
            )}
          </div>
        </div>

        {/* EXPLORE JOBS VIEW */}
        {activeTab === 'explore' && (
          <>
          <div className="flex flex-col gap-4 w-full">
            {/* Unified Modern SaaS Filters Toolbar */}
            <div className="w-full bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm flex flex-col gap-4">
              {/* Row 1: Search Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 w-full focus-within:bg-white focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB] transition-all">
                  <Search size={16} className="text-[#2563EB] flex-shrink-0" />
                  <input
                    id="dashboard-search-input"
                    type="text"
                    placeholder="Search job title, skills, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-slate-900 text-xs font-semibold flex-1 placeholder-slate-400"
                  />
                </div>
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 w-full focus-within:bg-white focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB] transition-all">
                  <MapPin size={16} className="text-[#2563EB] flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search location (e.g. Bathinda, Remote)..."
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-slate-900 text-xs font-semibold flex-1 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Row 2: Selects, Chips, and Reset */}
              <div className="flex items-center gap-3 flex-wrap w-full border-t border-slate-100 pt-3">
                {/* Category */}
                <div className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 hover:border-slate-300 transition-all ${
                  categoryFilter ? 'badge-blue' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <Briefcase size={13} className={categoryFilter ? 'text-[#2563EB]' : 'text-slate-400'} />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className={`bg-transparent border-none outline-none text-xs font-bold cursor-pointer ${
                      categoryFilter ? 'text-[#2563EB]' : 'text-slate-700'
                    }`}
                  >
                    <option value="" className="bg-white text-slate-900">Category</option>
                    <option value="Tech & Engineering" className="bg-white text-slate-900">Tech & Engineering</option>
                    <option value="Design & Product" className="bg-white text-slate-900">Design & Product</option>
                    <option value="Marketing & Content" className="bg-white text-slate-900">Marketing & Content</option>
                    <option value="Sales & Operations" className="bg-white text-slate-900">Sales & Operations</option>
                  </select>
                </div>

                {/* Work Mode */}
                <div className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 hover:border-slate-300 transition-all ${
                  modeFilter.length > 0 ? 'badge-teal' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <MapPin size={13} className={modeFilter.length > 0 ? 'text-[#0D9488]' : 'text-slate-400'} />
                  <select
                    value={modeFilter.length === 1 ? modeFilter[0] : ''}
                    onChange={(e) => setModeFilter(e.target.value ? [e.target.value] : [])}
                    className={`bg-transparent border-none outline-none text-xs font-bold cursor-pointer ${
                      modeFilter.length > 0 ? 'text-[#0D9488]' : 'text-slate-700'
                    }`}
                  >
                    <option value="" className="bg-white text-slate-900">Mode</option>
                    <option value="Remote" className="bg-white text-slate-900">Remote</option>
                    <option value="Hybrid" className="bg-white text-slate-900">Hybrid</option>
                    <option value="On-site" className="bg-white text-slate-900">On-site</option>
                  </select>
                </div>

                {/* Job Type */}
                <div className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 hover:border-slate-300 transition-all ${
                  typeFilter.length > 0 ? 'badge-purple' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <FileText size={13} className={typeFilter.length > 0 ? 'text-[#7C3AED]' : 'text-slate-400'} />
                  <select
                    value={typeFilter.length === 1 ? typeFilter[0] : ''}
                    onChange={(e) => setTypeFilter(e.target.value ? [e.target.value] : [])}
                    className={`bg-transparent border-none outline-none text-xs font-bold cursor-pointer ${
                      typeFilter.length > 0 ? 'text-[#7C3AED]' : 'text-slate-700'
                    }`}
                  >
                    <option value="" className="bg-white text-slate-900">Type</option>
                    <option value="Full-time" className="bg-white text-slate-900">Full-time</option>
                    <option value="Part-time" className="bg-white text-slate-900">Part-time</option>
                    <option value="Internship" className="bg-white text-slate-900">Internship</option>
                    <option value="Contract" className="bg-white text-slate-900">Contract</option>
                  </select>
                </div>

                {/* Experience */}
                <div className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 hover:border-slate-300 transition-all ${
                  experienceFilter.length > 0 ? 'badge-pink' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <Sparkles size={13} className={experienceFilter.length > 0 ? 'text-[#EC4899]' : 'text-slate-400'} />
                  <select
                    value={experienceFilter.length === 1 ? experienceFilter[0] : ''}
                    onChange={(e) => setExperienceFilter(e.target.value ? [e.target.value] : [])}
                    className={`bg-transparent border-none outline-none text-xs font-bold cursor-pointer ${
                      experienceFilter.length > 0 ? 'text-[#EC4899]' : 'text-slate-700'
                    }`}
                  >
                    <option value="" className="bg-white text-slate-900">Experience</option>
                    <option value="Entry-level" className="bg-white text-slate-900">Entry</option>
                    <option value="Mid-level" className="bg-white text-slate-900">Mid</option>
                    <option value="Senior-level" className="bg-white text-slate-900">Senior</option>
                  </select>
                </div>

                {/* Reset Filters */}
                {(categoryFilter || modeFilter.length > 0 || typeFilter.length > 0 || experienceFilter.length > 0 || searchQuery || locationQuery) && (
                  <button
                    onClick={() => {
                      setCategoryFilter('');
                      setTypeFilter([]);
                      setModeFilter([]);
                      setExperienceFilter([]);
                      setSearchQuery('');
                      setLocationQuery('');
                    }}
                    className="text-red-500 border border-red-200 bg-red-50 hover:bg-red-100/70 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 flex-shrink-0"
                    title="Reset All Filters"
                  >
                    <X size={13} /> Reset
                  </button>
                )}

                {/* Matches Only Toggle */}
                {candidateProfile.onboardingCompleted && (
                  <button
                    type="button"
                    onClick={() => setMatchesOnly(!matchesOnly)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                      matchesOnly 
                        ? 'bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-[#7C3AED] shadow-sm' 
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Sparkles size={12} className={matchesOnly ? 'text-[#7C3AED]' : 'text-slate-400'} />
                    Match {matchesOnly ? 'ON' : 'OFF'}
                  </button>
                )}
                
                {/* Resume Upload Action */}
                <label className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-sm px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-all ml-auto flex-shrink-0 border-none active:scale-95">
                  <Upload size={14} className="text-white" />
                  {isUploadingResume ? 'Parsing...' : 'Sync Resume'}
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            {/* Recommended Roles Header */}
            <div className="flex justify-between items-center mt-2 mb-1">
              <h2 className="text-lg font-bold tracking-tight text-slate-800 font-sans">Recommended Roles</h2>
              <span className="text-xs bg-slate-100 border border-slate-200 text-slate-500 font-bold px-2.5 py-1 rounded-lg">
                {sortedJobs.length} Positions Available
              </span>
            </div>

            {/* Responsive 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
              {/* Left Column: Job Cards List (35% width on desktop) */}
              <div className="col-span-1 lg:col-span-5 flex flex-col gap-3.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {sortedJobs.length === 0 ? (
                  <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center text-slate-400 font-semibold shadow-sm">
                    No matching jobs found. Try adjusting your filters.
                  </div>
                ) : (
                  sortedJobs.map(job => {
                    const isSelected = selectedJob?.id === job.id;
                    const matchScore = getAIFeedback(job).score;
                    const initials = job.companyName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    return (
                      <div 
                        key={job.id}
                        onClick={() => handleSelectJob(job)}
                        className={`saas-card saas-card-hover p-5 cursor-pointer flex flex-col justify-between min-h-[170px] ${
                          isSelected ? 'saas-card-selected border-l-4 border-l-[#2563EB]' : ''
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-3 mb-2">
                            <div className="min-w-0">
                              <h4 className="text-slate-900 text-sm font-extrabold tracking-tight mb-0.5 truncate">{job.title}</h4>
                              <p className="text-slate-500 text-xs font-semibold truncate">{job.companyName}</p>
                            </div>
                            
                            {/* Initials Company Circle */}
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center font-bold text-[10px] flex-shrink-0 select-none">
                              {initials}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mb-3.5">
                            <span className="text-[9px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-bold">{job.mode}</span>
                            <span className="text-[9px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-bold">{job.type}</span>
                            <span className="text-[9px] bg-blue-50 border border-blue-100 text-[#2563EB] px-2 py-0.5 rounded-md font-extrabold">{job.salary}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2">
                          {candidateProfile.onboardingCompleted && (
                            <span className="text-[10px] font-extrabold text-[#2563EB] flex items-center gap-0.5">
                              ⚡ {matchScore}% Match
                            </span>
                          )}
                          
                          <div className="flex gap-1 overflow-hidden ml-auto">
                            {job.skills.slice(0, 2).map(skill => (
                              <span key={skill} className="text-[9px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md font-semibold truncate max-w-[70px]">{skill}</span>
                            ))}
                            {job.skills.length > 2 && <span className="text-[9px] text-slate-400 font-bold self-center">+{job.skills.length - 2}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: Sticky Details Panel (65% width on desktop) */}
              <div className="col-span-1 lg:col-span-7 sticky top-0 hidden lg:block max-h-[calc(100vh-280px)] pr-1">
                {selectedJob ? (
                  renderJobDetailsContent(selectedJob)
                ) : (
                  <div className="flex flex-col gap-6 h-full min-h-[380px] rounded-2xl p-6 bg-slate-900/40 border border-white/5 shadow-sm text-left">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div>
                        <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                          <Sparkles size={16} className="text-[#06b6d4]" /> Profile Analysis
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Real-time candidate compatibility scores</p>
                      </div>
                      <span className="bg-[#2563eb]/20 text-[#2563eb] text-[9px] font-extrabold px-2.5 py-1 rounded-full border border-[#2563eb]/20 uppercase">
                        AI Screened
                      </span>
                    </div>

                    {/* Gauges Grid */}
                    <div className="grid grid-cols-3 gap-4 py-2">
                      <div className="flex flex-col items-center text-center p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
                        <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-800" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-[#2563eb] drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]" strokeDasharray="58, 100" strokeWidth="2.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <span className="absolute text-xs font-black text-white">58%</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-300">Resume Quality</span>
                      </div>

                      <div className="flex flex-col items-center text-center p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
                        <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-800" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-[#06b6d4] drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" strokeDasharray="76, 100" strokeWidth="2.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <span className="absolute text-xs font-black text-white">76%</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-300">Skill Match</span>
                      </div>

                      <div className="flex flex-col items-center text-center p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
                        <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-800" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" strokeDasharray="75, 100" strokeWidth="2.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <span className="absolute text-xs font-black text-white">75%</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-300">Readiness</span>
                      </div>
                    </div>

                    {/* Recommended updates / optimizations */}
                    <div className="flex-1 flex flex-col gap-3 mt-2">
                      <h4 className="text-[10px] font-extrabold text-[#06b6d4] uppercase tracking-wider">AI Recommended For You</h4>
                      <div className="flex flex-col gap-2">
                        <div className="bg-slate-950/20 hover:bg-slate-950/40 border border-white/5 p-3 rounded-xl flex items-start gap-3 transition-colors">
                          <span className="w-5 h-5 rounded-full bg-blue-950 text-blue-400 border border-blue-900/30 flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">1</span>
                          <div>
                            <h5 className="text-[11px] font-extrabold text-white">Optimize Resume for TS & React Roles</h5>
                            <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">Your profile lacks certification references. Add references to boost score by 15%.</p>
                          </div>
                        </div>

                        <div className="bg-slate-950/20 hover:bg-slate-950/40 border border-white/5 p-3 rounded-xl flex items-start gap-3 transition-colors">
                          <span className="w-5 h-5 rounded-full bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/20 flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">2</span>
                          <div>
                            <h5 className="text-[11px] font-extrabold text-white">Complete screening question forms</h5>
                            <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">Answer custom screening questionnaires to qualify for fast-track recruiter pipeline.</p>
                          </div>
                        </div>

                        <div className="bg-slate-950/20 hover:bg-slate-950/40 border border-white/5 p-3 rounded-xl flex items-start gap-3 transition-colors">
                          <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-900/30 flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">3</span>
                          <div>
                            <h5 className="text-[11px] font-extrabold text-white">Record 30s Video Introduction</h5>
                            <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">Profiles with dynamic video presentations receive 3x more interviewer inquiries.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          </>
        )}

      {/* GOVT JOBS VIEW */}
      {/* GOVT JOBS VIEW */}
      {activeTab === 'govt' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
          {/* Left Column: Govt Jobs List (35% on desktop) */}
          <main className="col-span-1 lg:col-span-7 flex flex-col gap-4">
            
            {/* TABS ROW 1: Categories */}
            <div className="flex gap-2 flex-wrap mb-1">
              {[
                { id: 'all', label: 'All India Govt Jobs' },
                { id: 'bank', label: 'Bank Jobs' },
                { id: 'teaching', label: 'Teaching Jobs' },
                { id: 'engineering', label: 'Engineering Jobs' },
                { id: 'railway', label: 'Railway Jobs' },
                { id: 'defence', label: 'Police/Defence Jobs' },
                { id: 'saved', label: '❤️ Saved' }
              ].map(cat => {
                const isActive = selectedGovtCategory === cat.id && selectedGovtState === 'all';
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedGovtCategory(cat.id);
                      setSelectedGovtState('all');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all border-none ${
                      isActive 
                        ? 'bg-[#2563EB] text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* TABS ROW 2: States */}
            <div className="flex gap-2 flex-wrap mb-4 border-b border-slate-200 pb-4">
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
                    className={`px-2.5 py-1 rounded-md font-bold text-[11px] cursor-pointer transition-all border ${
                      isActive 
                        ? 'bg-[#2563EB] border-[#2563EB] text-white' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-bold text-slate-800">
                {selectedGovtState !== 'all' 
                  ? `${selectedGovtState.toUpperCase()} Government Notifications` 
                  : selectedGovtCategory !== 'all' 
                    ? `${selectedGovtCategory.toUpperCase()} Government Notifications`
                    : "National Government Notifications"
                }
              </h3>
              <span className="text-xs bg-blue-50 border border-blue-100 text-[#2563EB] font-bold px-2.5 py-1 rounded-lg">
                {govtJobs.length} Notifications Found
              </span>
            </div>

            {govtJobsLoading && (
              <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center shadow-sm">
                <div className="animate-pulse text-[#2563EB] font-bold text-sm">
                  ⏳ Fetching latest government job listings...
                </div>
              </div>
            )}

            {govtJobsError && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 text-xs font-semibold">
                ⚠️ {govtJobsError}
              </div>
            )}

            {!govtJobsLoading && !govtJobsError && govtJobs.length === 0 && (
              <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center text-slate-400 font-semibold shadow-sm">
                No active notifications found. Please check back later.
              </div>
            )}

            {!govtJobsLoading && !govtJobsError && govtJobs.length > 0 && (
              <div className="flex flex-col gap-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {govtJobs.map((job) => {
                  const isSelected = selectedGovtJob?.id === job.id;
                  return (
                    <div 
                      key={job.id}
                      onClick={() => handleSelectGovtJob(job)}
                      className={`saas-card saas-card-hover p-5 cursor-pointer flex flex-col justify-between min-h-[150px] ${
                        isSelected ? 'saas-card-selected border-l-4 border-l-[#2563EB]' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <div className="min-w-0">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200 text-[9px] mb-1.5">
                            🏛️ {job.recruitmentBoard}
                          </span>
                          <h4 className="text-slate-900 text-sm font-extrabold tracking-tight mb-1 leading-snug">
                            {job.title}
                          </h4>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center font-bold text-[10px] flex-shrink-0 select-none">
                          Govt
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap mb-2">
                        <span className="text-[9px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md font-semibold">📅 Posted: {job.postDate}</span>
                        <span className="text-[9px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md font-semibold">🎓 Req: {job.qualification}</span>
                        <span className="text-[9px] bg-red-50 border border-red-100 text-red-600 px-2 py-0.5 rounded-md font-bold">
                          ⌛ Last Date: {job.lastDate || '—'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400 border-t border-slate-100 pt-2.5 mt-1 font-medium">
                        <span>📍 State: {job.state ? job.state.toUpperCase() : 'National'}</span>
                        <span className="select-none text-slate-200">•</span>
                        <span>Category: {job.category ? job.category.toUpperCase() : 'General'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          {/* Right Column: Sticky Detail Panel (65% width on desktop) */}
          <aside className="col-span-1 lg:col-span-5 sticky top-0 hidden lg:block max-h-[calc(100vh-280px)] pr-1">
            {selectedGovtJob ? (
              <div className="saas-card p-6 flex flex-col gap-4 bg-white">
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200 text-[9px] mb-2">
                    {selectedGovtJob.recruitmentBoard}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {selectedGovtJob.title}
                  </h3>
                </div>

                {govtJobDetailsLoading ? (
                  <div className="p-12 text-center text-slate-400 font-semibold">
                    <div className="animate-pulse">
                      ⏳ Loading official job notifications, fee details & vacancy tables...
                    </div>
                  </div>
                ) : selectedGovtJobDetails ? (
                   <div 
                    className="saas-card"
                    dangerouslySetInnerHTML={{ __html: selectedGovtJobDetails }} 
                    style={{ 
                      padding: '16px', 
                      background: '#F8FAFC', 
                      borderRadius: '12px', 
                      border: '1px solid #E5E7EB',
                      color: '#475569',
                      fontSize: '12px',
                      boxShadow: 'none',
                      maxHeight: 'calc(100vh - 460px)',
                      overflowY: 'auto'
                    }}
                  />
                ) : (
                  <div className="flex flex-col gap-3 border-t border-b border-slate-100 py-4">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <span className="text-slate-400 font-bold">Advt No:</span>
                      <span className="text-slate-700 font-semibold col-span-2">{selectedGovtJob.advtNo || '—'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <span className="text-slate-400 font-bold">Qualification:</span>
                      <span className="text-slate-700 font-bold col-span-2">{selectedGovtJob.qualification}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <span className="text-slate-400 font-bold">Last Date:</span>
                      <span className="text-slate-700 font-bold col-span-2">{selectedGovtJob.lastDate || '—'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <span className="text-slate-400 font-bold">Posted On:</span>
                      <span className="text-slate-700 font-semibold col-span-2">{selectedGovtJob.postDate}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => handleToggleSaveGovtJob(selectedGovtJob)}
                    style={{ flex: 1, padding: '10px', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: savedGovtJobs.some(sj => sj.id === selectedGovtJob.id) ? '#EF4444' : '#475569', borderColor: savedGovtJobs.some(sj => sj.id === selectedGovtJob.id) ? '#EF4444' : '#E5E7EB', borderStyle: 'solid', borderWidth: '1px', background: savedGovtJobs.some(sj => sj.id === selectedGovtJob.id) ? '#FEF2F2' : '#ffffff', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {savedGovtJobs.some(sj => sj.id === selectedGovtJob.id) ? '❤️ Saved' : '🤍 Save Job'}
                  </button>
                  <div style={{ flex: 1.5, position: 'relative' }}>
                    {govtResourceLinks.length > 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowLinksDropdown(!showLinksDropdown)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: '#2563EB',
                            color: '#fff',
                            fontWeight: 700,
                            padding: '10px',
                            borderRadius: '12px',
                            fontSize: '13px',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Apply Online ▾
                        </button>
                        
                        {showLinksDropdown && (
                          <div style={{
                            position: 'absolute',
                            bottom: '100%',
                            right: 0,
                            marginBottom: '8px',
                            background: '#ffffff',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                            zIndex: 100,
                            width: '240px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                            <div style={{ padding: '8px 12px', fontSize: '11px', color: '#94A3B8', borderBottom: '1px solid #F1F5F9', fontWeight: 600 }}>
                              SELECT LINK:
                            </div>
                            {govtResourceLinks.map((link, idx) => (
                              <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setShowLinksDropdown(false)}
                                style={{
                                  padding: '10px 12px',
                                  fontSize: '12px',
                                  color: '#475569',
                                  textDecoration: 'none',
                                  borderBottom: idx < govtResourceLinks.length - 1 ? '1px solid #F1F5F9' : 'none',
                                  display: 'block',
                                  textAlign: 'left',
                                  fontWeight: 600
                                }}
                              >
                                🔗 {link.label || 'Link'}
                              </a>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <a
                        href={currentGovtApplyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="saas-btn-primary"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: '#2563EB',
                          color: '#fff',
                          fontWeight: 700,
                          padding: '10px',
                          borderRadius: '12px',
                          textAlign: 'center',
                          fontSize: '13px',
                          textDecoration: 'none'
                        }}
                      >
                        Apply Online ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 bg-white shadow-sm">
                Select a notification to view application details.
              </div>
            )}
          </aside>
        </div>
      )}

      {/* APPLICATIONS VIEW */}
      {activeTab === 'applications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
          {/* Applications list / Saved jobs toggler (35% on desktop) */}
          <aside className="col-span-1 lg:col-span-4 bg-white border border-[#E5E7EB] p-5 rounded-2xl shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
              My Workspace
            </h3>

            {/* Applications sub-tab toggler */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1.5">
              <button
                onClick={() => setApplicationsSubTab('applied')}
                className={`flex-1 py-1.5 rounded-lg border-none text-xs font-bold cursor-pointer transition-all ${
                  applicationsSubTab === 'applied' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'bg-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                📩 Applied ({applications.length})
              </button>
              <button
                onClick={() => setApplicationsSubTab('saved')}
                className={`flex-1 py-1.5 rounded-lg border-none text-xs font-bold cursor-pointer transition-all ${
                  applicationsSubTab === 'saved' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'bg-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                ❤️ Saved ({savedGovtJobs.length})
              </button>
            </div>

            {applicationsSubTab === 'applied' ? (
              applications.length === 0 ? (
                <p className="text-slate-400 text-xs font-semibold text-center py-6">
                  You haven't applied to any jobs yet. Check "Explore Jobs"!
                </p>
              ) : (
                <div className="flex flex-col gap-3 max-h-[calc(100vh-380px)] overflow-y-auto pr-1">
                  {applications.map(app => {
                    const job = jobs.find(j => j.id === app.jobId);
                    const isSelected = selectedApp?.id === app.id;
                    if (!job) return null;

                    return (
                      <div
                        key={app.id}
                        onClick={() => setSelectedApp(app)}
                        className={`saas-card saas-card-hover p-4 cursor-pointer flex flex-col gap-2 ${
                          isSelected ? 'saas-card-selected border-l-4 border-l-[#2563EB]' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <h4 className="text-slate-900 text-xs font-extrabold truncate">{job.title}</h4>
                            <p className="text-slate-500 text-[10px] font-semibold truncate">{job.companyName}</p>
                          </div>
                          {getStatusBadge(app.status)}
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-1 text-[9px] text-slate-400 font-semibold">
                          <span>Applied: {app.appliedDate}</span>
                          {app.chatHistory.length > 0 && (
                            <span className="flex items-center gap-0.5 text-[#2563EB]">
                              <MessageCircle size={9} /> Active chat
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              savedGovtJobs.length === 0 ? (
                <p className="text-slate-400 text-xs font-semibold text-center py-6">
                  No saved jobs yet. Heart any listing under explore or govt jobs to save!
                </p>
              ) : (
                <div className="flex flex-col gap-3 max-h-[calc(100vh-380px)] overflow-y-auto pr-1">
                  {savedGovtJobs.map(job => {
                    const isSelected = selectedSavedJob?.id === job.id;
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedSavedJob(job)}
                        className={`saas-card saas-card-hover p-4 cursor-pointer flex flex-col gap-2 ${
                          isSelected ? 'saas-card-selected border-l-4 border-l-[#2563EB]' : ''
                        }`}
                      >
                        <h4 className="text-slate-900 text-xs font-extrabold truncate">{job.title}</h4>
                        <p className="text-slate-500 text-[10px] font-semibold truncate">{job.companyName || 'Govt Department'}</p>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-1 text-[9px] text-slate-400 font-semibold">
                          <span>📍 {job.location || 'India'}</span>
                          <span className="text-[#2563EB] font-bold">Saved</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </aside>

          {/* Details / Chat Window Panel (65% on desktop) */}
          <main className="col-span-1 lg:col-span-8 w-full">
            {applicationsSubTab === 'applied' ? (
              currentApp ? (
                <div className="flex flex-col gap-4">
                  {/* Job info header */}
                  <div className="bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm flex justify-between items-center gap-4 flex-wrap">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chatting about</span>
                      <h4 className="text-slate-900 text-sm font-extrabold leading-snug">
                        {jobs.find(j => j.id === currentApp.jobId)?.title} at {jobs.find(j => j.id === currentApp.jobId)?.companyName}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {jobs.find(j => j.id === currentApp.jobId)?.fairWorkPact && (
                        <button
                          onClick={() => {
                            setContractApp(currentApp);
                            setShowContractModal(true);
                          }}
                          className="px-3 py-1.5 bg-white border border-[#E5E7EB] hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1"
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
                    title={`${currentApp.recruiterName || currentApp.recruiterSignature || 'Recruiter'}`}
                    showReciprocalBanner={currentApp.status === 'Shortlisted' || currentApp.status === 'Interview'}
                    onConfirmProfile={() => {
                      sendChatMessage(currentApp.id, "[SYSTEM: Candidate confirmed profile and verified mutual interest.]", 'candidate');
                    }}
                  />
                </div>
              ) : (
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center text-slate-400 min-h-[380px] flex flex-col items-center justify-center shadow-sm">
                  <MessageCircle size={36} className="text-[#2563EB] mb-3" />
                  <h3 className="text-slate-900 text-sm font-extrabold mb-1">Employer Direct Chat</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Select an application from the sidebar to view status and chat directly with recruiters.
                  </p>
                </div>
              )
            ) : (
              selectedSavedJob ? (
                <div className="saas-card p-6 flex flex-col gap-4 bg-white">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4 gap-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">{selectedSavedJob.title}</h3>
                      <p className="text-xs text-slate-500 font-semibold">{selectedSavedJob.companyName || 'Government Department'}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSavedGovtJobs(savedGovtJobs.filter(sj => sj.id !== selectedSavedJob.id));
                        setSelectedSavedJob(null);
                      }}
                      className="px-3 py-1.5 border border-red-200 bg-red-50 hover:bg-red-100/70 text-red-600 rounded-xl font-bold text-xs cursor-pointer transition-all border-none"
                    >
                      Remove Save
                    </button>
                  </div>

                  {savedJobDetailsLoading ? (
                    <div className="py-12 text-center text-slate-400 font-semibold">Loading detailed specifications...</div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div 
                        className="saas-card"
                        dangerouslySetInnerHTML={{ __html: savedJobDetailsHtml }} 
                        style={{ 
                          padding: '16px', 
                          background: '#F8FAFC', 
                          borderRadius: '12px', 
                          border: '1px solid #E5E7EB',
                          fontSize: '12.5px',
                          color: '#475569',
                          boxShadow: 'none',
                          maxHeight: 'calc(100vh - 460px)',
                          overflowY: 'auto'
                        }}
                      />
                      
                      {/* Apply button and links dropdown */}
                      <div className="mt-2 border-t border-slate-100 pt-4 flex items-center justify-start gap-3">
                        {savedJobResourceLinks.length > 0 ? (
                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={() => setShowSavedLinksDropdown(!showSavedLinksDropdown)}
                              className="saas-btn-primary py-2 px-4 text-xs font-bold rounded-xl"
                            >
                              Apply Online ▾
                            </button>
                            {showSavedLinksDropdown && (
                              <div style={{
                                position: 'absolute',
                                bottom: '46px',
                                left: 0,
                                background: '#ffffff',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                                width: '220px',
                                zIndex: 10,
                                overflow: 'hidden'
                              }}>
                                {savedJobResourceLinks.map((link, idx) => (
                                  <a
                                    key={idx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={() => setShowSavedLinksDropdown(false)}
                                    style={{
                                      display: 'block',
                                      padding: '10px 14px',
                                      color: '#475569',
                                      textDecoration: 'none',
                                      fontSize: '12.5px',
                                      fontWeight: 600,
                                      borderBottom: idx < savedJobResourceLinks.length - 1 ? '1px solid #F1F5F9' : 'none',
                                      background: 'transparent'
                                    }}
                                  >
                                    🔗 {link.label}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <a
                            href={savedJobApplyLink}
                            target="_blank"
                            rel="noreferrer"
                            className="saas-btn-primary text-xs font-bold rounded-xl text-center py-2 px-4 no-underline"
                          >
                            Apply Online
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center text-slate-400 min-h-[380px] flex flex-col items-center justify-center shadow-sm">
                  <span className="text-4xl mb-3 select-none">❤️</span>
                  <h3 className="text-slate-900 text-sm font-extrabold mb-1">Saved Jobs & Listings</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Select a saved job from the sidebar to view details, links, and apply.
                  </p>
                </div>
              )
            )}
          </main>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
          {/* Main Info Card (8 columns on desktop) */}
          <main className="col-span-1 lg:col-span-8 flex flex-col gap-6">
            <div className="saas-card bg-white border border-[#E5E7EB] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">
                👤 Personal Details & Profile Avatar
              </h3>

              {/* AI Resume Upload Section */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
                <h4 className="text-slate-800 font-extrabold text-sm flex items-center gap-1.5 mb-1.5">
                  <Sparkles size={16} className="text-[#2563EB]" /> Smart AI Resume Parsing
                </h4>
                <p className="text-slate-500 text-xs font-semibold mb-4 leading-relaxed">
                  Upload your PDF resume. Our AI will automatically extract your skills, experience, and tailor your job feed to find the best matches.
                </p>
                
                <div className="flex items-center gap-4 flex-wrap mb-4">
                  <label 
                    htmlFor="ai-resume-upload-profile"
                    className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border-none"
                  >
                    {isUploadingResume ? (
                      <><RefreshCw size={14} className="animate-spin" /> Parsing Resume...</>
                    ) : (
                      <><Upload size={14} /> Select PDF Resume</>
                    )}
                  </label>
                  <input 
                    type="file" 
                    id="ai-resume-upload-profile" 
                    accept="application/pdf" 
                    onChange={handleResumeUpload}
                    disabled={isUploadingResume}
                    style={{ display: 'none' }} 
                  />
                  
                  {candidateProfile.resumeName && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle size={14} /> Active: {candidateProfile.resumeName}
                    </span>
                  )}
                </div>

                <div className="border-t border-blue-100/50 pt-4 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Don't have a professional resume?</span>
                  <button 
                    type="button"
                    onClick={() => setShowResumeBuilderModal(true)}
                    className="inline-flex items-center gap-1.5 text-[#2563EB] hover:text-[#1d4ed8] text-xs font-black cursor-pointer transition-all bg-transparent border-none p-0"
                  >
                    🎨 Design Resume Free
                  </button>
                </div>
              </div>

              {/* Avatar / DP Picker */}
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 block mb-2.5 uppercase tracking-wider">Select App Display Picture (DP)</label>
                <div className="flex gap-2.5 flex-wrap items-center">
                  {['🧑‍💻', '🚀', '🤖', '🎨', '💼', '🎓', '🦖', '🌟', '🦄'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setProfileAvatar(emoji)}
                      className={`w-11 h-11 rounded-full text-xl cursor-pointer flex items-center justify-center transition-all border ${
                        profileAvatar === emoji 
                          ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-md shadow-blue-500/10' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}

                  {/* Custom Upload Button */}
                  <label 
                    htmlFor="profile-image-upload-input"
                    className="w-11 h-11 rounded-full border border-dashed border-[#2563EB] bg-slate-50 cursor-pointer flex items-center justify-center transition-all text-slate-500 hover:bg-[#2563EB]/5 hover:text-[#2563EB]"
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

              <form onSubmit={handleProfileSave} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Full Name</label>
                    <input 
                      type="text" 
                      value={profileName} 
                      onChange={(e) => setProfileName(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all" 
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Experience Tier</label>
                    <select 
                      value={profileExperience}
                      onChange={(e) => setProfileExperience(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all"
                      style={{ height: '42px' }}
                    >
                      <option value="Entry-level">Entry-level</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior-level">Senior-level</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Email Address</label>
                    <input 
                      type="email" 
                      value={profileEmail} 
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all" 
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Phone Number</label>
                    <input 
                      type="tel" 
                      value={profilePhone} 
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all" 
                      required 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Bio / Intro</label>
                  <textarea 
                    value={profileBio} 
                    onChange={(e) => setProfileBio(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all" 
                    rows={4}
                    style={{ resize: 'none' }}
                    required
                  />
                </div>

                <div className="flex gap-3 items-center flex-wrap mt-2">
                  <button type="submit" className="saas-btn-primary border-none">Save Personal Details</button>
                  
                  {candidateProfile.onboardingCompleted && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setCandidateProfile(prev => ({ ...prev, onboardingCompleted: false }));
                        alert('Preferences reset! You will be guided to the onboarding vibe setup.');
                      }}
                      className="px-4 py-2 border border-red-200 bg-red-50 hover:bg-red-100/70 text-red-600 rounded-xl font-bold text-xs cursor-pointer transition-all border-none"
                    >
                      Reset Onboarding Quiz
                    </button>
                  )}

                  {profileSaved && <span className="text-emerald-600 text-xs font-bold">✓ Info saved in profile</span>}
                </div>
              </form>
            </div>

            {/* Academics & Qualifications Editor */}
            <div className="saas-card bg-white border border-[#E5E7EB] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
                🎓 Academics & Qualifications
              </h3>
              
              {/* Existing Academic Entries */}
              <div className="flex flex-col gap-3 mb-5">
                {academics.length === 0 ? (
                  <p className="text-slate-400 text-xs font-semibold">No academic credentials added yet.</p>
                ) : (
                  academics.map((acad, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-xl">
                      <div>
                        <strong className="text-slate-800 text-sm">{acad.degree}</strong>
                        <p className="text-xs text-slate-500 mt-0.5">{acad.school} ({acad.year}) — {acad.grade}</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveAcademic(idx)}
                        className="border-none bg-transparent text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Academic Form */}
              <form onSubmit={handleAddAcademic} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Add Qualification</span>
                <input 
                  type="text" 
                  value={newDegree} 
                  onChange={(e) => setNewDegree(e.target.value)} 
                  placeholder="Degree e.g. B.Tech Computer Science" 
                  className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all" 
                />
                <input 
                  type="text" 
                  value={newSchool} 
                  onChange={(e) => setNewSchool(e.target.value)} 
                  placeholder="School / University Name" 
                  className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all" 
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    value={newAcadYear} 
                    onChange={(e) => setNewAcadYear(e.target.value)} 
                    placeholder="Year (e.g. 2025)" 
                    className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all" 
                  />
                  <input 
                    type="text" 
                    value={newGrade} 
                    onChange={(e) => setNewGrade(e.target.value)} 
                    placeholder="Score / Grade (e.g. 8.5 CGPA)" 
                    className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all" 
                  />
                </div>
                <button type="submit" className="saas-btn-secondary py-2 px-4 rounded-xl flex items-center justify-center gap-1">
                  <Plus size={14} /> Add Academic Record
                </button>
              </form>
            </div>

            {/* Work Experiences Editor */}
            <div className="saas-card bg-white border border-[#E5E7EB] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
                💼 Past Work Experience
              </h3>

              {/* Existing Work Entries */}
              <div className="flex flex-col gap-3 mb-5">
                {workExperiences.length === 0 ? (
                  <p className="text-slate-400 text-xs font-semibold">No work history added yet.</p>
                ) : (
                  workExperiences.map((work, idx) => (
                    <div key={idx} className="flex justify-between items-start bg-slate-50 border border-slate-200 p-4 rounded-xl">
                      <div>
                        <strong className="text-slate-800 text-sm">{work.role} at {work.company}</strong>
                        <span className="text-[10px] font-bold text-[#2563EB] block mt-0.5">{work.duration}</span>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{work.description}</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveExperience(idx)}
                        className="border-none bg-transparent text-rose-500 hover:text-rose-700 cursor-pointer mt-0.5"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Work Form */}
              <form onSubmit={handleAddExperience} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Add Work Experience</span>
                <input 
                  type="text" 
                  value={newRole} 
                  onChange={(e) => setNewRole(e.target.value)} 
                  placeholder="Job Role / Title e.g. React Developer" 
                  className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all" 
                />
                <input 
                  type="text" 
                  value={newCompany} 
                  onChange={(e) => setNewCompany(e.target.value)} 
                  placeholder="Company / Employer Name" 
                  className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all" 
                />
                <input 
                  type="text" 
                  value={newWorkDuration} 
                  onChange={(e) => setNewWorkDuration(e.target.value)} 
                  placeholder="Duration (e.g. June 2024 - Dec 2024)" 
                  className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all" 
                />
                <textarea 
                  value={newWorkDesc} 
                  onChange={(e) => setNewWorkDesc(e.target.value)} 
                  placeholder="Role description & key deliverables..." 
                  className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all" 
                  rows={2}
                  style={{ resize: 'none' }}
                />
                <button type="submit" className="saas-btn-secondary py-2 px-4 rounded-xl flex items-center justify-center gap-1">
                  <Plus size={14} /> Add Experience record
                </button>
              </form>
            </div>

            {/* Certifications Editor */}
            <div className="saas-card bg-white border border-[#E5E7EB] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
                📜 Certifications & Credentials
              </h3>

              {/* Existing Certs Entries */}
              <div className="flex flex-col gap-3 mb-5">
                {certifications.length === 0 ? (
                  <p className="text-slate-400 text-xs font-semibold">No certifications added yet.</p>
                ) : (
                  certifications.map((cert, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-xl">
                      <div>
                        <strong className="text-slate-800 text-sm">{cert.name}</strong>
                        <p className="text-xs text-slate-500 mt-0.5">{cert.issuer} ({cert.year})</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveCertification(idx)}
                        className="border-none bg-transparent text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Cert Form */}
              <form onSubmit={handleAddCertification} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Add Certification</span>
                <input 
                  type="text" 
                  value={newCertName} 
                  onChange={(e) => setNewCertName(e.target.value)} 
                  placeholder="Credential Name e.g. AWS practitioner" 
                  className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all" 
                />
                <input 
                  type="text" 
                  value={newCertIssuer} 
                  onChange={(e) => setNewCertIssuer(e.target.value)} 
                  placeholder="Issuer Organisation e.g. Amazon Web Services" 
                  className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all" 
                />
                <input 
                  type="text" 
                  value={newCertYear} 
                  onChange={(e) => setNewCertYear(e.target.value)} 
                  placeholder="Year Achieved" 
                  className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all" 
                />
                <button type="submit" className="saas-btn-secondary py-2 px-4 rounded-xl flex items-center justify-center gap-1">
                  <Plus size={14} /> Add Certification
                </button>
              </form>
            </div>
          </main>

          {/* Live CV Resume Card Preview Panel (Aside) */}
          <aside className="col-span-1 lg:col-span-4 flex flex-col gap-6 sticky top-20">
            <div className="saas-card bg-white border border-[#E5E7EB] p-6 shadow-sm flex flex-col gap-5">
              {/* Profile Card Header */}
              <div className="flex gap-4 items-center justify-between flex-wrap-reverse">
                <div className="flex-1 min-w-[150px]">
                  {/* Visual Page dots */}
                  <div className="flex gap-1.5 mb-2.5">
                    <span className="width-2 height-2 rounded-full bg-[#2563EB] w-1.5 h-1.5"></span>
                    <span className="width-2 height-2 rounded-full bg-slate-200 w-1.5 h-1.5"></span>
                    <span className="width-2 height-2 rounded-full bg-slate-200 w-1.5 h-1.5"></span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 uppercase leading-none tracking-tight">
                    {profileName ? profileName.split(' ')[0] : 'Candidate'}<br/>
                    {profileName ? profileName.split(' ').slice(1).join(' ') : 'Name'}
                  </h2>
                  <span className="text-[9px] font-extrabold text-slate-400 block mt-1.5 uppercase tracking-widest leading-none">
                    {profileExperience ? `${profileExperience.toUpperCase()} PROFESSIONAL` : 'JOB SEEKER'}
                  </span>
                </div>
                
                {/* Highlighted DP Container */}
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 p-1 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {profileAvatar && (profileAvatar.startsWith('data:image/') || profileAvatar.startsWith('http')) ? (
                      <img src={profileAvatar} alt="DP" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl select-none">{profileAvatar}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Layout Grid inside Card */}
              <div className="flex flex-col gap-4 border-t border-slate-100 pt-4">
                
                {/* About Me block */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-xs opacity-20 select-none">🏁</div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">About Me</span>
                  <p className="text-slate-600 text-xs leading-relaxed margin-none">
                    {profileBio || 'Write a brief description about your core competencies, qualifications, and personal career path objectives.'}
                  </p>
                </div>

                {/* Education */}
                {academics.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Education</span>
                    <div className="flex flex-col gap-2">
                      {academics.map((acad, idx) => (
                        <div key={idx} className="relative pl-3 border-l-2 border-l-[#2563EB] text-xs">
                          <strong className="text-slate-800 font-bold block">{acad.degree}</strong>
                          <span className="text-slate-500 block">{acad.school}</span>
                          <span className="text-slate-400 block text-[10px] mt-0.5">Year: {acad.year} • Score: {acad.grade}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills with Progress bars */}
                {candidateProfile.skills.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Skills & Proficiencies</span>
                    <div className="flex flex-col gap-2.5">
                      {candidateProfile.skills.map((skill, index) => (
                        <div key={skill} className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-600 font-semibold">{skill}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="border-none bg-transparent text-rose-500 hover:text-rose-700 cursor-pointer p-0 text-[10px] font-bold"
                            >
                              Remove
                            </button>
                          </div>
                          {/* Visual Progress bar */}
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#2563EB] rounded-full" 
                              style={{ width: `${Math.max(45, 95 - index * 10)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Experiences */}
                {workExperiences.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Experience Timeline</span>
                    <div className="flex flex-col gap-3">
                      {workExperiences.map((work, idx) => (
                        <div key={idx} className="relative pl-3 border-l-2 border-l-[#2563EB] text-xs">
                          <strong className="text-slate-800 font-bold block">{work.role}</strong>
                          <span className="text-[#2563EB] font-bold block mt-0.5">{work.company}</span>
                          <span className="text-slate-400 block text-[10px] mt-0.5">{work.duration}</span>
                          <p className="text-slate-500 text-xs mt-1 leading-relaxed">{work.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {certifications.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Certifications</span>
                    <div className="flex flex-col gap-2">
                      {certifications.map((cert, idx) => (
                        <div key={idx} className="text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                          🏆 <strong className="text-slate-800 font-bold">{cert.name}</strong>
                          <p className="text-slate-400 text-[10px] mt-0.5">{cert.issuer} — {cert.year}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Contact Card Bar */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-1.5 text-xs text-slate-600 font-semibold mt-2.5">
                <div className="flex items-center gap-1.5">✉️ <strong>{profileEmail}</strong></div>
                <div className="flex items-center gap-1.5">📞 <strong>{profilePhone}</strong></div>
                <div className="flex items-center gap-1.5">📍 <strong>{currentLocation}, {locDetails.state}</strong></div>
              </div>
            </div>

            {/* Add Skill Widget inside preview column */}
            <div className="saas-card bg-white border border-[#E5E7EB] p-5 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                Quick Add Skill
              </h4>
              <form onSubmit={handleAddSkill} className="flex gap-2 w-full">
                <input 
                  type="text" 
                  value={newSkill} 
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g. React, Python..." 
                  className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all flex-1" 
                />
                <button type="submit" className="saas-btn-primary py-2 px-3 rounded-xl border-none flex items-center justify-center flex-shrink-0">
                  <Plus size={16} />
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}

      {/* SETTINGS VIEW */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
          {/* Account Settings Header */}
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">⚙️ App Settings</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">Manage your account, privacy, notifications, and app preferences.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* Section 1: Account & Profile */}
             <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col gap-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">1. Account & Profile</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Account Type Perspective</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPerspective('candidate')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border-none cursor-pointer transition-all ${
                        perspective === 'candidate' 
                          ? 'bg-[#2563EB] text-white shadow-sm shadow-blue-500/10' 
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Job Seeker
                    </button>
                    <button
                      type="button"
                      onClick={() => setPerspective('recruiter')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border-none cursor-pointer transition-all ${
                        perspective === 'recruiter' 
                          ? 'bg-[#2563EB] text-white shadow-sm shadow-blue-500/10' 
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Recruiter
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Region/Location (National)</label>
                  <select 
                    className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all"
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                  >
                    {Object.keys(SUPPORTED_LOCATIONS).map(loc => (
                      <option key={loc} value={loc}>
                        {loc} ({SUPPORTED_LOCATIONS[loc].state})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Portfolio & Website Link</label>
                  <input 
                    type="url" 
                    placeholder="https://myportfolio.com" 
                    className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all"
                  />
                </div>
             </div>

             {/* Section 2: Notifications */}
             <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col gap-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2. Notifications</h4>
                
                <label className="flex justify-between items-center cursor-pointer text-xs font-semibold text-slate-600">
                  <span>Direct Messages (Chat)</span>
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] w-4 h-4" />
                </label>

                <label className="flex justify-between items-center cursor-pointer text-xs font-semibold text-slate-600">
                  <span>Application status updates</span>
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] w-4 h-4" />
                </label>

                <label className="flex justify-between items-center cursor-pointer text-xs font-semibold text-slate-600">
                  <span>Interview requests</span>
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] w-4 h-4" />
                </label>

                <label className="flex justify-between items-center cursor-pointer text-xs font-semibold text-slate-600">
                  <span>Daily email job matches</span>
                  <input type="checkbox" className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] w-4 h-4" />
                </label>
             </div>

             {/* Section 3: Privacy & Visibility */}
             <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col gap-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">3. Privacy & Visibility</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Profile Status</label>
                  <select className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all">
                    <option>Actively Looking</option>
                    <option>Open to Offers</option>
                    <option>Not Looking</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Resume Visibility</label>
                  <select className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all">
                    <option>Public to all recruiters</option>
                    <option>Visible only to applied jobs</option>
                    <option>Completely hidden</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Block Companies</label>
                  <input 
                    type="text" 
                    placeholder="Enter company names to block..." 
                    className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all"
                  />
                </div>
             </div>

             {/* Section 4: Security & Access */}
             <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col gap-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">4. Security & Access</h4>
                
                <label className="flex justify-between items-center cursor-pointer text-xs font-semibold text-slate-600">
                  <span>Two-Factor (2FA)</span>
                  <input type="checkbox" className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] w-4 h-4" />
                </label>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Reset Password</label>
                  <input 
                    type="password" 
                    placeholder="New password" 
                    className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all"
                  />
                </div>

                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  🛡️ Active Sessions: 1 (Android WebView)
                </div>
             </div>

             {/* Section 5: App Preferences */}
             <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col gap-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">5. App Preferences</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Appearance Theme</label>
                  <select className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all">
                    <option>Light Mode (Default)</option>
                    <option>Dark Mode</option>
                    <option>System Default</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">App Language / ਬੋਲੀ</label>
                  <select className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all">
                    <option>English</option>
                    <option>Punjabi (ਪੰਜਾਬੀ)</option>
                    <option>Hindi (हिन्दी)</option>
                  </select>
                </div>

                <label className="flex justify-between items-center cursor-pointer text-xs font-semibold text-slate-600">
                  <span>Auto-play Wi-Fi Only</span>
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] w-4 h-4" />
                </label>
             </div>
          </div>
        </div>
      )}
      {activeTab === 'workspace' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Welcome greeting with Availability Toggle switch */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Career Hub</h2>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Manage applications and discover matched openings.</p>
            </div>

            {/* Prominent Availability Toggle switch */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg">
              <span className="text-xs font-semibold text-slate-700">Update Availability</span>
              <button 
                onClick={() => setIsAvailable(!isAvailable)}
                className={`w-11 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${isAvailable ? 'bg-[#2563eb]' : 'bg-slate-300'}`}
              >
                <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ${isAvailable ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>

          {/* Top Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div className="card-flat" style={{ padding: '20px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Profile Views</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>142</div>
              <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>+12% this week</div>
            </div>
            <div className="card-flat" style={{ padding: '20px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Applications Sent</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{applications.length}</div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>Active pipelines</div>
            </div>
            <div className="card-flat" style={{ padding: '20px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Active Matches</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>
                {jobs.filter(job => {
                  if (candidateProfile.skills && candidateProfile.skills.length > 0) {
                    return candidateProfile.skills.some(skill => 
                      job.title.toLowerCase().includes(skill.toLowerCase()) || 
                      job.description.toLowerCase().includes(skill.toLowerCase())
                    );
                  }
                  return true;
                }).length}
              </div>
              <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600, marginTop: '4px' }}>Highly aligned</div>
            </div>
          </div>

          {/* Main Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }} className="workspace-main-grid">
            {/* Left Column: Tailored Recommended Roles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '8px 0 0 0' }}>Recommended Roles</h3>
              {(() => {
                const recommended = jobs.filter(job => {
                  if (candidateProfile.skills && candidateProfile.skills.length > 0) {
                    return candidateProfile.skills.some(skill => 
                      job.title.toLowerCase().includes(skill.toLowerCase()) || 
                      job.description.toLowerCase().includes(skill.toLowerCase())
                    );
                  }
                  return true;
                }).slice(0, 5);

                if (recommended.length === 0) {
                  return (
                    <div className="card-flat p-8 text-center text-slate-500">
                      <p className="text-xs">No recommended roles matching your skill tags. Try updating your profile!</p>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {recommended.map(job => {
                      const alreadyApplied = applications.some(app => app.jobId === job.id);
                      return (
                        <div 
                          key={job.id} 
                          className="card-flat p-5 flex justify-between items-center relative group hover:border-[#2563eb]/30"
                        >
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: '1px solid #f1f5f9' }}>
                              {job.logoSeed || '💼'}
                            </div>
                            <div>
                              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{job.title}</h4>
                              <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0' }}>{job.companyName} • {job.location}</p>
                              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{job.type}</span>
                                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{job.mode}</span>
                              </div>
                            </div>
                          </div>

                          {/* Hover Quick Apply action */}
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {alreadyApplied ? (
                              <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded">Applied</span>
                            ) : (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleApply(job.id)}
                                  className="btn-primary py-1.5 px-3.5 text-xs"
                                >
                                  Quick Apply
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Right Column: Profile Strength & Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Profile Completion Card */}
              <div className="card-flat" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Profile Strength</h3>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: candidateProfile.onboardingCompleted ? '#10b981' : '#f97316' }}>
                    {candidateProfile.onboardingCompleted ? 'Complete' : 'In Progress'}
                  </span>
                </div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: candidateProfile.onboardingCompleted ? '100%' : '60%',
                    background: '#2563eb',
                    borderRadius: '3px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="btn-primary py-1.5 px-4 text-xs"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card-flat" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={() => setActiveTab('explore')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#475569',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Find Jobs
                  </button>
                  <button
                    onClick={() => setActiveTab('chats')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#475569',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    View Chats
                  </button>
                  <button
                    onClick={() => setActiveTab('govt')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#475569',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Govt Jobs
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#475569',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHATS VIEW - Active Chat Threads with Employers */}
      {activeTab === 'chats' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-bold text-slate-800">Active Conversations</h3>
            <span className="text-xs bg-blue-50 border border-blue-100 text-[#2563EB] font-bold px-2.5 py-1 rounded-lg">
              {applications.filter(a => a.chatHistory && a.chatHistory.length > 0).length} Active Threads
            </span>
          </div>

          {applications.filter(a => a.chatHistory && a.chatHistory.length > 0).length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center text-slate-400 shadow-sm">
              <MessageCircle size={36} className="text-[#2563EB] mb-3 mx-auto" />
              <p className="text-slate-900 text-sm font-extrabold mb-1">No active chats yet</p>
              <p className="text-xs text-slate-500">Apply to jobs to start conversations with employers</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {applications
                .filter(a => a.chatHistory && a.chatHistory.length > 0)
                .sort((a, b) => {
                  const aLastMsg = a.chatHistory[a.chatHistory.length - 1];
                  const bLastMsg = b.chatHistory[b.chatHistory.length - 1];
                  return new Date(bLastMsg.timestamp).getTime() - new Date(aLastMsg.timestamp).getTime();
                })
                .map(app => {
                  const job = jobs.find(j => j.id === app.jobId);
                  const lastMessage = app.chatHistory[app.chatHistory.length - 1];
                  const isUnread = lastMessage.sender === 'recruiter';
                  const initials = job ? job.companyName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CO';
                  
                  return (
                    <div
                      key={app.id}
                      onClick={() => {
                        setSelectedApp(app);
                        setActiveTab('applications');
                      }}
                      className={`saas-card saas-card-hover p-4 cursor-pointer flex justify-between items-center gap-4 ${
                        isUnread ? 'saas-card-selected border-l-4 border-l-[#2563EB]' : ''
                      }`}
                    >
                      <div className="flex gap-3 items-center min-w-0 flex-1">
                        {/* Initials Avatar */}
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs flex-shrink-0 select-none">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-extrabold text-slate-900 truncate">
                              {app.recruiterName || job?.companyName || 'Employer'}
                            </span>
                            {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0" />}
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold truncate mb-1">{job?.title || 'Job Position'}</div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {lastMessage.sender === 'candidate' ? 'You: ' : ''}{lastMessage.text}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold flex-shrink-0 select-none">
                        {new Date(lastMessage.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}


      </div> {/* Close container here to bypass Android WebView coordinate transform bug */}

      {/* Standalone full-page overlay details view rendered outside .container to bypass Android WebView transform rendering context bugs */}
      {activeTab === 'explore' && selectedJob && (
        <div className={`job-detail-panel job-detail-open ${isClosingExplore ? 'job-detail-closing' : ''} lg:hidden`}>
          <div className="flex flex-col h-full bg-[#F8FAFC]">
            {/* Header: Sticky at Top */}
            <div className="p-4 bg-white border-b border-[#E5E7EB] flex-shrink-0">
              <button
                onClick={handleCloseJobDetails}
                className="bg-transparent border-none text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft size={16} /> Back to Listings
              </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {renderJobDetailsContent(selectedJob)}
            </div>
          </div>
        </div>
      )}

      {/* Standalone full-page overlay details view for Government Jobs rendered outside .container to bypass Android WebView transform rendering context bugs */}
      {activeTab === 'govt' && selectedGovtJob && (
        <div className={`job-detail-panel job-detail-open ${isClosingGovt ? 'job-detail-closing' : ''}`}>
          <div className="saas-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', color: '#111827', border: '1px solid #E5E7EB', borderRadius: '0' }}>
            {/* Header: Sticky at Top */}
            <div style={{ padding: '24px 24px 16px 24px', flexShrink: 0, borderBottom: '1px solid #E5E7EB' }}>
              <button
                onClick={handleCloseGovtJobDetails}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#475569',
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <span className="badge" style={{ marginBottom: '8px', background: '#F1F5F9', color: '#475569', border: '1px solid #E5E7EB', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                    {selectedGovtJob.recruitmentBoard}
                  </span>
                  <h3 style={{ color: '#111827', fontSize: '20px', fontWeight: 800, marginBottom: '4px', lineHeight: '1.4', margin: 0 }}>{selectedGovtJob.title}</h3>
                </div>
                <div className="saas-avatar" style={{
                  width: '50px',
                  height: '50px',
                  fontSize: '13px',
                  fontWeight: 800,
                  background: '#F1F5F9',
                  color: '#2563EB',
                  border: '1px solid #E5E7EB'
                }}>
                  Govt
                </div>
              </div>
            </div>

            {/* Scrollable Body Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                  <MapPin size={14} className="text-[#2563EB]" /> State/Region: {selectedGovtJob.state ? selectedGovtJob.state.toUpperCase() : 'All India'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                  <Briefcase size={14} className="text-[#2563EB]" /> Qualification Required: {selectedGovtJob.qualification}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#ef4444', fontWeight: 700, borderTop: '1px solid #E5E7EB', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
                  ⌛ Last Date to Apply: {selectedGovtJob.lastDate || '—'}
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', gap: '16px', marginBottom: '8px' }}>
                <button
                  className="tab-btn active"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563EB',
                    fontWeight: 700,
                    fontSize: '14px',
                    paddingBottom: '8px',
                    borderBottom: '2px solid #2563EB',
                    cursor: 'pointer'
                  }}
                >
                  Official Notification & Info
                </button>
              </div>

              {/* Details Content */}
              {govtJobDetailsLoading ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>
                  <div className="animate-pulse">
                    ⏳ Loading official job notifications, fee details & vacancy tables...
                  </div>
                </div>
              ) : selectedGovtJobDetails ? (
                <div 
                  className="saas-card"
                  dangerouslySetInnerHTML={{ __html: selectedGovtJobDetails }} 
                  style={{ 
                    padding: '16px', 
                    background: '#F8FAFC', 
                    borderRadius: '12px', 
                    border: '1px solid #E5E7EB',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    color: '#475569',
                    boxShadow: 'none'
                  }} 
                />
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: '#475569' }}>
                  No notification details available.
                </div>
              )}
            </div>

            {/* Sticky Bottom Actions */}
            <div style={{ padding: '16px 24px', background: '#F8FAFC', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '12px', flexShrink: 0 }}>
              <button 
                type="button"
                onClick={() => handleToggleSaveGovtJob(selectedGovtJob)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: savedGovtJobs.some(sj => sj.id === selectedGovtJob.id) ? '#EF4444' : '#475569', borderColor: savedGovtJobs.some(sj => sj.id === selectedGovtJob.id) ? '#EF4444' : '#E5E7EB', borderStyle: 'solid', borderWidth: '1px', background: savedGovtJobs.some(sj => sj.id === selectedGovtJob.id) ? '#FEF2F2' : '#ffffff', cursor: 'pointer', fontWeight: 600 }}
              >
                {savedGovtJobs.some(sj => sj.id === selectedGovtJob.id) ? '❤️ Saved' : '🤍 Save Job'}
              </button>
              <div style={{ flex: 2, position: 'relative' }}>
                {govtResourceLinks.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowLinksDropdown(!showLinksDropdown)}
                      style={{ 
                        width: '100%',
                        padding: '12px', 
                        borderRadius: '12px', 
                        fontSize: '13px', 
                        textAlign: 'center', 
                        fontWeight: 700, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: 'none',
                        background: '#2563EB',
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      Apply Online ▾
                    </button>
                    
                    {showLinksDropdown && (
                      <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        right: 0,
                        marginBottom: '12px',
                        background: '#ffffff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        zIndex: 1200,
                        width: '260px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <div style={{ padding: '10px 14px', fontSize: '11px', color: '#94A3B8', borderBottom: '1px solid #F1F5F9', fontWeight: 600 }}>
                          SELECT LINK:
                        </div>
                        {govtResourceLinks.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShowLinksDropdown(false)}
                            style={{
                              padding: '12px 14px',
                              fontSize: '12.5px',
                              color: '#475569',
                              textDecoration: 'none',
                              borderBottom: idx < govtResourceLinks.length - 1 ? '1px solid #F1F5F9' : 'none',
                              display: 'block',
                              textAlign: 'left',
                              fontWeight: 600
                            }}
                          >
                            🔗 {link.label || 'Link'}
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <a 
                    href={currentGovtApplyLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="saas-btn-primary"
                    style={{ display: 'flex', width: '100%', padding: '12px', borderRadius: '12px', fontSize: '13px', textAlign: 'center', fontWeight: 700, alignItems: 'center', justifyContent: 'center', textDecoration: 'none', background: '#2563EB', color: '#fff' }}
                  >
                    Apply Online ↗
                  </a>
                )}
              </div>
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

      {showResumeBuilderModal && (
        <div 
          onClick={() => setShowResumeBuilderModal(false)}
          className="fixed inset-0 bg-[#0f172a]/70 backdrop-blur-sm z-[3000] flex items-center justify-center p-4"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#E5E7EB] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col p-6"
            style={{ animation: 'scaleIn 0.2s ease-out' }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎨</span>
                <div style={{ textAlign: 'left' }}>
                  <h3 className="text-sm font-black text-slate-800 leading-tight">Professional Resume Design Hub</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider m-0">Create a premium ATS-friendly resume for free</p>
                </div>
              </div>
              <button 
                onClick={() => setShowResumeBuilderModal(false)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer font-sans transition-all text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <p className="text-xs text-slate-500 mb-6 leading-relaxed" style={{ textAlign: 'left' }}>
              Design your CV using one of our verified free builders. Once finished, export/download your resume as a <strong>PDF</strong> and upload it on your profile dashboard to trigger automatic AI matching.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Reactive Resume */}
              <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-all bg-slate-50/50 flex flex-col justify-between" style={{ textAlign: 'left' }}>
                <div>
                  <h4 className="text-xs font-black text-slate-800 mb-1 flex items-center gap-1.5">
                    🚀 Reactive Resume
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/50 text-[9px] px-1.5 py-0.5 rounded font-extrabold">100% Free</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                    Completely open-source builder. Zero ads, zero paywalls, highly customizable, and fully ATS-optimized templates.
                  </p>
                </div>
                <a 
                  href="https://rxresu.me/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold text-xs py-2 px-3 rounded-lg text-center transition-all w-full text-decoration-none"
                >
                  Launch Builder ↗
                </a>
              </div>

              {/* FlowCV */}
              <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-all bg-slate-50/50 flex flex-col justify-between" style={{ textAlign: 'left' }}>
                <div>
                  <h4 className="text-xs font-black text-slate-800 mb-1 flex items-center gap-1.5">
                    ✨ FlowCV
                    <span className="bg-blue-50 text-blue-600 border border-blue-200/50 text-[9px] px-1.5 py-0.5 rounded font-extrabold">Popular</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                    Stunning modern aesthetics. Automatically handles spacing and alignments dynamically as you enter details.
                  </p>
                </div>
                <a 
                  href="https://flowcv.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 px-3 rounded-lg text-center transition-all w-full text-decoration-none"
                >
                  Launch Builder ↗
                </a>
              </div>

              {/* Canva */}
              <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-all bg-slate-50/50 flex flex-col justify-between" style={{ textAlign: 'left' }}>
                <div>
                  <h4 className="text-xs font-black text-slate-800 mb-1 flex items-center gap-1.5">
                    🎨 Canva Templates
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                    Creative visual templates. Ideal if you want drag-and-drop design elements and custom graphical layouts.
                  </p>
                </div>
                <a 
                  href="https://www.canva.com/resumes/templates/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 px-3 rounded-lg text-center transition-all w-full text-decoration-none"
                >
                  Browse Templates ↗
                </a>
              </div>

              {/* Novoresume */}
              <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-all bg-slate-50/50 flex flex-col justify-between" style={{ textAlign: 'left' }}>
                <div>
                  <h4 className="text-xs font-black text-slate-800 mb-1 flex items-center gap-1.5">
                    💼 Novoresume
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                    Strict professional CV structures. Vetted templates that comply with traditional corporate recruitment formats.
                  </p>
                </div>
                <a 
                  href="https://novoresume.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 px-3 rounded-lg text-center transition-all w-full text-decoration-none"
                >
                  Launch Builder ↗
                </a>
              </div>
            </div>

            {/* Pro Tips box */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex gap-2" style={{ textAlign: 'left' }}>
              <span className="text-xs">💡</span>
              <p className="text-[11px] text-blue-900 leading-relaxed m-0 font-medium">
                <strong>Pro-Tip:</strong> After designing, export/download your file in **PDF** format. Uploading the PDF back to Hyriq dynamically scans and updates your skill matching list.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
