import React, { createContext, useContext, useState, useEffect } from 'react';

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
  status: 'Applied' | 'Reviewing' | 'Shortlisted' | 'Interview' | 'Offered' | 'Rejected';
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

export type Perspective = 'visitor' | 'candidate' | 'recruiter';

interface AppContextType {
  perspective: Perspective;
  setPerspective: (p: Perspective) => void;
  token: string | null;
  user: { id: string; email: string; role: 'candidate' | 'recruiter'; name: string } | null;
  jobs: Job[];
  applications: Application[];
  candidateProfile: CandidateProfile;
  setCandidateProfile: React.Dispatch<React.SetStateAction<CandidateProfile>>;
  recruiterProfile: RecruiterProfile;
  setRecruiterProfile: React.Dispatch<React.SetStateAction<RecruiterProfile>>;
  login: (email: string, pass: string) => Promise<void>;
  signup: (details: {
    email: string;
    pass: string;
    role: 'candidate' | 'recruiter';
    name: string;
    phone?: string;
    bio?: string;
    paymentConfirmed?: boolean;
  }) => Promise<void>;
  logout: () => void;
  promoSlots: number;
  fetchPromoSlots: () => Promise<void>;
  applyForJob: (jobId: string, candidateSignature?: string) => Promise<void>;
  createJob: (job: Omit<Job, 'id' | 'postedDate' | 'recruiterId' | 'logoSeed'>) => Promise<void>;
  updateApplicationStatus: (appId: string, status: Application['status']) => Promise<void>;
  sendChatMessage: (appId: string, text: string, sender: 'candidate' | 'recruiter') => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [perspective, setPerspective] = useState<Perspective>(() => {
    return (localStorage.getItem('hyriq_perspective') as Perspective) || 'visitor';
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('hyriq_token');
  });

  const [user, setUser] = useState<AppContextType['user']>(() => {
    const saved = localStorage.getItem('hyriq_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [promoSlots, setPromoSlots] = useState<number>(100);
  
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>({
    name: '',
    email: '',
    phone: '',
    bio: '',
    skills: [],
    experience: 'Entry-level',
    resumeName: '',
    onboardingCompleted: true, // Default to true so seeded user doesn't get modal
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
        setApplications(data);
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
        const profile = await res.json();
        if (profile.role === 'candidate') {
          setCandidateProfile({
            name: profile.name,
            email: profile.email,
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

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('hyriq_token', data.token);
    localStorage.setItem('hyriq_user', JSON.stringify(data.user));

    // Redirect perspective based on role
    setPerspective(data.user.role);
  };

  const signup = async (details: {
    email: string;
    pass: string;
    role: 'candidate' | 'recruiter';
    name: string;
    phone?: string;
    bio?: string;
    paymentConfirmed?: boolean;
  }) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: details.email,
        password: details.pass,
        role: details.role,
        name: details.name,
        phone: details.phone,
        bio: details.bio,
        paymentConfirmed: details.paymentConfirmed
      })
    });

    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.error || 'Registration failed');
      err.requiresPayment = data.requiresPayment;
      err.amount = data.amount;
      throw err;
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('hyriq_token', data.token);
    localStorage.setItem('hyriq_user', JSON.stringify(data.user));

    setPerspective(data.user.role);
    fetchPromoSlots();
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setApplications([]);
    localStorage.removeItem('hyriq_token');
    localStorage.removeItem('hyriq_user');
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
        signup,
        logout,
        applyForJob,
        createJob,
        updateApplicationStatus,
        sendChatMessage,
        deleteJob,
        promoSlots,
        fetchPromoSlots
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
