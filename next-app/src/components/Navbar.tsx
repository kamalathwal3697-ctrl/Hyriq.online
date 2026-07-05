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
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, padding: 0 }}>
      <div 
        style={{
          margin: '0 auto',
          maxWidth: '100%',
          background: 'rgba(244, 244, 244, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Left: Logo & Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div 
            onClick={() => { setPerspective('visitor'); setVisitorRole(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <BrainNLogo size={24} variant="dark" />
            <span 
              className="font-serif-editorial italic text-2xl font-normal text-[#111111] tracking-tight"
            >
              hyriq.
            </span>
          </div>

          <div style={{ height: '18px', width: '1px', background: 'rgba(0,0,0,0.08)' }} />

          <select
            value={currentLocation}
            onChange={(e) => setCurrentLocation(e.target.value)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(0,0,0,0.1)',
              color: '#111111',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none'
            }}
          >
            {Object.entries(SUPPORTED_LOCATIONS).map(([key, label]) => (
              <option key={key} value={key} style={{ background: '#ffffff', color: '#111111' }}>
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
                  background: '#111111',
                  border: 'none', padding: '6px 14px', borderRadius: '9999px',
                  color: '#fff', fontSize: '12px', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                }}
              >
                <Plus size={12} /> Post Job
              </button>
            </div>
          )}

          {/* Download APK */}
          <button 
            style={{
              background: 'transparent',
              border: '1px solid rgba(0,0,0,0.1)',
              padding: '6px 14px', borderRadius: '9999px',
              color: '#111111', fontSize: '11px', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Download size={12} /> App
          </button>

          {/* Workspace Switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            padding: '3px',
            borderRadius: '9999px',
          }}>
            <button
              onClick={() => { setPerspective('visitor'); setVisitorRole(null); }}
              style={{
                padding: '6px 12px', borderRadius: '9999px', border: 'none',
                fontSize: '11px', fontWeight: 500, cursor: 'pointer',
                background: perspective === 'visitor' ? '#111111' : 'transparent',
                color: perspective === 'visitor' ? '#fff' : '#767676',
                transition: 'all 0.2s'
              }}
            >
              Visitor
            </button>
            
            <button
              onClick={() => handleRoleChange('candidate')}
              style={{
                padding: '6px 12px', borderRadius: '9999px', border: 'none',
                fontSize: '11px', fontWeight: 500, cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center',
                background: perspective === 'candidate' ? '#111111' : 'transparent',
                color: perspective === 'candidate' ? '#fff' : '#767676',
                transition: 'all 0.2s'
              }}
            >
              <User size={10} /> Talent
            </button>

            <button
              onClick={() => handleRoleChange('recruiter')}
              style={{
                padding: '6px 12px', borderRadius: '9999px', border: 'none',
                fontSize: '11px', fontWeight: 500, cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center',
                background: perspective === 'recruiter' ? '#111111' : 'transparent',
                color: perspective === 'recruiter' ? '#fff' : '#767676',
                transition: 'all 0.2s'
              }}
            >
              <Briefcase size={10} /> Recruiter
            </button>
          </div>

          {/* Profile & Logout (Apple Style Dropdown) */}
          {token && user && (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)',
                  padding: '4px 12px 4px 4px', borderRadius: '9999px', cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: '#111111',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 'bold', color: '#fff'
                }}>
                  {user.name.charAt(0)}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#111111' }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={12} color="#767676" />
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
                      border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: '14px',
                      padding: '8px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#111111' }}>{user.name}</div>
                      <div style={{ fontSize: '10px', color: '#767676' }}>Active: {perspective.toUpperCase()}</div>
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
                        fontWeight: 500,
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
