'use client';
import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { Briefcase, User, Shield, Compass, LogOut, Download, Plus, Settings, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainNLogo } from './BrainNLogo';

const SUPPORTED_LOCATIONS = {
  'Bathinda': '📍 Bathinda',
  'Chandigarh': '📍 Chandigarh',
  'Mohali': '📍 Mohali',
  'Ludhiana': '📍 Ludhiana',
  'Remote': '🌐 Remote'
};

const Navbar: React.FC = () => {
  const { perspective, setPerspective, token, user, logout, currentLocation, setCurrentLocation, visitorRole, setVisitorRole, setCandidateTab, setRecruiterTab } = useAppState();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleRoleChange = (role: 'candidate' | 'recruiter') => {
    if (token && user) {
      if (user.role !== role && (user.role as string) !== 'admin') {
        alert(`Your account is registered as a ${user.role}. You cannot switch to ${role} workspace.`);
        return;
      }
      setPerspective(role);
      setVisitorRole(null);
    } else {
      setVisitorRole(role === 'candidate' ? 'seeker' : 'recruiter');
      setPerspective(role);
    }
  };

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, padding: '16px 24px 0 24px' }}>
      <div 
        className="glass-panel"
        style={{
          margin: '0 auto',
          maxWidth: '1400px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 24px',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Left: Logo & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div 
            onClick={() => { setPerspective('visitor'); setVisitorRole(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <BrainNLogo size={24} variant="gradient" />
            <span 
              className="font-serif-editorial italic text-2xl font-normal text-slate-800 tracking-tight"
            >
              hyriq.
            </span>
          </div>

          <div style={{ height: '18px', width: '1px', background: 'rgba(255,255,255,0.4)' }} />

          <select
            value={currentLocation}
            onChange={(e) => setCurrentLocation(e.target.value)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(0,0,0,0.06)',
              color: '#475569',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none'
            }}
          >
            {Object.entries(SUPPORTED_LOCATIONS).map(([key, label]) => (
              <option key={key} value={key} style={{ background: '#ffffff', color: '#1e293b' }}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <a href="#" onClick={() => { setPerspective('visitor'); }} className="hover:text-blue-600 transition-colors">Jobs</a>
          <a href="#" onClick={() => handleRoleChange('candidate')} className="hover:text-blue-600 transition-colors">Candidates</a>
          <a href="#" onClick={() => handleRoleChange('recruiter')} className="hover:text-blue-600 transition-colors">Employer</a>
          <a href="#" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            AI Tools
            <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider scale-90">Beta</span>
          </a>
        </div>

        {/* Right: Actions & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Post a Job button (Vibrant Blue Pill) */}
          <button 
            onClick={() => {
              handleRoleChange('recruiter');
              if (token) setRecruiterTab('post-job');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4.5 py-2.5 rounded-full shadow-[0_4px_12px_rgba(37,99,235,0.15)] transition-all cursor-pointer whitespace-nowrap"
          >
            Post a Job
          </button>

          {/* Upload Resume button (Indigo Outline Pill) */}
          <button 
            onClick={() => {
              handleRoleChange('candidate');
              if (token) setCandidateTab('profile');
            }}
            className="border border-indigo-600/30 text-indigo-600 hover:bg-indigo-50/50 text-xs font-semibold px-4.5 py-2.5 rounded-full transition-all cursor-pointer whitespace-nowrap"
          >
            Upload Resume
          </button>

          {/* Minimalist Dark Mode Toggle Switch UI */}
          <div className="flex items-center bg-slate-200/50 p-0.5 rounded-full border border-white/20 w-11 h-6 cursor-pointer relative transition-colors">
            <div className="bg-white w-4.5 h-4.5 rounded-full shadow-sm transform translate-x-0.5 transition-transform"></div>
          </div>

          {/* Workspace Selector */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(255,255,255,0.6)',
            padding: '2px',
            borderRadius: '9999px',
          }}>
            <button
              onClick={() => { setPerspective('visitor'); setVisitorRole(null); }}
              style={{
                padding: '4px 10px', borderRadius: '9999px', border: 'none',
                fontSize: '10px', fontWeight: 600, cursor: 'pointer',
                background: perspective === 'visitor' ? '#0f172a' : 'transparent',
                color: perspective === 'visitor' ? '#fff' : '#64748b',
                transition: 'all 0.2s'
              }}
            >
              Visitor
            </button>
            
            <button
              onClick={() => handleRoleChange('candidate')}
              style={{
                padding: '4px 10px', borderRadius: '9999px', border: 'none',
                fontSize: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '3px', alignItems: 'center',
                background: perspective === 'candidate' ? '#0f172a' : 'transparent',
                color: perspective === 'candidate' ? '#fff' : '#64748b',
                transition: 'all 0.2s'
              }}
            >
              Talent
            </button>

            <button
              onClick={() => handleRoleChange('recruiter')}
              style={{
                padding: '4px 10px', borderRadius: '9999px', border: 'none',
                fontSize: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '3px', alignItems: 'center',
                background: perspective === 'recruiter' ? '#0f172a' : 'transparent',
                color: perspective === 'recruiter' ? '#fff' : '#64748b',
                transition: 'all 0.2s'
              }}
            >
              Board
            </button>
          </div>

          {/* Profile & Logout (Apple Style Dropdown) */}
          {token && user && (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.8)',
                  padding: '4px 12px 4px 4px', borderRadius: '9999px', cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: '#2563eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 'bold', color: '#fff'
                }}>
                  {user.name.charAt(0)}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#334155' }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={11} color="#64748b" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 12px)',
                      right: 0,
                      width: '220px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.8)',
                      borderRadius: '14px',
                      padding: '8px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.04)'
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{user.name}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Active: {perspective.toUpperCase()}</div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      style={{
                        width: '100%',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 12px',
                        background: 'transparent',
                        border: 'none',
                        color: '#f43f5e',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        borderRadius: '10px',
                        textAlign: 'left',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.05)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={12} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
