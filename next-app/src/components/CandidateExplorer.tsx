import React, { useState, useEffect } from 'react';
import { Search, Briefcase, MessageSquare, GraduationCap, Award, ArrowLeft } from 'lucide-react';
import { useAppState } from '../context/AppContext';

const isMobileLayout = () => {
  const isPortrait = window.innerHeight > window.innerWidth;
  return window.innerWidth <= 767 || (window.innerWidth <= 1024 && isPortrait);
};

export const CandidateExplorer: React.FC = () => {
  const { token, user, setPerspective, setVisitorRole } = useAppState();
  
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [expFilter, setExpFilter] = useState<string[]>([]);
  const [modeFilter, setModeFilter] = useState<string[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [isClosingDetail, setIsClosingDetail] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Load public candidates or admin candidates depending on role
    const endpoint = (user?.email === 'raj_athwal' && token) ? '/api/admin/candidates' : '/api/visitor/candidates';
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(endpoint, { headers })
      .then(res => res.json())
      .then(data => {
        setCandidates(data);
        if (data.length > 0 && !isMobileLayout()) {
          setSelectedCandidate(data[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch candidates:', err);
        setLoading(false);
      });
  }, [user, token]);

  const handleSelectCandidate = (cand: any) => {
    setSelectedCandidate(cand);
    if (isMobileLayout()) {
      window.history.pushState({ candidateDetailOpen: true }, '');
    }
  };

  const handleCloseDetails = () => {
    if (isClosingDetail) return;
    setIsClosingDetail(true);
    setTimeout(() => {
      setSelectedCandidate(null);
      setIsClosingDetail(false);
    }, 280);
    if (isMobileLayout() && window.history.state?.candidateDetailOpen) {
      window.history.back();
    }
  };

  // Support back button for mobile candidate details overlay
  useEffect(() => {
    const handlePopState = () => {
      if (selectedCandidate) {
        setIsClosingDetail(true);
        setTimeout(() => {
          setSelectedCandidate(null);
          setIsClosingDetail(false);
        }, 280);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedCandidate]);

  // Filter candidates
  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = searchQuery === '' ||
      cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cand.bio && cand.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cand.skills && cand.skills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesExp = expFilter.length === 0 || expFilter.includes(cand.experience);
    
    // Check preferences mode
    const matchesMode = modeFilter.length === 0 || 
      (cand.preferences && cand.preferences.mode && cand.preferences.mode.some((m: string) => modeFilter.includes(m)));

    return matchesSearch && matchesExp && matchesMode;
  });

  const toggleExpFilter = (level: string) => {
    setExpFilter(prev => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]);
  };

  const toggleModeFilter = (mode: string) => {
    setModeFilter(prev => prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]);
  };

  const renderSkills = (skills: string[] = []) => {
    return skills.map(skill => (
      <span key={skill} className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}>
        {skill}
      </span>
    ));
  };

  if (user && user.role === 'candidate') {
    return null;
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Dynamic Visitor Sub-Header Selector for Mobile App */}
      {!(user && user.role === 'recruiter') && (
        <div className="visitor-role-header" style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        gap: '12px'
      }}>
        <button 
          onClick={() => setVisitorRole('seeker')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            background: 'rgba(255,255,255,0.03)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'none'
          }}
        >
          🔍 Find a Job (Option 1)
        </button>
        <button 
          onClick={() => setVisitorRole('recruiter')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            background: 'var(--tech-orange)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(242, 153, 74, 0.3)'
          }}
        >
          💼 Search Candidates (Option 2)
        </button>
      </div>
      )}

      <div className="container" style={{ padding: '24px 16px' }}>
      {/* Header Info */}
      <div style={{ marginBottom: '24px', textAlign: 'left' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'Outfit' }}>
          Explore Local Talent
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
          Browse verified candidates and hire directly in Bathinda.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Search Input */}
        <div style={{ display: 'flex', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search candidates by name, bio, or skills (e.g. React, Industrial Safety)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input"
            style={{ paddingLeft: '48px', width: '100%' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', fontSize: '13px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Experience:</span>
            {['Entry-level', 'Mid-level', 'Senior-level'].map(lvl => (
              <button
                key={lvl}
                onClick={() => toggleExpFilter(lvl)}
                className={`btn ${expFilter.includes(lvl) ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '16px' }}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Target Work Mode:</span>
            {['On-site', 'Hybrid', 'Remote'].map(mode => (
              <button
                key={mode}
                onClick={() => toggleModeFilter(mode)}
                className={`btn ${modeFilter.includes(mode) ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '16px' }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="explore-main" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Candidates List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
              <div className="pull-refresh-spin" style={{ fontSize: '24px', marginBottom: '12px' }}>🔄</div>
              Loading candidate profiles...
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No candidates found matching your criteria.
            </div>
          ) : (
            filteredCandidates.map(cand => {
              const isSelected = selectedCandidate?.id === cand.id;
              return (
                <div
                  key={cand.id}
                  onClick={() => handleSelectCandidate(cand)}
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    cursor: 'pointer',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    boxShadow: isSelected ? '0 0 15px rgba(99, 102, 241, 0.15)' : 'none',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--tech-orange) 0%, #1A3E62 100%)',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <div style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: '#0B0E14',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        overflow: 'hidden'
                      }}>
                        {cand.logoSeed && (cand.logoSeed.startsWith('data:image/') || cand.logoSeed.startsWith('http')) ? (
                          <img src={cand.logoSeed} alt="DP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          cand.logoSeed || '🧑‍💻'
                        )}
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, margin: 0 }}>{cand.name}</h4>
                          <span style={{ fontSize: '11px', color: 'var(--tech-orange)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginTop: '2px' }}>
                            ⚡ {cand.experience}
                          </span>
                        </div>
                        {cand.preferences && (
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                            ₹{cand.preferences.minSalary?.toLocaleString()}/mo
                          </span>
                        )}
                      </div>

                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '8px 0 12px 0', lineHeight: 1.4 }}>
                        {cand.bio || 'Job seeker registered on Hyriq.'}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {cand.skills && cand.skills.slice(0, 4).map((s: string) => (
                          <span key={s} style={{ background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>
                            {s}
                          </span>
                        ))}
                        {cand.skills && cand.skills.length > 4 && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '10px', padding: '2px 4px' }}>
                            +{cand.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Candidate Profile Details Sidebar */}
        <aside className="explore-sidebar" style={{ position: 'sticky', top: '24px', flexShrink: 0 }}>
          {selectedCandidate ? (
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'left', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {/* Candidate Info Summary Header */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--tech-orange) 0%, #1A3E62 100%)',
                  padding: '2.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: '#0B0E14',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '15px',
                    overflow: 'hidden'
                  }}>
                    {selectedCandidate.logoSeed && (selectedCandidate.logoSeed.startsWith('data:image/') || selectedCandidate.logoSeed.startsWith('http')) ? (
                      <img src={selectedCandidate.logoSeed} alt="DP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      selectedCandidate.logoSeed || '🧑‍💻'
                    )}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: 0 }}>{selectedCandidate.name}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--tech-orange)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginTop: '2px' }}>
                    ⚡ {selectedCandidate.experience}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Chat or prompt login */}
              <div style={{ marginBottom: '20px' }}>
                {token ? (
                  user?.role === 'recruiter' ? (
                    <button
                      onClick={() => alert(`Invitation sent to ${selectedCandidate.name}! They will be notified via SMS and Chat.`)}
                      className="btn btn-primary"
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px' }}
                    >
                      <MessageSquare size={16} />
                      Invite to Chat / Apply
                    </button>
                  ) : (
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                      Logged in as a candidate. Switch to Recruiter workspace to invite talent.
                    </div>
                  )
                ) : (
                  <button
                    onClick={() => setPerspective('recruiter')}
                    className="btn btn-primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px' }}
                  >
                    🔐 Login as Recruiter to Contact
                  </button>
                )}
              </div>

              {/* General Details & Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h5 style={{ color: '#fff', fontSize: '13px', fontWeight: 650, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Biography</h5>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: 1.5, margin: 0 }}>
                    {selectedCandidate.bio || 'No biography details provided.'}
                  </p>
                </div>

                {/* Contact information card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.02)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <div>✉️ Email: <strong>{selectedCandidate.email}</strong></div>
                  <div>📞 Phone: <strong>{selectedCandidate.phone || 'No phone number'}</strong></div>
                  <div>📄 Resume: <strong>{selectedCandidate.resumeName || 'No resume uploaded'}</strong></div>
                </div>

                <div>
                  <h5 style={{ color: '#fff', fontSize: '13px', fontWeight: 650, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Key Skills</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {renderSkills(selectedCandidate.skills)}
                  </div>
                </div>

                {selectedCandidate.preferences && (
                  <div>
                    <h5 style={{ color: '#fff', fontSize: '13px', fontWeight: 650, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preferences</h5>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>🏡 Job Mode: {selectedCandidate.preferences.mode?.join(', ') || 'Any'}</div>
                      <div>💼 Job Type: {selectedCandidate.preferences.type?.join(', ') || 'Any'}</div>
                      <div>💰 Salary Expectation: ₹{selectedCandidate.preferences.minSalary?.toLocaleString()}/mo</div>
                    </div>
                  </div>
                )}

                {/* Academics */}
                <div>
                  <h5 style={{ color: '#fff', fontSize: '13px', fontWeight: 650, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GraduationCap size={15} /> Education
                  </h5>
                  {selectedCandidate.academicsList && selectedCandidate.academicsList.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedCandidate.academicsList.map((ac: any, i: number) => (
                        <div key={i} style={{ fontSize: '13px', background: 'rgba(255, 255, 255, 0.01)', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                          <strong style={{ color: '#fff' }}>{ac.degree}</strong>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>{ac.school} ({ac.year}) • {ac.grade}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No education data provided.</span>
                  )}
                </div>

                {/* Work Experiences */}
                <div>
                  <h5 style={{ color: '#fff', fontSize: '13px', fontWeight: 650, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Briefcase size={14} /> Work History
                  </h5>
                  {selectedCandidate.workExperiences && selectedCandidate.workExperiences.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedCandidate.workExperiences.map((we: any, i: number) => (
                        <div key={i} style={{ fontSize: '13px', background: 'rgba(255, 255, 255, 0.01)', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                          <strong style={{ color: '#fff' }}>{we.role}</strong> at <span style={{ color: 'var(--tech-orange)' }}>{we.company}</span>
                          <div style={{ color: 'var(--text-muted)', fontSize: '11px', margin: '2px 0 4px 0' }}>{we.duration}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.4 }}>{we.description}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No work experiences provided.</span>
                  )}
                </div>

                {/* Certifications */}
                <div>
                  <h5 style={{ color: '#fff', fontSize: '13px', fontWeight: 650, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={14} /> Certifications
                  </h5>
                  {selectedCandidate.certifications && selectedCandidate.certifications.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedCandidate.certifications.map((cer: any, i: number) => (
                        <div key={i} style={{ fontSize: '13px', background: 'rgba(255, 255, 255, 0.01)', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                          <strong style={{ color: '#fff' }}>{cer.name}</strong>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>Issuer: {cer.issuer} ({cer.year})</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No certifications provided.</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="seeker-light-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: 600, border: '1px solid rgba(26, 62, 98, 0.1)', borderRadius: '12px' }}>
              Select a candidate profile to view details.
            </div>
          )}
        </aside>
      </div>

      {/* Mobile Drawer Details Overlay */}
      {selectedCandidate && (
        <div
          className={`job-detail-panel ${selectedCandidate ? 'job-detail-open' : ''} ${isClosingDetail ? 'job-detail-closing' : ''}`}
          style={{ display: 'none', textAlign: 'left' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(9, 7, 20, 0.95)' }} className="sticky-top">
              <button onClick={handleCloseDetails} className="btn-icon" style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={20} color="#fff" />
              </button>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, margin: 0 }}>{selectedCandidate.name}</h4>
                <span style={{ fontSize: '11px', color: 'var(--tech-orange)', fontWeight: 700 }}>⚡ {selectedCandidate.experience}</span>
              </div>
            </div>

            {/* Scrollable details view content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#090714' }}>
              
              {/* Action Button */}
              <div>
                {token ? (
                  user?.role === 'recruiter' ? (
                    <button
                      onClick={() => alert(`Invitation sent to ${selectedCandidate.name}!`)}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '12px' }}
                    >
                      Invite to Chat / Apply
                    </button>
                  ) : (
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px', fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center' }}>
                      Logged in as a candidate. Switch workspace to invite talent.
                    </div>
                  )
                ) : (
                  <button
                    onClick={() => setPerspective('recruiter')}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px' }}
                  >
                    🔐 Login as Recruiter to Contact
                  </button>
                )}
              </div>

              <div>
                <h5 style={{ color: '#fff', fontSize: '12.5px', fontWeight: 650, margin: '0 0 6px 0', textTransform: 'uppercase' }}>Biography</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
                  {selectedCandidate.bio || 'No biography details provided.'}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.02)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <div>✉️ Email: <strong>{selectedCandidate.email}</strong></div>
                <div>📞 Phone: <strong>{selectedCandidate.phone || 'No phone number'}</strong></div>
                <div>📄 Resume: <strong>{selectedCandidate.resumeName || 'No resume uploaded'}</strong></div>
              </div>

              <div>
                <h5 style={{ color: '#fff', fontSize: '12.5px', fontWeight: 650, margin: '0 0 8px 0', textTransform: 'uppercase' }}>Key Skills</h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {renderSkills(selectedCandidate.skills)}
                </div>
              </div>

              {selectedCandidate.preferences && (
                <div>
                  <h5 style={{ color: '#fff', fontSize: '12.5px', fontWeight: 650, margin: '0 0 8px 0', textTransform: 'uppercase' }}>Preferences</h5>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    <div>🏡 Job Mode: {selectedCandidate.preferences.mode?.join(', ') || 'Any'}</div>
                    <div>💼 Job Type: {selectedCandidate.preferences.type?.join(', ') || 'Any'}</div>
                    <div>💰 Salary Expectation: ₹{selectedCandidate.preferences.minSalary?.toLocaleString()}/mo</div>
                  </div>
                </div>
              )}

              <div>
                <h5 style={{ color: '#fff', fontSize: '12.5px', fontWeight: 650, margin: '0 0 8px 0', textTransform: 'uppercase' }}>Education</h5>
                {selectedCandidate.academicsList && selectedCandidate.academicsList.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedCandidate.academicsList.map((ac: any, i: number) => (
                      <div key={i} style={{ fontSize: '12.5px', background: 'rgba(255, 255, 255, 0.01)', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                        <strong style={{ color: '#fff' }}>{ac.degree}</strong>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '11.5px', marginTop: '2px' }}>{ac.school} ({ac.year}) • {ac.grade}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No education data provided.</span>
                )}
              </div>

              <div>
                <h5 style={{ color: '#fff', fontSize: '12.5px', fontWeight: 650, margin: '0 0 8px 0', textTransform: 'uppercase' }}>Work History</h5>
                {selectedCandidate.workExperiences && selectedCandidate.workExperiences.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedCandidate.workExperiences.map((we: any, i: number) => (
                      <div key={i} style={{ fontSize: '12.5px', background: 'rgba(255,255,255,0.01)', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                        <strong style={{ color: '#fff' }}>{we.role}</strong> at <span style={{ color: 'var(--tech-orange)' }}>{we.company}</span>
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px', margin: '2px 0 4px 0' }}>{we.duration}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '11.5px', lineHeight: 1.4 }}>{we.description}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No work experiences provided.</span>
                )}
              </div>

              <div>
                <h5 style={{ color: '#fff', fontSize: '12.5px', fontWeight: 650, margin: '0 0 8px 0', textTransform: 'uppercase' }}>Certifications</h5>
                {selectedCandidate.certifications && selectedCandidate.certifications.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedCandidate.certifications.map((cer: any, i: number) => (
                      <div key={i} style={{ fontSize: '12.5px', background: 'rgba(255, 255, 255, 0.01)', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                        <strong style={{ color: '#fff' }}>{cer.name}</strong>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '11.5px', marginTop: '2px' }}>Issuer: {cer.issuer} ({cer.year})</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No certifications provided.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};
