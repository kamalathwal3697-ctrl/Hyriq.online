import React, { useState } from 'react';
import { AppStateProvider, useAppState } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { CandidateDashboard } from './components/CandidateDashboard';
import { RecruiterDashboard } from './components/RecruiterDashboard';
import { AuthPage } from './components/AuthPage';
import { Menu, X, Search, Briefcase, Download, LogOut } from 'lucide-react';
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
    setCandidateTab,
    setRecruiterTab
  } = useAppState();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div 
          onClick={() => setPerspective('visitor')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <img src="/logo.png" alt="Hyriq Logo" style={{ width: '30px', height: '30px', borderRadius: '6px', objectFit: 'cover' }} />
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>Hyriq</span>
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

            {/* Navigation Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</span>
              
              <a 
                onClick={() => {
                  setPerspective('candidate');
                  setIsMobileMenuOpen(false);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, padding: '8px 0', cursor: 'pointer' }}
              >
                <Search size={16} /> Find a Job
              </a>

              {token && perspective === 'candidate' && (
                <a 
                  onClick={() => {
                    setCandidateTab('profile');
                    setIsMobileMenuOpen(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--tech-orange)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 0', cursor: 'pointer' }}
                >
                  👤 My Profile
                </a>
              )}
              
              <a 
                onClick={() => {
                  setPerspective('recruiter');
                  setIsMobileMenuOpen(false);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, padding: '8px 0', cursor: 'pointer' }}
              >
                <Briefcase size={16} /> Post a Job
              </a>

              <a 
                href="/hyriq.apk"
                download="hyriq.apk"
                style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f97316', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 0' }}
              >
                <Download size={16} /> Download APK (Android)
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
