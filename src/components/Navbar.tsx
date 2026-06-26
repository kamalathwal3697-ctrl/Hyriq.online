import React from 'react';
import { Briefcase, Zap, User, Shield, Compass, LogOut } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import type { Perspective } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { perspective, setPerspective, token, user, logout } = useAppState();

  const handleRoleChange = (role: Perspective) => {
    setPerspective(role);
  };

  return (
    <nav style={{
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(9, 7, 20, 0.7)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '16px 0'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => handleRoleChange('visitor')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <div style={{
            background: 'var(--primary-gradient)',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Zap size={18} color="#fff" />
          </div>
          <span style={{
            fontFamily: 'Outfit',
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #fff 40%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Hyriq
          </span>
        </div>

        {/* Dynamic Navigation Links based on role */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {perspective === 'visitor' && (
            <>
              <a 
                onClick={() => handleRoleChange('candidate')} 
                style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '14px', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Find a Job
              </a>
              <a 
                onClick={() => handleRoleChange('recruiter')}
                style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '14px', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Post a Job
              </a>
            </>
          )}

          {perspective === 'candidate' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8', fontSize: '13px', fontWeight: 600, background: 'rgba(99, 102, 241, 0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <Compass size={14} />
              Candidate Workspace
            </div>
          )}

          {perspective === 'recruiter' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22d3ee', fontSize: '13px', fontWeight: 600, background: 'rgba(6, 182, 212, 0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
              <Shield size={14} />
              Recruiter Board
            </div>
          )}
        </div>

        {/* Perspective Switcher & Session Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            padding: '3px',
            borderRadius: '24px',
            position: 'relative'
          }}>
            <button
              onClick={() => handleRoleChange('visitor')}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                backgroundColor: perspective === 'visitor' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: perspective === 'visitor' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              Visitor
            </button>
            
            <button
              onClick={() => handleRoleChange('candidate')}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                backgroundColor: perspective === 'candidate' ? 'var(--primary)' : 'transparent',
                color: perspective === 'candidate' ? '#fff' : 'var(--text-secondary)',
                boxShadow: perspective === 'candidate' ? '0 2px 8px rgba(99, 102, 241, 0.4)' : 'none'
              }}
            >
              <User size={12} />
              Job Seeker
            </button>

            <button
              onClick={() => handleRoleChange('recruiter')}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                backgroundColor: perspective === 'recruiter' ? 'var(--secondary)' : 'transparent',
                color: perspective === 'recruiter' ? '#fff' : 'var(--text-secondary)',
                boxShadow: perspective === 'recruiter' ? '0 2px 8px rgba(6, 182, 212, 0.4)' : 'none'
              }}
            >
              <Briefcase size={12} />
              Recruiter
            </button>
          </div>

          {/* User Signout Button */}
          {token && user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {user.name.split(' ')[0]}
              </span>
              <button 
                onClick={logout}
                className="btn btn-outline" 
                style={{ padding: '6px 10px', borderRadius: '8px', fontSize: '11px', gap: '4px' }}
                title="Logout"
              >
                <LogOut size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
