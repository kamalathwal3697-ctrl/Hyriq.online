"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface Job {
  id: string;
  title: string;
  companyName: string;
  logoSeed: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  mode: 'Remote' | 'Hybrid' | 'On-site';
  salary: string;
  experience: 'Entry-level' | 'Mid-level' | 'Senior-level';
  skills: string[];
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  recruiterId: string;
  fairWorkPact?: boolean;
  chatLiveHours?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'candidate' | 'recruiter';
  text: string;
  timestamp: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  appliedDate: string;
  status: 'Applied' | 'Reviewing' | 'Shortlisted' | 'Interview' | 'Offered' | 'Rejected' | 'Hired';
  chatHistory: ChatMessage[];
  candidateProfile?: {
    name: string;
    email: string;
    phone: string;
    bio: string;
    skills: string[];
    experience: string;
  };
  candidateSignature?: string;
  candidateSignedAt?: string;
  recruiterSignature?: string;
  recruiterSignedAt?: string;
  recruiterName?: string;
}

export interface CandidateProfile {
  name: string;
  email: string;
  phone: string;
  bio: string;
  skills: string[];
  experience: string;
  resumeName: string;
  onboardingCompleted?: boolean;
  subscriptionExpiry?: string;
  logoSeed?: string;
  academicsList?: Array<{ degree: string; school: string; year: string; grade: string }>;
  workExperiences?: Array<{ role: string; company: string; duration: string; description: string }>;
  certifications?: Array<{ name: string; issuer: string; year: string }>;
  preferences?: {
    type: string[];
    mode: string[];
    minSalary: number;
    experience: string;
  };
}

export interface RecruiterProfile {
  companyName: string;
  recruiterName: string;
  bio: string;
}

export type Perspective = 'visitor' | 'candidate' | 'recruiter' | 'job-detail' | 'admin';

interface AppContextType {
  perspective: Perspective;
  setPerspective: (p: Perspective) => void;
  token: string | null;
  user: { id: string; email: string; role: 'candidate' | 'recruiter' | 'admin'; name: string } | null;
  jobs: Job[];
  applications: Application[];
  candidateProfile: CandidateProfile;
  setCandidateProfile: React.Dispatch<React.SetStateAction<CandidateProfile>>;
  recruiterProfile: RecruiterProfile;
  setRecruiterProfile: React.Dispatch<React.SetStateAction<RecruiterProfile>>;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: (code: string, role: string, couponCode?: string) => Promise<void>;
  signup: (details: {
    email: string;
    username?: string;
    pass: string;
    role: 'candidate' | 'recruiter';
    name: string;
    phone?: string;
    bio?: string;
    paymentId?: string;
    couponCode?: string;
  }) => Promise<void>;
  logout: () => void;
  promoSlots: number;
  fetchPromoSlots: () => Promise<void>;
  applyForJob: (jobId: string, candidateSignature?: string) => Promise<void>;
  createJob: (job: Omit<Job, 'id' | 'postedDate' | 'recruiterId' | 'logoSeed'>) => Promise<void>;
  updateApplicationStatus: (appId: string, status: Application['status']) => Promise<void>;
  sendChatMessage: (appId: string, text: string, sender: 'candidate' | 'recruiter') => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  candidateTab: 'explore' | 'govt' | 'applications' | 'profile' | 'settings' | 'notifications' | 'workspace' | 'chats';
  setCandidateTab: (tab: 'explore' | 'govt' | 'applications' | 'profile' | 'settings' | 'notifications' | 'workspace' | 'chats') => void;
  recruiterTab: 'overview' | 'post-job' | 'manage' | 'settings' | 'notifications' | 'workspace' | 'chats';
  setRecruiterTab: (tab: 'overview' | 'post-job' | 'manage' | 'settings' | 'notifications' | 'workspace' | 'chats') => void;
  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;
  currentLocation: string;
  setCurrentLocation: (loc: string) => void;
  visitorRole: 'seeker' | 'recruiter' | null;
  setVisitorRole: (role: 'seeker' | 'recruiter' | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [perspective, setPerspective] = useState<Perspective>('visitor');
  const [visitorRole, setVisitorRoleState] = useState<'seeker' | 'recruiter' | null>(null);

  const setVisitorRole = (role: 'seeker' | 'recruiter' | null) => {
    setVisitorRoleState(role);
    if (role) {
      localStorage.setItem('hyriq_visitor_role', role);
    } else {
      localStorage.removeItem('hyriq_visitor_role');
    }
  };

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AppContextType['user']>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidateTab, setCandidateTabState] = useState<'explore' | 'govt' | 'applications' | 'profile' | 'settings' | 'notifications' | 'workspace' | 'chats'>('explore');
  const [recruiterTab, setRecruiterTabState] = useState<'overview' | 'post-job' | 'manage' | 'settings' | 'notifications' | 'workspace' | 'chats'>('overview');

  const setCandidateTab = (tab: 'explore' | 'govt' | 'applications' | 'profile' | 'settings' | 'notifications' | 'workspace' | 'chats') => {
    setCandidateTabState(tab);
    localStorage.setItem('hyriq_candidate_tab', tab);
  };

  const setRecruiterTab = (tab: 'overview' | 'post-job' | 'manage' | 'settings' | 'notifications' | 'workspace' | 'chats') => {
    setRecruiterTabState(tab);
    localStorage.setItem('hyriq_recruiter_tab', tab);
  };
const [promoSlots, setPromoSlots] = useState<number>(100);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [currentLocation, setCurrentLocationState] = useState<string>('Bathinda');

  const setCurrentLocation = (loc: string) => {
    setCurrentLocationState(loc);
    localStorage.setItem('hyriq_selected_location', loc);
  };
   
  const lastMessageIdsRef = useRef<Set<string>>(new Set());

  // Load state from localStorage on client-side mount to prevent hydration errors
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedPerspective = localStorage.getItem('hyriq_perspective') as Perspective;
    if (savedPerspective) setPerspective(savedPerspective);

    const savedVisitorRole = localStorage.getItem('hyriq_visitor_role') as 'seeker' | 'recruiter' | null;
    if (savedVisitorRole) setVisitorRoleState(savedVisitorRole);

    const savedUser = localStorage.getItem('hyriq_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setToken('cookie_managed');
      } catch (e) {
        console.error('Failed to parse saved user from localStorage', e);
      }
    }

    const savedCandidateTab = localStorage.getItem('hyriq_candidate_tab') as any;
    if (savedCandidateTab) setCandidateTabState(savedCandidateTab);

    const savedRecruiterTab = localStorage.getItem('hyriq_recruiter_tab') as any;
    if (savedRecruiterTab) setRecruiterTabState(savedRecruiterTab);

    const savedLocation = localStorage.getItem('hyriq_selected_location');
    if (savedLocation) setCurrentLocationState(savedLocation);
  }, []);

  // Request browser notification permissions on token activation
  useEffect(() => {
    if (token && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [token]);
  
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>({
    name: '',
    email: '',
    phone: '',
    bio: '',
    skills: [],
    experience: 'Entry-level',
    resumeName: '',
    onboardingCompleted: true, // Default to true so seeded user doesn't get modal
    logoSeed: '🧑‍💻',
    academicsList: [
      { degree: 'B.Tech in Computer Science', school: 'Thapar University, Patiala', year: '2025', grade: '8.5 CGPA' }
    ],
    workExperiences: [
      { role: 'Frontend Intern', company: 'Google Development Group', duration: '3 Months (2025)', description: 'Assisted in designing clean UI panels for GDG portals using React.' }
    ],
    certifications: [
      { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: '2025' }
    ],
    preferences: {
      type: [],
      mode: [],
      minSalary: 0,
      experience: 'Entry-level'
    }
  });

  const [recruiterProfile, setRecruiterProfile] = useState<RecruiterProfile>({
    companyName: '',
    recruiterName: '',
    bio: ''
  });

  // Persist perspective changes locally
  useEffect(() => {
    localStorage.setItem('hyriq_perspective', perspective);
  }, [perspective]);

  // Load jobs from server
  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const fetchPromoSlots = async () => {
    try {
      const res = await fetch('/api/promo/slots');
      if (res.ok) {
        const data = await res.json();
        setPromoSlots(data.slotsLeft);
      }
    } catch (err) {
      console.error('Error fetching promo slots:', err);
    }
  };

  // Load applications (and messaging chat logs) from server
  const fetchApplications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        
        let newIncomingMessage = false;
        let senderName = 'Hyriq Chat';
        let msgText = '';
        const newIds = new Set<string>();
        
        data.forEach((app: any) => {
          if (app.messages) {
            app.messages.forEach((msg: any) => {
              newIds.add(msg.id);
              
              if (
                lastMessageIdsRef.current.size > 0 &&
                !lastMessageIdsRef.current.has(msg.id) &&
                msg.sender !== user?.role
              ) {
                newIncomingMessage = true;
                senderName = msg.sender === 'candidate' ? 'Job Seeker' : 'Recruiter';
                msgText = msg.text;
              }
            });
          }
        });
        
        lastMessageIdsRef.current = newIds;
        setApplications(data);
        
        if (newIncomingMessage && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(`💬 New Message from ${senderName}`, {
            body: msgText,
            icon: '/logo.png'
          });
        }
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  // Fetch current user details
  const fetchMe = async (currentToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        const profile = data.user;
        if (!profile) return;

        if (profile.role === 'candidate') {
          setCandidateProfile({
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            bio: profile.bio || '',
            skills: profile.skills || [],
            experience: profile.experience || 'Entry-level',
            resumeName: profile.resumeName || 'No resume uploaded',
            onboardingCompleted: profile.onboardingCompleted !== undefined ? profile.onboardingCompleted : false,
            preferences: profile.preferences || {
              type: [],
              mode: [],
              minSalary: 0,
              experience: 'Entry-level'
            }
          });
        } else {
          setRecruiterProfile({
            companyName: profile.companyName || '',
            recruiterName: profile.name || '',
            bio: profile.companyBio || ''
          });
        }
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
    }
  };

  // Trigger initial database fetch and periodic polling (for real-time chat sync!)
  useEffect(() => {
    fetchJobs();
    fetchPromoSlots();
    if (token) {
      fetchApplications();
      fetchMe(token);
    }
  }, [token]);

  // Setup a background polling schedule to sync applications/chat every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (token) {
        fetchApplications();
      }
      fetchJobs();
      fetchPromoSlots();
    }, 3000);

    return () => clearInterval(interval);
  }, [token]);

  // Auto-import external jobs when location changes (Arbeitnow + Google)
  useEffect(() => {
    if (currentLocation) {
      // Import from Arbeitnow
      fetch('/api/jobs/auto-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: currentLocation })
      })
      .then(res => {
        if (res.ok) fetchJobs();
      })
      .catch(err => console.error('Failed to trigger Arbeitnow auto-import:', err));

      // Import from Google Custom Search
      fetch('/api/jobs/google-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: currentLocation })
      })
      .then(res => {
        if (res.ok) fetchJobs();
      })
      .catch(err => console.error('Failed to trigger Google auto-import:', err));
    }
  }, [currentLocation]);

  // Periodic Google re-import every 5 minutes to keep feed fresh
  useEffect(() => {
    if (!token || !currentLocation) return;
    const interval = setInterval(() => {
      fetch('/api/jobs/google-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: currentLocation })
      })
      .then(res => {
        if (res.ok) fetchJobs();
      })
      .catch(() => {});
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [token, currentLocation]);

  // Handle Candidate Profile Updates on the backend
  useEffect(() => {
    if (!token || user?.role !== 'candidate' || !candidateProfile.name) return;

    // Throttle profile saves to server to avoid spamming put requests
    const delayDebounceFn = setTimeout(async () => {
      try {
        await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: candidateProfile.name,
            phone: candidateProfile.phone,
            bio: candidateProfile.bio,
            skills: candidateProfile.skills,
            experience: candidateProfile.experience,
            resumeName: candidateProfile.resumeName,
            onboardingCompleted: candidateProfile.onboardingCompleted,
            preferences: candidateProfile.preferences
          })
        });
      } catch (err) {
        console.error('Error syncing profile to server:', err);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [candidateProfile, token, user]);

  // Handle Recruiter Profile Updates on backend
  useEffect(() => {
    if (!token || user?.role !== 'recruiter' || !recruiterProfile.companyName) return;

    const delayDebounceFn = setTimeout(async () => {
      try {
        await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: recruiterProfile.recruiterName,
            companyName: recruiterProfile.companyName,
            companyBio: recruiterProfile.bio
          })
        });
      } catch (err) {
        console.error('Error syncing recruiter profile to server:', err);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [recruiterProfile, token, user]);

  // Actions
  const login = async (email: string, pass: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    setToken('cookie_managed');
    setUser(data.user);
    localStorage.setItem('hyriq_user', JSON.stringify(data.user));

    // Redirect perspective based on role
    setPerspective(data.user.role);
  };

  const loginWithGoogle = async (code: string, role: string, couponCode?: string) => {
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, role, couponCode, redirectUri })
    });

    const data = await res.json();
    if (data.requiresPayment) {
      const err = new Error(data.message || 'Payment required') as any;
      err.requiresPayment = true;
      err.paymentInfo = data;
      throw err;
    }
    if (!res.ok) {
      throw new Error(data.error || 'Google Sign-In failed');
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('hyriq_token', data.token);
    localStorage.setItem('hyriq_user', JSON.stringify(data.user));

    setPerspective(data.user.role);
  };

  const signup = async (details: {
    email: string;
    username?: string;
    pass: string;
    role: 'candidate' | 'recruiter';
    name: string;
    phone?: string;
    bio?: string;
    paymentId?: string;
    couponCode?: string;
    plan?: string;
  }) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: details.email,
        username: details.username,
        password: details.pass,
        role: details.role,
        name: details.name,
        phone: details.phone,
        bio: details.bio,
        paymentId: details.paymentId,
        couponCode: details.couponCode,
        plan: details.plan
      })
    });

    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.error || 'Registration failed');
      err.requiresPayment = data.requiresPayment;
      err.amount = data.amount;
      throw err;
    }

    setToken('cookie_managed');
    setUser(data.user);
    localStorage.setItem('hyriq_user', JSON.stringify(data.user));

    setPerspective(data.user.role);
    fetchPromoSlots();
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setToken(null);
    setUser(null);
    localStorage.removeItem('hyriq_token');
    localStorage.removeItem('hyriq_user');
    localStorage.removeItem('hyriq_candidate_tab');
    localStorage.removeItem('hyriq_recruiter_tab');
    localStorage.removeItem('hyriq_visitor_role');
    setVisitorRoleState(null);
    setPerspective('visitor');
  };

  const applyForJob = async (jobId: string, candidateSignature?: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ jobId, candidateSignature })
      });
      if (res.ok) {
        fetchApplications();
      }
    } catch (err) {
      console.error('Error applying for job:', err);
    }
  };

  const createJob = async (jobDetails: Omit<Job, 'id' | 'postedDate' | 'recruiterId' | 'logoSeed'>) => {
    if (!token) return;
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(jobDetails)
      });
      if (res.ok) {
        fetchJobs();
      }
    } catch (err) {
      console.error('Error creating job:', err);
    }
  };

  const updateApplicationStatus = async (appId: string, status: Application['status']) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchApplications();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const sendChatMessage = async (appId: string, text: string, _sender: 'candidate' | 'recruiter') => {
    if (!token) return;
    try {
      const res = await fetch(`/api/applications/${appId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        fetchApplications();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchJobs();
        fetchApplications();
      }
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        perspective,
        setPerspective,
        token,
        user,
        jobs,
        applications,
        candidateProfile,
        setCandidateProfile,
        recruiterProfile,
        setRecruiterProfile,
        login,
        loginWithGoogle,
        signup,
        logout,
        applyForJob,
        createJob,
        updateApplicationStatus,
        sendChatMessage,
        deleteJob,
        promoSlots,
        fetchPromoSlots,
        candidateTab,
        setCandidateTab,
        recruiterTab,
        setRecruiterTab,
        selectedJobId,
        setSelectedJobId,
        currentLocation,
        setCurrentLocation,
        visitorRole,
        setVisitorRole
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used within AppStateProvider');
  return context;
};

