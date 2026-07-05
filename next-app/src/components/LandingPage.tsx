import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, Building, ChevronRight, TrendingUp, Sparkles, Star, Users, ArrowRight } from 'lucide-react';
import { useAppState } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  const { setPerspective } = useAppState();
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLoc, setSearchLoc] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('hyriq_landing_search', searchTitle);
    localStorage.setItem('hyriq_landing_location', searchLoc);
    setPerspective('candidate');
  };

  const categories = [
    { name: 'Technology', count: '1,234 Jobs', icon: '💻' },
    { name: 'Healthcare', count: '845 Jobs', icon: '⚕️' },
    { name: 'Finance', count: '632 Jobs', icon: '📈' },
    { name: 'Marketing', count: '421 Jobs', icon: '🎯' },
    { name: 'Design', count: '256 Jobs', icon: '✨' },
    { name: 'Engineering', count: '542 Jobs', icon: '⚙️' },
    { name: 'Sales', count: '891 Jobs', icon: '🤝' },
    { name: 'Remote', count: '2,541 Jobs', icon: '🏠' }
  ];

  const topCompanies = [
    { name: 'Google', rating: 4.8, reviews: '12k', logo: 'G' },
    { name: 'Microsoft', rating: 4.7, reviews: '10k', logo: 'M' },
    { name: 'Apple', rating: 4.9, reviews: '15k', logo: 'A' },
    { name: 'Meta', rating: 4.6, reviews: '8k', logo: 'M' },
    { name: 'Amazon', rating: 4.5, reviews: '20k', logo: 'a' }
  ];

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#111111] w-full overflow-hidden flex flex-col pt-16">
      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-6 lg:px-20 mesh-bg border-b border-white/40 overflow-hidden">
        {/* Abstract floating mesh spheres matching the reference mockup */}
        <div className="absolute top-1/4 left-10 w-24 h-24 rounded-full bg-blue-400/10 blur-xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-10 right-20 w-40 h-40 rounded-full bg-indigo-400/10 blur-2xl animate-pulse pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold mb-8 uppercase tracking-widest">
              <Sparkles size={12} className="animate-spin-slow" /> Punjab's Vibe Matching Career Platform
            </span>
            <h1 className="font-serif-editorial text-5xl md:text-7xl lg:text-8xl font-normal tracking-tight text-slate-900 leading-[1.05] mb-8">
              vibe matching.<br />
              <span className="italic text-gradient-accent">professional hiring.</span>
            </h1>
            <p className="text-base md:text-lg text-slate-500 mb-12 max-w-2xl mx-auto font-normal font-sans-clean leading-relaxed">
              Introducing Punjab's first EEG-vibe matching career platform. Go beyond static resumes. Our AI matches candidates and recruiters on real alignment, workspace culture, and professional compatibility.
            </p>

            {/* Glassmorphic Search Container */}
            <div className="max-w-2xl mx-auto relative">
              <form onSubmit={handleSearchSubmit} className="glass-panel p-2 rounded-2xl flex flex-col md:flex-row items-center border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.03)] focus-within:border-blue-500/30">
                <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-white/30 w-full">
                  <Search className="text-slate-400 mr-2.5" size={16} />
                  <input 
                    type="text" 
                    placeholder="Job title, keywords, or company" 
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    className="w-full text-xs outline-none text-slate-800 placeholder-slate-400 bg-transparent font-sans-clean"
                  />
                </div>
                <div className="flex-1 flex items-center px-4 py-3 w-full">
                  <MapPin className="text-slate-400 mr-2.5" size={16} />
                  <input 
                    type="text" 
                    placeholder="City, state, or 'Remote'" 
                    value={searchLoc}
                    onChange={(e) => setSearchLoc(e.target.value)}
                    className="w-full text-xs outline-none text-slate-800 placeholder-slate-400 bg-transparent font-sans-clean"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full md:w-auto mt-2 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-[0_4px_12px_rgba(37,99,235,0.15)] whitespace-nowrap cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Autocomplete suggestions box matching the top-left screen of the mockup */}
              <div className="glass-panel mt-3 rounded-2xl border border-white/50 shadow-sm p-4 text-left max-w-lg mx-auto">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-sans-clean font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Instant, real-time results
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-sans-clean font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    AI auto-suggestions based on compatibility
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-sans-clean font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Location autocomplete matching Punjab sectors
                  </div>
                </div>

                {/* Filter switches pills at the bottom */}
                <div className="flex gap-4 border-t border-white/30 pt-3 mt-3 text-[11px] font-semibold text-slate-600">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-blue-600 rounded" />
                    Remote
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-blue-600 rounded" />
                    Salary
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-blue-600 rounded" />
                    Experience
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Career Copilot Section - 3 columns matching top-left mockup screen */}
      <section className="py-20 border-b border-white/40 bg-white/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2 font-sans-clean">INTELLIGENT SUITE</span>
            <h2 className="font-serif-editorial text-4xl text-slate-900 leading-tight">
              AI Career Copilot
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: AI Resume Analyzer */}
            <div className="glass-panel p-6 rounded-2xl border border-white/50 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">AI Resume Analyzer</span>
                  <Sparkles size={14} className="text-blue-500" />
                </div>
                <div className="flex items-center justify-center py-6">
                  <div className="relative w-24 h-24 rounded-full border-4 border-slate-100 border-t-blue-500 flex items-center justify-center">
                    <span className="text-xl font-bold text-slate-800">95%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 text-center font-medium font-sans-clean mt-2">
                  Resume Score
                </p>
              </div>
              <div className="bg-white/40 border border-white/50 rounded-xl p-3 mt-6">
                <p className="text-[11px] text-slate-600 font-sans-clean leading-relaxed font-medium">
                  We scanned your resume and detected 4 major technical matches for Software Engineer roles in Mohali.
                </p>
              </div>
            </div>

            {/* Card 2: AI Job Recommendation */}
            <div className="glass-panel p-6 rounded-2xl border border-white/50 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">AI Job Recommendation</span>
                  <Briefcase size={14} className="text-indigo-500" />
                </div>
                
                <div className="space-y-3 py-4">
                  <div className="bg-white/60 border border-white/80 rounded-xl p-3 flex justify-between items-center shadow-xs">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Senior Software Engineer</p>
                      <p className="text-[10px] text-slate-500 font-medium">Aadhar Solutions • 12 Remote</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      Match
                    </span>
                  </div>
                  
                  <div className="bg-white/30 border border-white/40 rounded-xl p-3 flex justify-between items-center opacity-70">
                    <div>
                      <p className="text-xs font-bold text-slate-800">UI/UX Designer</p>
                      <p className="text-[10px] text-slate-500 font-medium">Xenon Systems • Mohali</p>
                    </div>
                    <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      78%
                    </span>
                  </div>
                </div>
              </div>
              
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors mt-4">
                View Recommendations
              </button>
            </div>

            {/* Card 3: AI Interview Prep */}
            <div className="glass-panel p-6 rounded-2xl border border-white/50 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">AI Interview Prep</span>
                  <Users size={14} className="text-purple-500" />
                </div>
                
                <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center group mb-4">
                  <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('/vibe-model.png')" }}></div>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white text-xs shadow-sm cursor-pointer hover:scale-105 transition-transform z-10">
                    ▶
                  </div>
                </div>
              </div>
              
              <div className="bg-white/40 border border-white/50 rounded-xl p-3">
                <p className="text-[11px] text-slate-600 font-sans-clean leading-relaxed font-medium">
                  Interview Tips: focus on microservice scalability questions and practice communication.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Grid Highlight: AI Sourcing */}
      <section className="py-24 bg-white/40 backdrop-blur-xs border-b border-white/40">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3 font-sans-clean">AI Sourcing</span>
            <h2 className="font-serif-editorial text-4xl md:text-5xl leading-tight text-slate-900 mb-6">
              Hire deeply, <span className="italic text-gradient-accent">build fully.</span>
            </h2>
            <p className="text-slate-600 font-sans-clean text-sm leading-relaxed mb-8 font-medium">
              We believe a resume is just a piece of paper. Hyriq maps dynamic workspace vibrations, candidate aspirations, and recruiter objectives to forge high-compatibility professional relationships.
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xs text-blue-600 font-bold">✓</div>
                <p className="text-slate-600 text-sm font-sans-clean"><strong className="text-slate-800 font-semibold">94% Compatibility Ratio:</strong> Vibe match-making ensures candidates stay longer and thrive.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xs text-blue-600 font-bold">✓</div>
                <p className="text-slate-600 text-sm font-sans-clean"><strong className="text-slate-800 font-semibold">One-Time Registration:</strong> Low entry cost and free tools for recruiters.</p>
              </div>
            </div>
          </div>
          <div className="glass-panel aspect-[4/3] rounded-2xl border border-white/50 flex flex-col justify-center items-center p-6 relative overflow-hidden shadow-sm">
            <div className="absolute top-6 left-6 text-[10px] font-mono tracking-wider text-slate-400">HYRIQ MATRIX V1</div>
            
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 6, 
                ease: "easeInOut" 
              }}
              className="relative w-full h-full max-h-[220px] flex items-center justify-center"
            >
              <img 
                src="/vibe-model.png" 
                alt="AI Vibe Matching Model" 
                className="w-auto h-full max-h-[180px] object-contain mix-blend-multiply opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none"></div>
            </motion.div>

            <div className="text-center z-10 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-neutral-100 shadow-sm mt-2">
              <p className="text-xs font-semibold text-slate-800 font-sans-clean tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Sourcing Match Engine
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-20 bg-slate-50/50 backdrop-blur-xs border-b border-white/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2 font-sans-clean">Partners</span>
              <h2 className="font-serif-editorial text-3xl md:text-4xl text-slate-900">Featured Employers</h2>
            </div>
            <button className="hidden md:flex items-center text-xs font-bold tracking-wider uppercase text-slate-800 hover:text-slate-600 font-sans-clean">
              View all <ChevronRight size={14} className="ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {topCompanies.map((company, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                key={company.name} 
                className="glass-panel glass-panel-hover rounded-xl p-6 border border-white/50 cursor-pointer flex flex-col items-center text-center shadow-xs"
              >
                <div className="w-12 h-12 bg-white/60 border border-white/80 rounded-lg flex items-center justify-center text-lg font-bold text-slate-800 mb-4 shadow-2xs">
                  {company.logo}
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">{company.name}</h3>
                <div className="flex items-center gap-1 text-xs text-amber-500 mb-4 font-medium">
                  <Star size={11} fill="currentColor" />
                  {company.rating} <span className="text-slate-400 font-normal">({company.reviews})</span>
                </div>
                <button className="w-full py-1.5 bg-white/80 text-slate-800 rounded-lg text-xs font-semibold border border-white/95 hover:bg-white transition-colors cursor-pointer">
                  View Jobs
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="py-24 bg-white/20 backdrop-blur-xs border-b border-white/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2 font-sans-clean">Directories</span>
            <h2 className="font-serif-editorial text-4xl md:text-5xl text-slate-900 mb-4">Explore by Category</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-sans-clean font-medium">Browse thousands of active listings across the most demanded fields in Punjab.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                key={category.name}
                className="group p-6 rounded-xl border border-white/50 bg-white/40 backdrop-blur-md hover:bg-white/60 hover:border-white/80 hover:shadow-sm transition-all duration-300 cursor-pointer"
                onClick={() => {
                  localStorage.setItem('hyriq_landing_category', category.name);
                  setPerspective('candidate');
                }}
              >
                <div className="w-10 h-10 bg-white/80 border border-white/95 rounded-lg flex items-center justify-center text-lg mb-4 transition-colors">
                  {category.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-800 mb-1.5 group-hover:text-black transition-colors">{category.name}</h3>
                <p className="text-slate-500 text-xs flex items-center justify-between font-sans-clean font-medium">
                  {category.count}
                  <ArrowRight size={14} className="text-slate-800 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Dark Footer */}
      <footer className="bg-[#0f172a] text-slate-400 py-16 mt-auto">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <h2 className="font-serif-editorial italic text-3xl text-white tracking-tight mb-4">hyriq.</h2>
            <p className="text-xs text-neutral-400 mb-6 font-sans-clean leading-relaxed">
              Punjab's vibe matching career matching portal. Sourcing compatibility, elevating growth.
            </p>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full border border-neutral-800 hover:border-neutral-600 cursor-pointer transition-colors flex items-center justify-center text-xs text-white">𝕏</div>
              <div className="w-8 h-8 rounded-full border border-neutral-800 hover:border-neutral-600 cursor-pointer transition-colors flex items-center justify-center text-xs text-white">in</div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4 font-sans-clean">For Candidates</h4>
            <ul className="space-y-2.5 text-xs font-sans-clean">
              <li><a href="#" className="hover:text-white transition-colors">Browse Jobs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Salary Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Resume Builder</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Career Advice</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4 font-sans-clean">For Employers</h4>
            <ul className="space-y-2.5 text-xs font-sans-clean">
              <li><a href="#" className="hover:text-white transition-colors">Post a Job</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing Plans</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Sourcing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Enterprise Solutions</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4 font-sans-clean">Hyriq</h4>
            <ul className="space-y-2.5 text-xs font-sans-clean">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-12 mt-12 border-t border-neutral-850 text-[11px] text-neutral-500 flex flex-col md:flex-row justify-between items-center font-sans-clean">
          <p>© {new Date().getFullYear()} Hyriq Platform. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Sleep deeply, hire fully.</p>
        </div>
      </footer>
    </div>
  );
};
