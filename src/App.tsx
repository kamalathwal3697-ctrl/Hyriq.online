import React, { useState, useEffect } from 'react';
import { AppStateProvider, useAppState } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { CandidateDashboard } from './components/CandidateDashboard';
import { RecruiterDashboard } from './components/RecruiterDashboard';
import { AuthPage } from './components/AuthPage';
import { Menu, X, Download, LogOut, ArrowLeft } from 'lucide-react';
import './App.css';

const AppContent: React.FC = () => {
  const { 
    perspective, 
    setPerspective, 
    token, 
    user, 
    login, 
    signup, 
    logout,
    candidateProfile,
    candidateTab,
    setCandidateTab,
    recruiterTab,
    setRecruiterTab,
    selectedJobId
  } = useAppState();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Pull-to-Refresh States
  const [pullStart, setPullStart] = useState<number | null>(null);
  const [pullChange, setPullChange] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        setPullStart(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (pullStart === null || isRefreshing) return;
      const currentY = e.touches[0].clientY;
      const diff = currentY - pullStart;

      if (diff > 0) {
        const frictionDiff = Math.min(diff * 0.4, 80);
        setPullChange(frictionDiff);
        
        if (diff > 10) {
          if (e.cancelable) e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (pullStart === null || isRefreshing) return;
      
      if (pullChange >= 50) {
        setIsRefreshing(true);
        setPullChange(50);
        setTimeout(() => {
          window.location.reload();
        }, 850);
      } else {
        setPullChange(0);
      }
      setPullStart(null);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullStart, pullChange, isRefreshing]);

  const showBackButton = (() => {
    if (!token) return false;
    if (perspective === 'visitor') return false;
    if (perspective === 'candidate') {
      return candidateTab !== 'explore' || !!selectedJobId;
    }
    if (perspective === 'recruiter') {
      return recruiterTab !== 'overview';
    }
    return false;
  })();

  const handleBack = () => {
    if (perspective === 'candidate') {
      if (selectedJobId) {
        window.history.back();
      } else {
        setCandidateTab('explore');
      }
    } else if (perspective === 'recruiter') {
      setRecruiterTab('overview');
    } else {
      window.history.back();
    }
  };

  const renderMainContent = () => {
    if (perspective === 'visitor') {
      return <LandingPage />;
    }

    // Require authentication for candidate/recruiter workspaces
    if (!token) {
      return <AuthPage onLogin={login} onSignup={signup} />;
    }

    // Authenticated views
    if (perspective === 'candidate') {
      return <CandidateDashboard />;
    }

    if (perspective === 'recruiter') {
      return <RecruiterDashboard />;
    }

    return <LandingPage />;
  };

  return (
    <div className="app-container">
      {/* Instagram-style Pull-to-Refresh Spinner */}
      {(pullChange > 0 || isRefreshing) && (
        <div style={{
          position: 'fixed',
          top: `${Math.max(10, pullChange - 20)}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: '#1e293b',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          transition: pullStart === null ? 'all 0.3s ease' : 'none',
          opacity: Math.min(pullChange / 40, 1)
        }}>
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="var(--tech-orange)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={isRefreshing ? "pull-refresh-spin" : ""}
            style={{
              transform: `rotate(${isRefreshing ? 0 : pullChange * 4}deg)`
            }}
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        </div>
      )}

      <Navbar />
      
      {/* Mobile Top Branding Bar */}
      <div className="mobile-header-bar" style={{
        position: 'sticky',
        top: 0,
        height: '56px',
        background: 'rgba(9, 11, 16, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1001,
        padding: '0 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {showBackButton && (
            <button
              onClick={handleBack}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#fff',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title="Go Back"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div 
            onClick={() => setPerspective('visitor')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <img src="/logo.png" alt="Hyriq Logo" style={{ width: '30px', height: '30px', borderRadius: '6px', objectFit: 'cover' }} />
            <span className="mobile-header-logo-text" style={{ fontSize: '18px', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>Hyriq</span>
          </div>
        </div>

        {/* Top Header Segmented Workspace Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '2px',
          borderRadius: '24px',
          gap: '2px'
        }}>
          {[
            { id: 'visitor', icon: '🌍', label: 'Visitor' },
            { id: 'candidate', icon: '👤', label: 'Seeker' },
            { id: 'recruiter', icon: '💼', label: 'Board' }
          ].map(roleItem => {
            const isActive = perspective === roleItem.id;
            return (
              <button
                key={roleItem.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setPerspective(roleItem.id as any);
                }}
                style={{
                  background: isActive ? (roleItem.id === 'visitor' ? 'rgba(255,255,255,0.08)' : (roleItem.id === 'candidate' ? 'var(--primary)' : 'var(--secondary)')) : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '5px 9px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s',
                  boxShadow: isActive && roleItem.id !== 'visitor' ? (roleItem.id === 'candidate' ? '0 2px 6px rgba(99,102,241,0.3)' : '0 2px 6px rgba(6,182,212,0.3)') : 'none'
                }}
              >
                <span>{roleItem.icon}</span>
                <span className="mobile-header-switcher-label">{roleItem.label}</span>
              </button>
            );
          })}
        </div>

        {/* Hamburger Menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {token && user?.name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '18px', width: '22px', height: '22px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {perspective === 'candidate' && candidateProfile?.logoSeed && (candidateProfile.logoSeed.startsWith('data:image/') || candidateProfile.logoSeed.startsWith('http')) ? (
                  <img src={candidateProfile.logoSeed} alt="DP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  perspective === 'candidate' ? (candidateProfile?.logoSeed || '🧑‍💻') : '💼'
                )}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {user.name.split(' ')[0]}
              </span>
            </div>
          )}
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Side Drawer Menu */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 6, 8, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 2000,
          display: 'flex',
          justifyContent: 'flex-end'
        }}
        onClick={() => setIsMobileMenuOpen(false)}
        >
          <div style={{
            width: '280px',
            height: '100%',
            background: '#090B10',
            borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>Navigation Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Profile Section (Clickable) */}
            <div 
              onClick={() => {
                if (perspective === 'candidate') {
                  setCandidateTab('profile');
                  setIsMobileMenuOpen(false);
                } else if (perspective === 'recruiter') {
                  setRecruiterTab('overview');
                  setIsMobileMenuOpen(false);
                }
              }}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '16px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              className="drawer-profile-card"
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1A3E62 0%, #F2994A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                overflow: 'hidden'
              }}>
                {perspective === 'candidate' && candidateProfile?.logoSeed && (candidateProfile.logoSeed.startsWith('data:image/') || candidateProfile.logoSeed.startsWith('http')) ? (
                  <img src={candidateProfile.logoSeed} alt="DP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  perspective === 'candidate' ? (candidateProfile?.logoSeed || '🧑‍💻') : '💼'
                )}
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff', display: 'block' }}>
                  {token && user?.name ? user.name : 'Guest Visitor'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Active perspective: {perspective.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Role / Perspective Switcher */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Switch Workspace</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.15)', padding: '4px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                {[
                  { id: 'visitor', label: 'Visitor Space', icon: '🌍' },
                  { id: 'candidate', label: 'Job Seeker', icon: '👤' },
                  { id: 'recruiter', label: 'Recruiter Board', icon: '💼' }
                ].map(roleItem => {
                  const isActive = perspective === roleItem.id;
                  return (
                    <button
                      key={roleItem.id}
                      onClick={() => {
                        setPerspective(roleItem.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: 'none',
                        background: isActive ? 'var(--corporate-blue)' : 'transparent',
                        color: isActive ? '#fff' : 'var(--text-secondary)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>{roleItem.icon}</span>
                      <span>{roleItem.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Perspective-Specific Quick Actions */}
            {token && perspective === 'candidate' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Actions</span>
                <a 
                  onClick={() => {
                    setCandidateTab('profile');
                    setIsMobileMenuOpen(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13.5px', fontWeight: 600, padding: '6px 0', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  👤 My Profile
                </a>
                <a 
                  onClick={() => {
                    setCandidateTab('applications');
                    setIsMobileMenuOpen(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13.5px', fontWeight: 600, padding: '6px 0', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  💼 My Applications
                </a>
                <a 
                  onClick={() => {
                    setCandidateTab('settings');
                    setIsMobileMenuOpen(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13.5px', fontWeight: 600, padding: '6px 0', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  ⚙️ App Settings
                </a>
              </div>
            )}

            {token && perspective === 'recruiter' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Actions</span>
                <a 
                  onClick={() => {
                    setRecruiterTab('post-job');
                    setIsMobileMenuOpen(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13.5px', fontWeight: 600, padding: '6px 0', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  ➕ Post a Job
                </a>
                <a 
                  onClick={() => {
                    setRecruiterTab('settings');
                    setIsMobileMenuOpen(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13.5px', fontWeight: 600, padding: '6px 0', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  ⚙️ Board Settings
                </a>
              </div>
            )}

            {/* Mobile Companion Download Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(242, 153, 74, 0.08) 0%, rgba(26, 62, 98, 0.08) 100%)',
              border: '1px solid rgba(242, 153, 74, 0.15)',
              padding: '16px',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: '20px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
            }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--tech-orange)', letterSpacing: '0.5px' }}>MOBILE COMPANION</span>
              <span style={{ fontSize: '12px', color: '#fff', fontWeight: 700 }}>Get the Hyriq Android App</span>
              <a 
                href="/hyriq.apk" 
                download="hyriq.apk"
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: 'var(--corporate-blue)',
                  color: '#fff',
                  textDecoration: 'none',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <Download size={14} /> Download APK
              </a>
            </div>

            {/* Logout button at bottom */}
            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
              {token ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                    color: '#f43f5e',
                    padding: '12px',
                    borderRadius: '24px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <LogOut size={16} /> Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    setPerspective('candidate');
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    background: 'var(--tech-orange)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '24px',
                    fontSize: '13px',
                    fontWeight: 750,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <main style={{ flex: 1 }}>
        {renderMainContent()}
      </main>

      {/* Modern Gen-Z Minimalist Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '32px 0',
        textAlign: 'center',
        background: 'rgba(5, 3, 10, 0.4)',
        marginTop: 'auto'
      }}>
        <div className="container">
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>
            Hyriq © {new Date().getFullYear()} • Find Your Vibe. Land Your Career.
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.15)', fontSize: '11px', marginTop: '6px' }}>
            Zero resume spam, zero ghost jobs. Real-time direct chat for modern workplaces.
          </p>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}

export default App;
