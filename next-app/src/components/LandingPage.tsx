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
    <div className="min-h-screen bg-[var(--color-background)] text-slate-900 w-full overflow-hidden flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-20 bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
              <Sparkles size={16} /> The #1 AI-Powered Job Portal
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight font-sans">
              Find your dream job <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                faster than ever.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium">
              Join thousands of top professionals. Upload your resume, let our AI match you with perfect roles, and get hired by world-class companies.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="bg-white p-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col md:flex-row items-center max-w-4xl mx-auto">
              <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-slate-200 w-full">
                <Search className="text-slate-400 mr-3" size={24} />
                <input 
                  type="text" 
                  placeholder="Job title, keywords, or company" 
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="w-full text-lg outline-none text-slate-800 placeholder-slate-400 bg-transparent"
                />
              </div>
              <div className="flex-1 flex items-center px-4 py-3 w-full">
                <MapPin className="text-slate-400 mr-3" size={24} />
                <input 
                  type="text" 
                  placeholder="City, state, or 'Remote'" 
                  value={searchLoc}
                  onChange={(e) => setSearchLoc(e.target.value)}
                  className="w-full text-lg outline-none text-slate-800 placeholder-slate-400 bg-transparent"
                />
              </div>
              <button 
                type="submit"
                className="w-full md:w-auto mt-2 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/30 whitespace-nowrap"
              >
                Find Jobs
              </button>
            </form>

            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-slate-500 font-medium">
              Popular: 
              <span className="text-slate-700 hover:text-blue-600 cursor-pointer transition-colors">Frontend Developer</span>,
              <span className="text-slate-700 hover:text-blue-600 cursor-pointer transition-colors">Product Manager</span>,
              <span className="text-slate-700 hover:text-blue-600 cursor-pointer transition-colors">Data Scientist</span>,
              <span className="text-slate-700 hover:text-blue-600 cursor-pointer transition-colors">Remote</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Top Employers</h2>
              <p className="text-slate-600">Discover companies that match your career goals.</p>
            </div>
            <button className="hidden md:flex items-center text-blue-600 font-semibold hover:text-blue-700">
              View all companies <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {topCompanies.map((company, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={company.name} 
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-2xl font-black text-slate-400 mb-4">
                  {company.logo}
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{company.name}</h3>
                <div className="flex items-center gap-1 text-sm text-amber-500 mb-2 font-medium">
                  <Star size={14} fill="currentColor" />
                  {company.rating} <span className="text-slate-400 font-normal">({company.reviews})</span>
                </div>
                <button className="mt-2 w-full py-2 bg-slate-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
                  View Jobs
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Explore by Category</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Browse thousands of job openings across top industries and discover your next great opportunity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                key={category.name}
                className="group p-6 rounded-2xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/50 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => {
                  localStorage.setItem('hyriq_landing_category', category.name);
                  setPerspective('candidate');
                }}
              >
                <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4 transition-colors">
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">{category.name}</h3>
                <p className="text-slate-500 font-medium flex items-center justify-between">
                  {category.count}
                  <ArrowRight size={16} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0" />
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 mt-auto border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-black text-white tracking-tighter mb-4">Hyriq.</h2>
            <p className="text-sm text-slate-400 mb-6">
              The modern, AI-powered platform connecting top talent with world-class companies.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 cursor-pointer transition-colors flex items-center justify-center text-white">𝕏</div>
              <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 cursor-pointer transition-colors flex items-center justify-center text-white">in</div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">For Candidates</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Browse Jobs</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Salary Guide</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Resume Builder</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Career Advice</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">For Employers</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Post a Job</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing Plans</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">AI Sourcing</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Enterprise Solutions</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Hyriq</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-12 mt-12 border-t border-slate-800 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} Hyriq Platform. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Made with ❤️ for modern hiring.</p>
        </div>
      </footer>
    </div>
  );
};
