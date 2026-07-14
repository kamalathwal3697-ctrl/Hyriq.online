'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../context/AppContext';
import { BrainNLogo } from './BrainNLogo';
import { 
  Search, Building, MapPin, Sparkles, ArrowRight, ChevronRight, 
  Star, User, DollarSign, Check, Mail, Send, HelpCircle, Briefcase, 
  TrendingUp, Award, ShieldCheck, Zap
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setPerspective, setVisitorRole, jobs } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState<'jobs' | 'companies'>('jobs');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

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

  const popularCategories = [
    { name: 'Software Engineering', count: '1,420 jobs', icon: Zap, color: 'text-cyan-400' },
    { name: 'Design & Creative', count: '850 jobs', icon: Award, color: 'text-purple-400' },
    { name: 'Product Management', count: '310 jobs', icon: Sparkles, color: 'text-amber-400' },
    { name: 'Marketing & Sales', count: '940 jobs', icon: TrendingUp, color: 'text-emerald-400' },
    { name: 'Finance & Operations', count: '620 jobs', icon: ShieldCheck, color: 'text-blue-400' }
  ];

  const testimonials = [
    {
      quote: "HYRIQ.online completely transformed our engineering recruitment. We filled our key Senior Tech positions in Mohali within two weeks instead of months.",
      author: "Harpreet Singh",
      role: "VP of Engineering at TechVibe",
      avatar: "HS"
    },
    {
      quote: "The resume matching score is incredibly accurate. I uploaded my PDF profile, applied with one-click, and secured interviews with three premium companies.",
      author: "Priya Sharma",
      role: "Lead Full-Stack Developer",
      avatar: "PS"
    }
  ];

  const pricingPlans = [
    {
      name: "Launch Offer",
      originalPrice: "₹999",
      price: "₹149",
      period: "Limited Time Offer",
      features: [
        "Lifetime Access",
        "Daily Verified Job Updates",
        "No Monthly Fees ever",
        "One-Time Payment Only",
        "AI Resume Parsing & Match Scoring",
        "Standard Email Alerts"
      ],
      cta: "Grab Launch Offer",
      popular: false
    },
    {
      name: "Regular Lifetime",
      originalPrice: "₹1,499",
      price: "₹299",
      period: "One-Time Payment",
      features: [
        "Lifetime Access",
        "Daily Verified Job Updates",
        "No Monthly Fees ever",
        "One-Time Payment Only",
        "AI Resume Parsing & Match Scoring",
        "Priority WhatsApp/Telegram Alerts",
        "Verified Candidate Badge"
      ],
      cta: "Get Lifetime Access",
      popular: true
    },
    {
      name: "Premium Support Lifetime",
      originalPrice: "₹2,499",
      price: "₹499",
      period: "One-Time Payment",
      features: [
        "Lifetime Access",
        "Daily Verified Job Updates",
        "No Monthly Fees ever",
        "One-Time Payment Only",
        "AI Resume Parsing & Match Scoring",
        "Priority Support (24-hour turnaround)",
        "Resume Review Guide & Mock Sheets",
        "Direct recruiter chat access"
      ],
      cta: "Go Premium Support",
      popular: false
    }
  ];

  const faqs = [
    {
      q: "How does the HYRIQ AI Resume parser work?",
      a: "Our parser uses advanced NLP to scan uploaded PDF/docx resumes, extract key technical and business skills, and populate the candidate's profile instantly. This creates a standardized portfolio ready for match scoring."
    },
    {
      q: "What is the Fair Work Pact?",
      a: "The Fair Work Pact is a signed digital commitment between candidates and employers guaranteeing verified credentials, clear salary expectations, transparent communication, and quick feedback loops."
    },
    {
      q: "Are the regional talent pools vetted?",
      a: "Yes, we focus heavily on North Indian technology hubs (Mohali, Chandigarh, Ludhiana, Bathinda) and premium remote developers, verifying profiles against real experience parameters before listing them."
    },
    {
      q: "Can I cancel my subscription at any time?",
      a: "Absolutely. Recruiter subscription plans are billed month-to-month and can be updated, downgraded, or cancelled instantly within the billing dashboard."
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans antialiased relative overflow-hidden">
      
      {/* Cinematic glowing background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#2563eb] opacity-[0.12] blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#06b6d4] opacity-[0.1] blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-blue-500 opacity-[0.08] blur-[120px] pointer-events-none z-0" />

      {/* 2. Hero Section (Deep Navy Background) */}
      <section className="pt-36 pb-20 px-6 overflow-hidden relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 bg-[#2563eb]/10 border border-[#2563eb]/20 px-4 py-1.5 rounded-full text-xs font-bold text-[#2563eb] mb-6 shadow-[0_0_15px_rgba(37,99,235,0.1)]">
              <Sparkles size={12} className="text-[#06b6d4] animate-pulse" />
              Revolutionizing Enterprise Hiring with AI
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6 leading-[1.05] font-sans">
              Hire the Top 1%. <br className="hidden md:inline" />
              <span className="bg-gradient-to-r from-[#2563eb] to-[#06b6d4] bg-clip-text text-transparent font-black">In a Fraction of the Time.</span>
            </h1>
            <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              An intelligent, acrylic-smooth talent ecosystem connecting elite candidates with forward-thinking enterprises globally.
            </p>

            {/* Instant Job/Company Search Board */}
            <div className="w-full max-w-3xl mx-auto bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] mb-10 flex flex-col gap-4">
              <div className="flex gap-2 border-b border-white/5 pb-3">
                <button 
                  onClick={() => setSearchType('jobs')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${searchType === 'jobs' ? 'bg-[#2563eb] text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Search Jobs
                </button>
                <button 
                  onClick={() => setSearchType('companies')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${searchType === 'companies' ? 'bg-[#2563eb] text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Search Companies
                </button>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchType === 'jobs' ? "Job title, keywords, or skills..." : "Company name, sector, or mission..."}
                    className="w-full bg-slate-950/80 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#2563eb] transition-all"
                  />
                </div>
                <div className="w-full md:w-60 relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="Location or 'Remote'"
                    className="w-full bg-slate-950/80 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#2563eb] transition-all"
                  />
                </div>
                <button 
                  onClick={() => handleRoleSelect('candidate')}
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_4px_14px_rgba(37,99,235,0.4)]"
                >
                  Search <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-5">
              <button 
                onClick={() => handleRoleSelect('recruiter')}
                className="btn-primary rounded-full px-8 py-4 text-sm font-bold bg-[#2563eb] text-white shadow-[0_4px_20px_rgba(37,99,235,0.45)] hover:bg-[#1d4ed8] hover:shadow-[0_6px_25px_rgba(37,99,235,0.6)] hover:scale-105 active:scale-97 transition-all cursor-pointer"
              >
                Employers Workspace
              </button>
              <button 
                onClick={() => handleRoleSelect('candidate')}
                className="btn-accent rounded-full px-8 py-4 text-sm font-bold border-2 border-[#06b6d4] text-[#06b6d4] bg-transparent hover:bg-[#06b6d4]/10 hover:scale-105 active:scale-97 transition-all shadow-[0_4px_12px_rgba(6,182,212,0.15)] cursor-pointer"
              >
                Candidates Portal
              </button>
            </div>
          </motion.div>

          {/* Interactive UI Mockup Visual Anchor */}
          <div className="relative mt-8 w-full max-w-xl mx-auto flex items-center justify-center py-10 z-10">
            {/* Blue background glow behind the card */}
            <div className="absolute w-72 h-72 rounded-full bg-[#2563eb] opacity-[0.25] blur-[80px] pointer-events-none" />

            {/* 3D-Tilted Frosted Glass Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full glass-acrylic-dark rounded-3xl p-8 text-left shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 transition-all duration-500 ease-out relative z-10"
              style={{
                transform: 'rotateY(-8deg) rotateX(8deg)',
              }}
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-5 mb-6">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] shadow-[0_0_10px_rgba(37,99,235,0.8)]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] shadow-[0_0_10px_rgba(6,182,212,0.8)]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                </div>
                <span className="text-[10px] text-[#06b6d4] font-mono tracking-widest font-bold">MATCH PROFILE</span>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2563eb] to-[#06b6d4] text-white flex items-center justify-center font-bold text-lg shadow-[0_8px_16px_rgba(37,99,235,0.3)]">
                  AA
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-white mb-0.5">Arjun Anan</h4>
                  <p className="text-xs text-slate-400 font-semibold tracking-wide">Senior React Engineer</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5 bg-[#06b6d4]/10 border border-[#06b6d4]/20 px-3 py-1 rounded-full text-xs font-bold text-[#06b6d4] shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] shadow-[0_0_6px_#06b6d4]"></span>
                    98% Match
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Punjab (Remote)</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/5">
                <span className="text-[10px] font-bold bg-white/5 border border-white/10 text-white px-3 py-1 rounded-full">React / Next.js</span>
                <span className="text-[10px] font-bold bg-white/5 border border-white/10 text-white px-3 py-1 rounded-full">TypeScript</span>
                <span className="text-[10px] font-bold bg-white/5 border border-white/10 text-white px-3 py-1 rounded-full">PostgreSQL</span>
                <span className="text-[10px] font-bold bg-[#06b6d4]/10 border border-[#06b6d4]/25 text-[#06b6d4] px-3 py-1 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.1)]">Verified Top 1%</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Social Proof Section (Light Slate Gray Bar) */}
      <section className="bg-slate-900/40 py-12 px-6 border-y border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
            Trusted by innovative companies worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            {grayscaleLogos.map((brand) => (
              <span 
                key={brand.name} 
                className="text-slate-400 font-bold tracking-widest text-sm hover:text-slate-200 transition-colors"
              >
                {brand.logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-20 px-6 relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Popular Categories</h2>
          <p className="text-sm text-slate-400">Discover jobs across diverse high-impact business sectors</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {popularCategories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div 
                key={i}
                whileHover={{ y: -4, borderColor: 'rgba(37, 99, 235, 0.4)' }}
                className="bg-slate-900/50 backdrop-blur-sm border border-white/5 p-5 rounded-xl cursor-pointer transition-colors"
                onClick={() => handleRoleSelect('candidate')}
              >
                <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 ${cat.color}`}>
                  <Icon size={20} />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{cat.name}</h4>
                <p className="text-xs text-slate-500 font-medium">{cat.count}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="features-section" className="py-20 px-6 relative z-10 bg-slate-950/40">
        <div className="max-w-6xl mx-auto space-y-24">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Core Platform Ecosystem</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              We merge deep technical vetting with seamless AI matches to accelerate recruitment pipelines globally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-[#2563eb] uppercase tracking-wider">01 / SMART MATCHING</span>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Vetted compatibility scoring.
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Go beyond standard keyword matching. Our intelligent matching engine analyzes core skills, work duration, past performance, and regional metrics to deliver reliable high-retention hires.
              </p>
            </div>
            
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 flex flex-col justify-between min-h-[220px]">
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Algorithm Dashboard</span>
                <span className="bg-blue-900/30 text-blue-400 border border-blue-800/30 text-[9px] font-bold px-2 py-0.5 rounded">Active</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>Skills Compatibility</span>
                  <span className="font-bold text-[#2563eb]">98%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#2563eb] h-full" style={{ width: '98%' }}></div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>Work Culture Alignment</span>
                  <span className="font-bold text-[#06b6d4]">90%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#06b6d4] h-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-8 flex flex-col justify-center items-center text-center min-h-[220px] md:order-1 order-2">
              <div className="w-12 h-12 bg-blue-950 border border-blue-800/20 rounded-full flex items-center justify-center text-blue-400 mb-4 animate-bounce">
                📥
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Drag & Drop Resume</h4>
              <p className="text-xs text-slate-400 max-w-[200px]">
                Import your LinkedIn PDF profile or docx resume to auto-fill.
              </p>
            </div>

            <div className="space-y-6 md:order-2 order-1">
              <span className="text-xs font-bold text-[#2563eb] uppercase tracking-wider">02 / ONBOARDING</span>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Seamless profile extraction.
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Candidates can drag-and-drop their PDF resume to instantly pre-fill all certifications, past jobs, education, and contact details with 99.8% extraction accuracy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs list */}
      <section className="py-20 px-6 max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">Latest Careers</h2>
            <p className="text-sm text-slate-400">Discover freshly listed opportunities matching high standards</p>
          </div>
          <button 
            onClick={() => handleRoleSelect('candidate')}
            className="text-xs font-bold text-[#06b6d4] hover:text-[#2563eb] flex items-center gap-1 transition-colors"
          >
            Browse All Jobs <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jobs && jobs.slice(0, 3).map((job, idx) => (
            <div key={job.id || idx} className="bg-slate-900/40 backdrop-blur-sm border border-white/5 p-6 rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent pointer-events-none" />
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">{job.companyName || 'Corporate'}</span>
                <h4 className="text-base font-bold text-white mb-2 line-clamp-1">{job.title}</h4>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">{job.description}</p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-auto">
                <span className="text-xs font-semibold text-[#06b6d4]">{job.location || 'Remote'}</span>
                <span className="text-[10px] font-bold bg-[#2563eb]/20 text-[#2563eb] px-2.5 py-1 rounded-full">{job.type}</span>
              </div>
            </div>
          ))}
          {(!jobs || jobs.length === 0) && (
            [1, 2, 3].map((_, i) => (
              <div key={i} className="bg-slate-900/40 backdrop-blur-sm border border-white/5 p-6 rounded-xl min-h-[200px] flex flex-col justify-between">
                <div>
                  <div className="w-20 h-3 bg-slate-800 rounded mb-3 animate-pulse" />
                  <div className="w-3/4 h-5 bg-slate-800 rounded mb-2 animate-pulse" />
                  <div className="w-full h-8 bg-slate-800 rounded mb-4 animate-pulse" />
                </div>
                <div className="w-full h-6 bg-slate-800 rounded animate-pulse" />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing-section" className="py-20 px-6 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Affordable Lifetime Career Access</h2>
          <p className="text-sm text-slate-400">Pay once, unlock daily verified job opportunities and premium AI matches forever.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, i) => (
            <div 
              key={i}
              className={`bg-slate-900/50 backdrop-blur-sm border rounded-2xl p-8 relative flex flex-col justify-between ${plan.popular ? 'border-[#2563eb]' : 'border-white/5'}`}
            >
              {plan.popular && (
                <span className="absolute top-0 right-6 -translate-y-1/2 bg-[#2563eb] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Popular
                </span>
              )}
              <div>
                <h4 className="text-lg font-bold text-white mb-2">{plan.name}</h4>
                <div className="flex items-baseline gap-1.5 mb-2">
                  {plan.originalPrice && (
                    <span className="line-through text-slate-500 text-sm font-semibold mr-1">{plan.originalPrice}</span>
                  )}
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-xs text-slate-400 font-semibold">/ {plan.period}</span>
                </div>
                <ul className="space-y-3 mt-6 border-t border-white/5 pt-6">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check size={14} className="text-[#06b6d4] mt-0.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => handleRoleSelect('candidate')}
                className={`w-full font-bold text-xs py-3 rounded-xl mt-8 cursor-pointer transition-all ${plan.popular ? 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]' : 'bg-white/5 text-white hover:bg-white/10'}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 relative z-10 bg-slate-950/20 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Our Success Stories</h2>
            <p className="text-sm text-slate-400">See how companies and candidates achieve their career goals</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-2xl p-8 relative">
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium italic">"{test.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#06b6d4]/20 border border-[#06b6d4]/20 text-[#06b6d4] font-bold text-xs flex items-center justify-center">
                    {test.avatar}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">{test.author}</h5>
                    <p className="text-[10px] text-slate-500 font-semibold">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq-section" className="py-20 px-6 max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-400">Everything you need to know about the HYRIQ platform</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-xl overflow-hidden">
              <button 
                onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-sm text-white hover:bg-white/5 transition-all focus:outline-none"
              >
                <span>{faq.q}</span>
                <HelpCircle size={16} className={`text-slate-400 transition-transform ${faqOpen === idx ? 'rotate-180 text-[#06b6d4]' : ''}`} />
              </button>
              <AnimatePresence>
                {faqOpen === idx && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto relative z-10 text-center">
        <div className="bg-gradient-to-r from-[#2563eb]/10 to-[#06b6d4]/10 border border-white/10 rounded-3xl p-10 md:p-14">
          <Mail size={32} className="text-[#06b6d4] mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Stay ahead of the curve</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
            Get weekly updates on regional tech opportunities, salary trends, and recruiter hacks delivered directly to your inbox.
          </p>
          {!newsletterSubscribed ? (
            <div className="flex flex-col md:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="email" 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-[#2563eb] placeholder-slate-600 transition-all"
              />
              <button 
                onClick={() => {
                  if (newsletterEmail.includes('@')) {
                    setNewsletterSubscribed(true);
                  }
                }}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                Subscribe <Send size={12} />
              </button>
            </div>
          ) : (
            <span className="text-xs font-bold text-emerald-400">🎉 Thank you for subscribing! Check your email soon.</span>
          )}
        </div>
      </section>

      {/* 5. Call to Action Section (Electric Blue Background) */}
      <section id="cta-section" className="bg-[#2563eb] text-white py-16 px-6 text-center relative z-10">
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
      <footer className="bg-[#0f172a] text-slate-400 py-16 px-6 border-t border-slate-900 relative z-10">
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
