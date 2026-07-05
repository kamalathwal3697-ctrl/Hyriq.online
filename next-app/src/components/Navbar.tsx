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
    <nav className="header-sticky w-full px-6 py-3 flex items-center justify-between">
      <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
        {/* Left: Logo & Brand */}
        <div 
          onClick={() => { setPerspective('visitor'); setVisitorRole(null); }}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <BrainNLogo size={28} variant="gradient" />
          <span className="font-bold text-slate-900 tracking-wider font-sans-clean text-lg flex items-baseline gap-0.5">
            HYRIQ<span className="text-slate-400 font-normal text-xs">.online</span>
          </span>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <button 
            onClick={() => handleRoleChange('recruiter')} 
            className="hover:text-blue-600 cursor-pointer transition-colors"
          >
            For Employers
          </button>
          <button 
            onClick={() => handleRoleChange('candidate')} 
            className="hover:text-blue-600 cursor-pointer transition-colors"
          >
            For Candidates
          </button>
          <button 
            onClick={() => {
              setPerspective('visitor');
              setTimeout(() => {
                document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }} 
            className="hover:text-blue-600 cursor-pointer transition-colors"
          >
            Platform
          </button>
          <button 
            onClick={() => {
              setPerspective('visitor');
              setTimeout(() => {
                document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }} 
            className="hover:text-blue-600 cursor-pointer transition-colors"
          >
            Pricing
          </button>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-4">
          {!token ? (
            <>
              {/* Unauthenticated CTAs */}
              <button 
                onClick={() => handleRoleChange('candidate')}
                className="btn-ghost"
              >
                Log In
              </button>
              <button 
                onClick={() => handleRoleChange('recruiter')}
                className="btn-primary"
              >
                Post a Job
              </button>
            </>
          ) : (
            <>
              {/* Workspace Selector (Flat corporate rounded-md tab bar) */}
              <div className="hidden lg:flex bg-slate-100 p-1 rounded-lg border border-slate-200 gap-1">
                <button
                  onClick={() => { setPerspective('visitor'); setVisitorRole(null); }}
                  className={`px-3 py-1.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    perspective === 'visitor' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Visitor
                </button>
                <button
                  onClick={() => handleRoleChange('candidate')}
                  className={`px-3 py-1.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    perspective === 'candidate' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Talent
                </button>
                <button
                  onClick={() => handleRoleChange('recruiter')}
                  className={`px-3 py-1.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    perspective === 'recruiter' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Board
                </button>
              </div>

              {/* Profile Menu Dropdown */}
              {user && (
                <div className="relative">
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-bold color-white text-white">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown size={12} className="text-slate-400" />
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg p-1 shadow-md z-50"
                      >
                        <div className="px-3 py-2 border-b border-slate-100 mb-1">
                          <div className="text-[12px] font-bold text-slate-800">{user.name}</div>
                          <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">{perspective}</div>
                        </div>
                        <button 
                          onClick={() => {
                            setShowProfileMenu(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 text-rose-600 text-xs font-semibold rounded transition-colors text-left cursor-pointer"
                        >
                          <LogOut size={12} />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
