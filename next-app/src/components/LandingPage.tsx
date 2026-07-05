import React from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '../context/AppContext';
import { BrainNLogo } from './BrainNLogo';

export const LandingPage: React.FC = () => {
  const { setPerspective, setVisitorRole } = useAppState();

  const handleRoleSelect = (role: 'candidate' | 'recruiter') => {
    setVisitorRole(role === 'candidate' ? 'seeker' : 'recruiter');
    setPerspective(role);
  };

  const grayscaleLogos = [
    { name: 'Acme Corp', logo: 'ACME' },
    { name: 'Globex', logo: 'GLOBEX' },
    { name: 'Initech', logo: 'INITECH' },
    { name: 'Umbrella Corp', logo: 'UMBRELLA' },
    { name: 'Hooli', logo: 'HOOLI' },
    { name: 'Vehement', logo: 'VEHEMENT' }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-600 flex flex-col font-sans antialiased">
      
      {/* 2. Hero Section (Deep Navy Background) */}
      <section className="bg-[#0f172a] text-white pt-24 pb-20 px-6 overflow-hidden relative">
        {/* Subtle decorative background elements */}
        <div className="absolute top-10 left-10 w-48 h-48 bg-[#2563eb]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#06b6d4]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
              Match with the Top 1% of Global Talent.
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              The intelligent hiring platform that connects high-growth startups with vetted professionals using smart matching technology.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <button 
                onClick={() => handleRoleSelect('recruiter')}
                className="btn-primary px-8 py-3.5 text-sm"
              >
                Hire Talent
              </button>
              <button 
                onClick={() => handleRoleSelect('candidate')}
                className="btn-accent px-8 py-3.5 text-sm border-white/30 text-white hover:bg-white/10"
              >
                Find a Job
              </button>
            </div>
          </motion.div>

          {/* Interactive UI Mockup Visual */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-3xl bg-[#1e293b]/60 border border-slate-700/50 rounded-lg p-6 text-left shadow-lg backdrop-blur-sm relative"
          >
            {/* Visual Header */}
            <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-6">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-600"></span>
                <span className="w-3 h-3 rounded-full bg-slate-600"></span>
                <span className="w-3 h-3 rounded-full bg-slate-600"></span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">HYRIQ MATCH MAKER</span>
            </div>

            {/* Mock Matching Layout */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
              {/* Candidate Side */}
              <div className="md:col-span-3 bg-[#0f172a] border border-slate-700/40 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded bg-[#2563eb] text-white flex items-center justify-center font-bold text-sm">
                    RS
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Rahul Sharma</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">Senior Software Dev</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">React</span>
                  <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">NodeJS</span>
                  <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Golang</span>
                </div>
              </div>

              {/* Connecting Accent Radar */}
              <div className="md:col-span-1 flex flex-col items-center justify-center py-4 md:py-0">
                <div className="w-10 h-10 rounded-full border border-[#06b6d4]/50 flex items-center justify-center bg-[#06b6d4]/10 animate-pulse">
                  <span className="text-[11px] font-bold text-[#06b6d4]">96%</span>
                </div>
                <div className="h-4 w-px bg-gradient-to-b from-[#2563eb] to-[#06b6d4] hidden md:block mt-1"></div>
              </div>

              {/* Job Side */}
              <div className="md:col-span-3 bg-[#0f172a] border border-slate-700/40 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded bg-[#06b6d4] text-white flex items-center justify-center font-bold text-sm">
                    XS
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Senior Backend Dev</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">Xenon Systems • Mohali</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-800 pt-2.5 mt-2">
                  <span>Budget: ₹18 - 24L</span>
                  <span className="text-[#06b6d4] font-semibold">Matching Candidate</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Social Proof Section (White Background) */}
      <section className="bg-slate-50 py-12 px-6 border-b border-slate-100">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
            Trusted by innovative companies worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            {grayscaleLogos.map((brand) => (
              <span 
                key={brand.name} 
                className="text-slate-400 font-bold tracking-widest text-sm hover:text-slate-600 transition-colors"
              >
                {brand.logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Feature Grid (Alternating Layout) */}
      <section id="features-section" className="py-20 px-6 bg-slate-50/50">
        <div className="max-w-6xl mx-auto space-y-24">
          
          {/* Feature 1 (Smart Matching): Text left, UI graphic right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-[#2563eb] uppercase tracking-wider">01 / SMART MATCHING</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Vetted compatibility scoring.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Go beyond standard keyword matching. Our intelligent matching engine analyzes core skills, work duration, past performance, and location-vibe parameters to deliver high-retention hiring.
              </p>
            </div>
            
            {/* UI graphic right: algorithm scoring candidate */}
            <div className="card-flat p-6 flex flex-col justify-between min-h-[220px]">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Algorithm Dashboard</span>
                <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded">Active</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span>Skills Compatibility</span>
                  <span className="font-bold text-[#2563eb]">98%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#2563eb] h-full" style={{ width: '98%' }}></div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span>Work Culture Alignment</span>
                  <span className="font-bold text-[#06b6d4]">90%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#06b6d4] h-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 (Seamless Onboarding): Text right, UI graphic left */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* UI graphic left: one-click profile import */}
            <div className="card-flat p-8 flex flex-col justify-center items-center text-center min-h-[220px] md:order-1 order-2">
              <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 animate-bounce">
                ⬇️
              </div>
              <h4 className="text-xs font-bold text-slate-800 mb-1">Drag & Drop Resume</h4>
              <p className="text-[10px] text-slate-400 max-w-[200px]">
                Import your LinkedIn PDF profile or docx resume to auto-fill.
              </p>
            </div>

            <div className="space-y-6 md:order-2 order-1">
              <span className="text-xs font-bold text-[#2563eb] uppercase tracking-wider">02 / ONBOARDING</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Seamless profile extraction.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Candidates can drag-and-drop their PDF resume to instantly pre-fill all certifications, past jobs, education, and contact details with 99.8% extraction accuracy.
              </p>
            </div>
          </div>

          {/* Feature 3 (Global Reach): Text left, Map visualization right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-[#2563eb] uppercase tracking-wider">03 / REACH</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Vast regional and global talent.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Source from Punjab's top technology hubs—Chandigarh, Mohali, Ludhiana, Bathinda—as well as vetted remote developers spanning global hubs.
              </p>
            </div>

            {/* UI graphic right: map visualization */}
            <div className="card-flat p-6 flex flex-col justify-between min-h-[220px] relative overflow-hidden bg-slate-950 text-white border-none">
              <div className="absolute inset-0 bg-[#0f172a] opacity-80 z-0"></div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] tracking-wider text-slate-400 font-mono">GLOBAL MAP OVERLAY</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <div className="py-6 flex flex-col gap-2">
                  <div className="text-xs flex justify-between">
                    <span className="text-slate-300">📍 Mohali Hub</span>
                    <span className="text-[#06b6d4] font-semibold">1,240 Professionals</span>
                  </div>
                  <div className="text-xs flex justify-between">
                    <span className="text-slate-300">📍 Chandigarh Hub</span>
                    <span className="text-[#06b6d4] font-semibold">982 Professionals</span>
                  </div>
                  <div className="text-xs flex justify-between">
                    <span className="text-slate-300">📍 Remote Networks</span>
                    <span className="text-[#2563eb] font-semibold">2,500+ Vetted devs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Call to Action Section (Electric Blue Background) */}
      <section id="cta-section" className="bg-[#2563eb] text-white py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            Ready to transform your hiring process?
          </h2>
          <button 
            onClick={() => handleRoleSelect('candidate')}
            className="bg-white hover:bg-slate-100 text-[#2563eb] font-bold text-sm px-8 py-3.5 rounded-lg active:scale-97 transition-all shadow-md cursor-pointer"
          >
            Get Started for Free
          </button>
        </div>
      </section>

      {/* 6. Footer (Deep Navy Background) */}
      <footer className="bg-[#0f172a] text-slate-400 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-slate-800 pb-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <BrainNLogo size={24} variant="light" />
              <span className="font-bold text-white tracking-wider font-sans-clean text-md">
                HYRIQ<span className="text-slate-400 font-normal text-xs">.online</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans-clean leading-relaxed max-w-sm">
              Punjab's leading candidate vetting and corporate career matching platform. Connecting companies with top 1% global talent.
            </p>
          </div>

          {/* Links Cols */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 font-sans-clean">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 font-sans-clean">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 font-sans-clean">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Legal</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} HYRIQ.online. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

