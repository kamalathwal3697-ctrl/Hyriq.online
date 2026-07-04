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
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, padding: '12px 20px' }}>
      <div 
        style={{
          margin: '0 auto',
          maxWidth: '1400px',
          borderRadius: '30px',
          background: 'rgba(20, 20, 25, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Left: Logo & Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div 
            onClick={() => { setPerspective('visitor'); setVisitorRole(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <BrainNLogo size={28} />
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 800, 
              background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}>
              Hyriq
            </span>
          </div>

          <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />

          <select
            value={currentLocation}
            onChange={(e) => setCurrentLocation(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none'
            }}
          >
            {Object.entries(SUPPORTED_LOCATIONS).map(([key, label]) => (
              <option key={key} value={key} style={{ background: '#0f172a', color: '#fff' }}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Actions & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Quick Actions for Recruiter */}
          {perspective === 'recruiter' && token && (
            <div style={{ display: 'flex', gap: '8px', marginRight: '8px' }}>
              <button 
                onClick={() => setRecruiterTab('post-job')}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none', padding: '6px 14px', borderRadius: '16px',
                  color: '#fff', fontSize: '13px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                }}
              >
                <Plus size={14} /> Post Job
              </button>
            </div>
          )}

          {/* Download APK */}
          <button 
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '6px 14px', borderRadius: '16px',
              color: '#fff', fontSize: '12px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <Download size={14} /> App
          </button>

          {/* Workspace Switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255,255,255,0.05)',
            padding: '4px',
            borderRadius: '20px',
          }}>
            <button
              onClick={() => { setPerspective('visitor'); setVisitorRole(null); }}
              style={{
                padding: '6px 12px', borderRadius: '16px', border: 'none',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                background: perspective === 'visitor' ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: perspective === 'visitor' ? '#fff' : '#94a3b8',
                transition: 'all 0.2s'
              }}
            >
              Visitor
            </button>
            
            <button
              onClick={() => handleRoleChange('candidate')}
              style={{
                padding: '6px 12px', borderRadius: '16px', border: 'none',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center',
                background: perspective === 'candidate' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                color: perspective === 'candidate' ? '#fff' : '#94a3b8',
                boxShadow: perspective === 'candidate' ? '0 2px 8px rgba(99, 102, 241, 0.4)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <User size={12} /> Talent
            </button>

            <button
              onClick={() => handleRoleChange('recruiter')}
              style={{
                padding: '6px 12px', borderRadius: '16px', border: 'none',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center',
                background: perspective === 'recruiter' ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'transparent',
                color: perspective === 'recruiter' ? '#fff' : '#94a3b8',
                boxShadow: perspective === 'recruiter' ? '0 2px 8px rgba(14, 165, 233, 0.4)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Briefcase size={12} /> Recruiter
            </button>
          </div>

          {/* Profile & Logout (Apple Style Dropdown) */}
          {token && user && (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                  padding: '4px 12px 4px 4px', borderRadius: '24px', cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 'bold', color: '#fff'
                }}>
                  {user.name.charAt(0)}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={14} color="#94a3b8" />
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
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '8px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)'
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{user.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Active: {perspective.toUpperCase()}</div>
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
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        borderRadius: '10px',
                        textAlign: 'left',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={14} />
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
