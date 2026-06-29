import React, { useState } from 'react';
import { Search, MapPin, Sparkles, TrendingUp, Zap, MessageSquare, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import { getLocationDetails } from '../utils/locationHelper';

export const LandingPage: React.FC = () => {
  const { setPerspective, promoSlots, jobs, currentLocation } = useAppState();
  const locDetails = getLocationDetails(currentLocation);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLoc, setSearchLoc] = useState('');
  
  const [showPromo, setShowPromo] = useState(() => {
    return sessionStorage.getItem('hyriq_promo_dismissed') !== 'true';
  });

  const dismissPromo = () => {
    sessionStorage.setItem('hyriq_promo_dismissed', 'true');
    setShowPromo(false);
  };
  
  // Interactive mini vibe quiz
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('hyriq_landing_search', searchTitle);
    localStorage.setItem('hyriq_landing_location', searchLoc);
    setPerspective('candidate');
  };

  const handleCategoryClick = (categoryName: string) => {
    localStorage.setItem('hyriq_landing_category', categoryName);
    setPerspective('candidate');
  };

  const handleQuizAnswer = (answer: string) => {
    const nextAnswers = [...quizAnswers, answer];
    setQuizAnswers(nextAnswers);
    if (quizStep < 2) {
      setQuizStep(prev => prev + 1);
    } else {
      // Calculate and save recommendation
      let recommendedCategory = 'Tech & Engineering';
      if (nextAnswers[0] === 'creative') recommendedCategory = 'Design & Product';
      else if (nextAnswers[1] === 'people') recommendedCategory = 'Sales & Operations';
      else if (nextAnswers[2] === 'independent') recommendedCategory = 'Marketing & Content';
      
      localStorage.setItem('hyriq_landing_category', recommendedCategory);
      setQuizStep(3);
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers([]);
  };

  const getCategoryCount = (catName: string) => {
    return jobs.filter(job => {
      if (catName === 'Tech & Engineering') {
        return job.title.includes('Engineer') || job.skills.includes('React') || job.skills.includes('TypeScript') || job.skills.includes('Node.js');
      }
      if (catName === 'Design & Product') {
        return job.title.includes('Design') || job.skills.includes('UI Design') || job.skills.includes('Figma') || job.title.includes('Product');
      }
      if (catName === 'Marketing & Content') {
        return job.title.includes('Marketing') || job.title.includes('Content') || job.skills.includes('Copywriting') || job.skills.includes('SEO');
      }
      if (catName === 'Sales & Operations') {
        return job.title.includes('Sales') || job.title.includes('Operations') || job.title.includes('Advocate');
      }
      return false;
    }).length;
  };

  const categories = [
    { name: 'Tech & Engineering', count: getCategoryCount('Tech & Engineering'), icon: <Zap size={20} color="#818cf8" /> },
    { name: 'Design & Product', count: getCategoryCount('Design & Product'), icon: <Sparkles size={20} color="#f472b6" /> },
    { name: 'Marketing & Content', count: getCategoryCount('Marketing & Content'), icon: <TrendingUp size={20} color="#fb7185" /> },
    { name: 'Sales & Operations', count: getCategoryCount('Sales & Operations'), icon: <MessageSquare size={20} color="#22d3ee" /> }
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '80px', position: 'relative' }}>
      {/* Launch Offer Promo Popup Overlay */}
      {showPromo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 3, 10, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel animate-glow" style={{
            width: '100%',
            maxWidth: '450px',
            padding: '32px',
            position: 'relative',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {/* Close Button */}
            <button 
              onClick={dismissPromo}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>

            {/* Glowing Icon */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
            }}>
              <Zap size={28} color="#fff" />
            </div>

            <span className="badge badge-warning" style={{ marginBottom: '12px', fontSize: '11px', padding: '4px 12px' }}>
              🔥 LIMITED TIME OFFER
            </span>

            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '12px', fontFamily: 'Outfit' }}>
              First 100 Registrations are 100% FREE!
            </h3>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
              Join Hyriq today as a Candidate or Recruiter. We are wave-funding early bird members. Slots are filling fast!
            </p>

            {/* Slots Counter Card */}
            <div className="glass-panel" style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>FREE SLOTS REMAINING</span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)' }}>
                  {promoSlots} / 100
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>REGULAR PRICE</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                  ₹99.00
                </span>
              </div>
            </div>

            <button 
              onClick={() => {
                dismissPromo();
                setPerspective('candidate'); // open auth setup
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px' }}
            >
              Claim Your Free Account Now
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section style={{
        padding: '80px 0 60px 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background glow effects */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '15%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)',
          zIndex: -1,
          pointerEvents: 'none'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, rgba(0,0,0,0) 70%)',
          zIndex: -1,
          pointerEvents: 'none'
        }}></div>

        <div className="container">
          <span className="badge badge-primary" style={{ marginBottom: '20px', padding: '6px 14px', fontSize: '13px' }}>
            <Sparkles size={12} style={{ marginRight: '6px' }} />
            The Job Portal Built for the Next Gen
          </span>

          <h1 style={{
            fontFamily: 'Outfit',
            fontSize: '64px',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
            maxWidth: '850px',
            margin: '0 auto 24px auto'
          }}>
            Find Your Next <span className="text-gradient-primary">{locDetails.vibeTitle}</span>.<br />
            Hire Your Next <span className="text-gradient-secondary">Rockstar Locally</span>.
          </h1>

          <p style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 40px auto',
            lineHeight: 1.6
          }}>
            {locDetails.tagline}
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="glass-panel animate-glow" style={{
            maxWidth: '800px',
            margin: '0 auto 60px auto',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '200px', padding: '8px 12px', gap: '8px' }}>
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Job title, skills or keyword..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  width: '100%',
                  fontFamily: 'var(--sans-font)'
                }}
              />
            </div>
            
            <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border-color)', display: 'none' }} className="search-divider"></div>

            <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '200px', padding: '8px 12px', gap: '8px' }}>
              <MapPin size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder={`Location (e.g. ${locDetails.city}, Remote)...`}
                value={searchLoc}
                onChange={(e) => setSearchLoc(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  width: '100%',
                  fontFamily: 'var(--sans-font)'
                }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '14px 28px' }}>
              Explore Jobs
            </button>
          </form>

          {/* Core Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{jobs.length}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Active Opportunities</p>
            </div>
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{new Set(jobs.map(j => j.companyName)).size}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Verified Workplaces</p>
            </div>
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>1-on-1</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Direct Recruiter Chat</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Categories Section */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '40px', fontWeight: 700, fontSize: '32px' }}>
            Browse by <span className="text-gradient-primary">Category</span>
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px'
          }}>
            {categories.map((cat, idx) => (
              <div 
                key={idx}
                onClick={() => handleCategoryClick(cat.name)}
                className="glass-panel glass-panel-hover"
                style={{
                  padding: '32px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-color)'
                }}>
                  {cat.icon}
                </div>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>{cat.name}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{cat.count} open roles</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Fair Work Pact Section */}
      <section style={{ padding: '60px 0', position: 'relative' }}>
        {/* Background ambient glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, rgba(0,0,0,0) 70%)',
          zIndex: -1,
          pointerEvents: 'none'
        }}></div>

        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge badge-success" style={{ marginBottom: '16px', padding: '6px 14px', fontSize: '13px' }}>
              <ShieldCheck size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Hyriq Mutual Standards
            </span>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '36px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
              The <span className="text-gradient-primary">Fair Work Pact</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
              A mutual agreement ensuring respect, security, and accountability for both the worker and the employer.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '32px',
            alignItems: 'stretch'
          }}>
            {/* Worker Rights Card */}
            <div className="glass-panel animate-glow" style={{
              padding: '36px',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              boxShadow: '0 8px 32px 0 rgba(168, 85, 247, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(168, 85, 247, 0.3)'
                }}>
                  <ShieldCheck size={20} color="#c084fc" />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  🛡️ Worker Rights <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', fontWeight: 500, marginTop: '2px' }}>(Employer Commitments)</span>
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ color: 'var(--success)', marginTop: '2px' }}>✓</div>
                  <div>
                    <strong style={{ color: '#fff', display: 'block', fontSize: '14px', marginBottom: '2px' }}>Fair Working Hours</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>Strict adherence to a standard, limited work schedule.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ color: 'var(--success)', marginTop: '2px' }}>✓</div>
                  <div>
                    <strong style={{ color: '#fff', display: 'block', fontSize: '14px', marginBottom: '2px' }}>Overtime Pay</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>Guaranteed extra compensation for any hours worked beyond the daily limit.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ color: 'var(--success)', marginTop: '2px' }}>✓</div>
                  <div>
                    <strong style={{ color: '#fff', display: 'block', fontSize: '14px', marginBottom: '2px' }}>Health & Well-being</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>Access to basic medical benefits and a safe working environment.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ color: 'var(--success)', marginTop: '2px' }}>✓</div>
                  <div>
                    <strong style={{ color: '#fff', display: 'block', fontSize: '14px', marginBottom: '2px' }}>Accommodation Support</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>Housing allowance or safe, provided accommodation where applicable.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ color: 'var(--success)', marginTop: '2px' }}>✓</div>
                  <div>
                    <strong style={{ color: '#fff', display: 'block', fontSize: '14px', marginBottom: '2px' }}>Job Security</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>Protection against unfair firing without valid cause or proper notice.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ color: 'var(--success)', marginTop: '2px' }}>✓</div>
                  <div>
                    <strong style={{ color: '#fff', display: 'block', fontSize: '14px', marginBottom: '2px' }}>Merit-Based Growth</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>Guaranteed salary raises or promotions upon successfully achieving predefined work targets.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Worker Duties Card */}
            <div className="glass-panel animate-glow" style={{
              padding: '36px',
              border: '1px solid rgba(34, 211, 238, 0.2)',
              boxShadow: '0 8px 32px 0 rgba(34, 211, 238, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(34, 211, 238, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(34, 211, 238, 0.3)'
                }}>
                  <Sparkles size={20} color="#22d3ee" />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  🤝 Worker Duties <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', fontWeight: 500, marginTop: '2px' }}>(Employee Commitments)</span>
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ color: 'var(--secondary)', marginTop: '2px' }}>✦</div>
                  <div>
                    <strong style={{ color: '#fff', display: 'block', fontSize: '14px', marginBottom: '2px' }}>Punctuality</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>Consistently arriving on time and respecting the work schedule.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ color: 'var(--secondary)', marginTop: '2px' }}>✦</div>
                  <div>
                    <strong style={{ color: '#fff', display: 'block', fontSize: '14px', marginBottom: '2px' }}>Prompt Communication</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>Timely and professional responses to all work-related messages or requests.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ color: 'var(--secondary)', marginTop: '2px' }}>✦</div>
                  <div>
                    <strong style={{ color: '#fff', display: 'block', fontSize: '14px', marginBottom: '2px' }}>Responsibility</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>Taking full ownership of assigned tasks and performing them diligently.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ color: 'var(--secondary)', marginTop: '2px' }}>✦</div>
                  <div>
                    <strong style={{ color: '#fff', display: 'block', fontSize: '14px', marginBottom: '2px' }}>Absolute Integrity</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>Honesty in reporting hours, tasks, and issues.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ color: 'var(--secondary)', marginTop: '2px' }}>✦</div>
                  <div>
                    <strong style={{ color: '#fff', display: 'block', fontSize: '14px', marginBottom: '2px' }}>Professional Conduct</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>Respectful behavior towards coworkers and clients.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Vibe Quiz Wrapper */}
      <section style={{ padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: '750px' }}>
          <div className="glass-panel animate-glow" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'rgba(168, 85, 247, 0.1)',
              filter: 'blur(30px)'
            }}></div>

            {quizStep === 0 && (
              <div style={{ textAlign: 'center' }}>
                <span className="badge badge-secondary" style={{ marginBottom: '12px' }}>Interactive Quiz</span>
                <h3 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>Find Your Career Vibe</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>
                  Answer 3 quick questions about your work style, and we will match you with custom career feeds.
                </p>
                <button onClick={() => setQuizStep(1)} className="btn btn-primary">
                  Start Vibe Quiz <ArrowRight size={16} />
                </button>
              </div>
            )}

            {quizStep === 1 && (
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Question 1 of 3</span>
                <h4 style={{ fontSize: '20px', color: '#fff', fontWeight: 600, margin: '8px 0 24px 0' }}>
                  How do you prefer to spend your work day?
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button onClick={() => handleQuizAnswer('tech')} className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '16px' }}>
                    💻 Writing code, analyzing logic, and building systems
                  </button>
                  <button onClick={() => handleQuizAnswer('creative')} className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '16px' }}>
                    🎨 Designing user interfaces, mockups, or copywriting
                  </button>
                  <button onClick={() => handleQuizAnswer('management')} className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '16px' }}>
                    📈 Coordinating projects, leading standups, and talking to clients
                  </button>
                </div>
              </div>
            )}

            {quizStep === 2 && (
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Question 2 of 3</span>
                <h4 style={{ fontSize: '20px', color: '#fff', fontWeight: 600, margin: '8px 0 24px 0' }}>
                  What kind of team environment fuels you the most?
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button onClick={() => handleQuizAnswer('collaborative')} className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '16px' }}>
                    👥 Highly collaborative, active Discord/Slack, daily syncs
                  </button>
                  <button onClick={() => handleQuizAnswer('independent')} className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '16px' }}>
                    🏡 Fully async, remote-first, deep focused blocks of work
                  </button>
                  <button onClick={() => handleQuizAnswer('people')} className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '16px' }}>
                    🤝 Directly helping developers, customer support, or organizing community events
                  </button>
                </div>
              </div>
            )}

            {quizStep === 3 && (
              <div style={{ textAlign: 'center' }}>
                <span className="badge badge-success" style={{ marginBottom: '12px' }}>Vibe Matched!</span>
                <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Matches Found!</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '15px' }}>
                  We calculated your responses. You would fit perfectly into our{' '}
                  <strong style={{ color: 'var(--primary)' }}>
                    {localStorage.getItem('hyriq_landing_category') || 'Tech & Engineering'}
                  </strong>{' '}
                  roles!
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={() => setPerspective('candidate')} className="btn btn-primary">
                    View Matches <ArrowRight size={16} />
                  </button>
                  <button onClick={resetQuiz} className="btn btn-ghost">
                    Retake
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '40px', fontWeight: 700, fontSize: '32px' }}>
            Hiring Without the <span className="text-gradient-secondary">Bureacracy</span>
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px'
          }}>
            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><Zap size={32} /></div>
              <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '12px' }}>1-Click Vibe Match</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                Apply with a clean interactive profile. Recruiters see your skills, project highlights, and preferences instantly.
              </p>
            </div>
            
            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ color: 'var(--secondary)', marginBottom: '16px' }}><MessageSquare size={32} /></div>
              <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '12px' }}>Direct Messaging</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                Skip the auto-rejection emails. Chat directly with technical recruiters and managers once your profile is matched.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ color: 'var(--accent)', marginBottom: '16px' }}><ShieldCheck size={32} /></div>
              <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '12px' }}>Verified Employers</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                No ghost jobs, no bait-and-switch. Every employer on Hyriq is authenticated with active projects and clear salary rates.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
