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
      <section className="relative pt-24 pb-20 px-6 lg:px-20 bg-[#f4f4f4] border-b border-neutral-200/60">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-neutral-300 text-neutral-600 text-xs font-medium mb-6 uppercase tracking-wider">
              <Sparkles size={12} /> Punjab's Vibe Matching Career Platform
            </span>
            <h1 className="font-serif-editorial text-5xl md:text-7xl lg:text-8xl font-normal tracking-tight text-[#111111] leading-[1.05] mb-8">
              vibe matching.<br />
              <span className="italic">professional hiring.</span>
            </h1>
            <p className="text-base md:text-lg text-[#767676] mb-12 max-w-2xl mx-auto font-normal font-sans-clean leading-relaxed">
              Introducing Punjab's first EEG-vibe matching career platform. Go beyond static resumes. Our AI matches candidates and recruiters on real alignment, workspace culture, and professional compatibility.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="bg-white p-2 rounded-2xl md:rounded-full border border-neutral-200/80 flex flex-col md:flex-row items-center max-w-3xl mx-auto transition-all duration-300 focus-within:border-neutral-400">
              <div className="flex-1 flex items-center px-4 py-3.5 border-b md:border-b-0 md:border-r border-neutral-100 w-full">
                <Search className="text-neutral-400 mr-2.5" size={18} />
                <input 
                  type="text" 
                  placeholder="Job title, keywords, or company" 
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="w-full text-sm outline-none text-neutral-800 placeholder-neutral-400 bg-transparent font-sans-clean"
                />
              </div>
              <div className="flex-1 flex items-center px-4 py-3.5 w-full">
                <MapPin className="text-neutral-400 mr-2.5" size={18} />
                <input 
                  type="text" 
                  placeholder="City, state, or 'Remote'" 
                  value={searchLoc}
                  onChange={(e) => setSearchLoc(e.target.value)}
                  className="w-full text-sm outline-none text-neutral-800 placeholder-neutral-400 bg-transparent font-sans-clean"
                />
              </div>
              <button 
                type="submit"
                className="w-full md:w-auto mt-2 md:mt-0 bg-[#111111] hover:bg-[#333333] text-white px-8 py-3.5 rounded-xl md:rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap"
              >
                Find Jobs
              </button>
            </form>

            <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-neutral-500 font-sans-clean">
              Trending: 
              <span className="text-neutral-800 hover:underline cursor-pointer">Sales Executive</span>,
              <span className="text-neutral-800 hover:underline cursor-pointer">Team Leader</span>,
              <span className="text-neutral-800 hover:underline cursor-pointer">Mohali</span>,
              <span className="text-neutral-800 hover:underline cursor-pointer">Remote</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid Highlight: AI Sourcing */}
      <section className="py-20 bg-white border-b border-neutral-200/60">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-3 font-sans-clean">AI Sourcing</span>
            <h2 className="font-serif-editorial text-4xl md:text-5xl leading-tight text-[#111111] mb-6">
              Hire deeply, <span className="italic">build fully.</span>
            </h2>
            <p className="text-neutral-600 font-sans-clean text-sm leading-relaxed mb-8">
              We believe a resume is just a piece of paper. Hyriq maps dynamic workspace vibrations, candidate aspirations, and recruiter objectives to forge high-compatibility professional relationships.
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-xs text-neutral-800">✓</div>
                <p className="text-neutral-700 text-sm font-sans-clean"><strong className="text-neutral-900 font-medium">94% Compatibility Ratio:</strong> Vibe match-making ensures candidates stay longer and thrive.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-xs text-neutral-800">✓</div>
                <p className="text-neutral-700 text-sm font-sans-clean"><strong className="text-neutral-900 font-medium">One-Time Registration:</strong> Low entry cost and free tools for recruiters.</p>
              </div>
            </div>
          </div>
          <div className="bg-[#f4f4f4] aspect-[4/3] rounded-2xl border border-neutral-200 flex flex-col justify-center items-center p-8 relative overflow-hidden">
            <div className="absolute top-6 left-6 text-[10px] font-mono text-neutral-400">HYRIQ GRAPH MODEL</div>
            <div className="w-32 h-32 rounded-full border border-dashed border-neutral-300 flex items-center justify-center animate-spin-slow">
              <div className="w-20 h-20 rounded-full border border-neutral-300 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs">H</div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-neutral-900">Punjab Match Engine</p>
              <p className="text-xs text-neutral-500 mt-1">Calculating compatibility vectors...</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-20 bg-[#f4f4f4] border-b border-neutral-200/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-2 font-sans-clean">Partners</span>
              <h2 className="font-serif-editorial text-3xl md:text-4xl text-[#111111]">Featured Employers</h2>
            </div>
            <button className="hidden md:flex items-center text-xs font-semibold tracking-wider uppercase text-neutral-800 hover:text-neutral-600 font-sans-clean">
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
                className="bg-white rounded-xl p-6 border border-neutral-200/80 hover:border-neutral-300 transition-all duration-300 cursor-pointer flex flex-col items-center text-center shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-center text-lg font-bold text-neutral-800 mb-4">
                  {company.logo}
                </div>
                <h3 className="font-semibold text-neutral-900 text-sm mb-1">{company.name}</h3>
                <div className="flex items-center gap-1 text-xs text-amber-500 mb-4">
                  <Star size={11} fill="currentColor" />
                  {company.rating} <span className="text-neutral-400 font-normal">({company.reviews})</span>
                </div>
                <button className="w-full py-1.5 bg-neutral-50 text-neutral-800 rounded-lg text-xs font-medium border border-neutral-200 hover:bg-neutral-100 transition-colors">
                  View Jobs
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="py-24 bg-white border-b border-neutral-200/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-2 font-sans-clean">Directories</span>
            <h2 className="font-serif-editorial text-4xl md:text-5xl text-[#111111] mb-4">Explore by Category</h2>
            <p className="text-sm text-neutral-500 max-w-xl mx-auto font-sans-clean">Browse thousands of active listings across the most demanded fields in Punjab.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                key={category.name}
                className="group p-6 rounded-xl border border-neutral-200 hover:border-neutral-400 bg-white hover:shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => {
                  localStorage.setItem('hyriq_landing_category', category.name);
                  setPerspective('candidate');
                }}
              >
                <div className="w-10 h-10 bg-neutral-50 group-hover:bg-neutral-100 border border-neutral-200 rounded-lg flex items-center justify-center text-lg mb-4 transition-colors">
                  {category.icon}
                </div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1.5 group-hover:text-black transition-colors">{category.name}</h3>
                <p className="text-neutral-500 text-xs flex items-center justify-between font-sans-clean font-medium">
                  {category.count}
                  <ArrowRight size={14} className="text-neutral-800 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Dark Footer */}
      <footer className="bg-[#111111] text-[#767676] py-16 mt-auto">
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
