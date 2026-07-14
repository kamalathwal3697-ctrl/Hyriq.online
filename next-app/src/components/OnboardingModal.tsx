import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Compass, ShieldCheck, Plus, X } from 'lucide-react';
import type { CandidateProfile } from '../context/AppContext';

interface OnboardingModalProps {
  profile: CandidateProfile;
  onSaveProfile: React.Dispatch<React.SetStateAction<CandidateProfile>>;
}

const generalSkills = [
  'Communication', 'Teamwork & Collaboration', 'Problem Solving',
  'Time Management', 'Leadership', 'Customer Service',
  'Project Management', 'Adaptability', 'Organization',
  'Critical Thinking', 'Public Speaking', 'Negotiation',
  'Conflict Resolution', 'Attention to Detail'
];

const positionSkillsMap: Record<string, string[]> = {
  'Software Engineering': ['React', 'TypeScript', 'Node.js', 'Python', 'SQL', 'Git', 'API Development', 'System Design'],
  'Design & UI/UX': ['Figma', 'UI Design', 'User Research', 'Wireframing', 'Prototyping', 'Adobe Photoshop', 'Graphic Design'],
  'Product Management': ['Product Roadmap', 'Agile/Scrum', 'User Stories', 'Jira', 'Resource Planning', 'Stakeholder Management'],
  'Marketing & Content': ['SEO', 'Copywriting', 'Social Media Marketing', 'Content Strategy', 'Email Campaigns', 'Google Analytics'],
  'Sales & Business Dev': ['Lead Generation', 'Cold Outreach', 'Negotiation', 'CRM Tools', 'Client Relations', 'Sales Pitching'],
  'Customer Support & Ops': ['Customer Service', 'Zendesk', 'Conflict Resolution', 'Process Optimization', 'Data Entry', 'Microsoft Excel'],
  'Human Resources (HR)': ['Talent Acquisition', 'Employee Onboarding', 'Performance Management', 'HR Policies', 'Conflict Mediation'],
  'Data & Analytics': ['Data Visualization', 'SQL', 'Excel/Sheets', 'Python/R', 'Tableau / PowerBI', 'Statistical Analysis']
};

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ profile: _profile, onSaveProfile }) => {
  const [step, setStep] = useState(1);

  // Local preferences states
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState(15000);
  const [experience, setExperience] = useState<'Entry-level' | 'Mid-level' | 'Senior-level'>('Entry-level');

  const [customSkillInput, setCustomSkillInput] = useState('');
  const [targetPosition, setTargetPosition] = useState<string>('Software Engineering');

  const toggleMode = (mode: string) => {
    setSelectedModes(prev => 
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (!selectedSkills.includes(trimmed)) {
      setSelectedSkills(prev => [...prev, trimmed]);
    }
    setCustomSkillInput('');
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      // Save onboarding preferences to context profile state (which automatically syncs to backend)
      onSaveProfile(prev => ({
        ...prev,
        skills: selectedSkills.length > 0 ? selectedSkills : prev.skills,
        experience,
        onboardingCompleted: true,
        preferences: {
          ...prev.preferences,
          type: selectedTypes.length > 0 ? selectedTypes : ['Full-time'],
          mode: selectedModes.length > 0 ? selectedModes : ['Remote'],
          minSalary: minSalary || 50000,
          experience
        }
      }));
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(26, 62, 98, 0.55)',
      backdropFilter: 'blur(16px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="seeker-light-card animate-glow" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '24px'
      }}>
        {/* Background glow orb */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          left: '-60px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'rgba(242, 153, 74, 0.12)',
          filter: 'blur(35px)',
          pointerEvents: 'none'
        }}></div>

        {/* Step Indicator / Profile Completion Progress Bar */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--corporate-blue)' }}>Profile Completion</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--tech-orange)' }}>
              {step === 1 ? '30%' : step === 2 ? '65%' : '100%'}
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: step === 1 ? '30%' : step === 2 ? '65%' : '100%',
              height: '100%',
              backgroundColor: 'var(--tech-orange)',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}></div>
          </div>
        </div>

        {/* STEP 1: WORK MODES & TYPES */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <span className="badge seeker-tag-orange" style={{ marginBottom: '10px' }}>
                <Sparkles size={12} style={{ marginRight: '6px' }} />
                Career Matcher
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--corporate-blue)', fontFamily: 'Outfit' }}>
                Setup Your Workspace Vibe
              </h3>
              <p style={{ color: '#475569', fontSize: '13px', marginTop: '6px' }}>
                Tell us where and how you work best. We'll prioritize these in your search results.
              </p>
            </div>

            {/* Mode selector */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--corporate-blue)', display: 'block', marginBottom: '12px' }}>
                Preferred Work Modes
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {['Remote', 'Hybrid', 'On-site'].map(mode => {
                  const active = selectedModes.includes(mode);
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => toggleMode(mode)}
                      className={`seeker-tag ${active ? 'active' : ''}`}
                      style={{
                        padding: '16px 8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'center',
                        borderRadius: '12px'
                      }}
                    >
                      {mode === 'Remote' && '🏡 '}
                      {mode === 'Hybrid' && '🏢 '}
                      {mode === 'On-site' && '📍 '}
                      {mode}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Type selector */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--corporate-blue)', display: 'block', marginBottom: '12px' }}>
                Job Type Preference
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {['Full-time', 'Part-time', 'Internship', 'Contract'].map(type => {
                  const active = selectedTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleType(type)}
                      className={`seeker-tag ${active ? 'active' : ''}`}
                      style={{
                        padding: '14px 8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'center',
                        borderRadius: '12px'
                      }}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE SKILLS */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <span className="badge seeker-tag-blue" style={{ marginBottom: '10px' }}>
                <Compass size={12} style={{ marginRight: '6px' }} />
                Skills Portfolio
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--corporate-blue)', fontFamily: 'Outfit' }}>
                What are your superpowers?
              </h3>
              <p style={{ color: '#475569', fontSize: '13px', marginTop: '6px' }}>
                Select the core skills you excel at. We'll match jobs that mention these technologies or concepts.
              </p>
            </div>

            {/* Target Position Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--corporate-blue)' }}>
                Target Position / Industry
              </label>
              <select
                value={targetPosition}
                onChange={(e) => setTargetPosition(e.target.value)}
                className="seeker-light-input"
                style={{ width: '100%', padding: '10px 12px', fontSize: '13.5px' }}
              >
                {Object.keys(positionSkillsMap).map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            {/* Scrollable list for Recommended and Universal Skills */}
            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              padding: '12px',
              border: '1.5px solid #D2D9E2',
              borderRadius: '12px',
              background: '#F8FAFC',
              marginBottom: '16px'
            }}>
              {/* Position-based skills */}
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Recommended for {targetPosition}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {positionSkillsMap[targetPosition]?.map(skill => {
                    const active = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`badge seeker-tag ${active ? 'active' : ''}`}
                        style={{
                          cursor: 'pointer',
                          padding: '6px 12px',
                          fontSize: '11.5px',
                          borderRadius: '20px'
                        }}
                      >
                        {active && <Check size={10} style={{ marginRight: '4px' }} />}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Universal/General skills */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Universal Skills
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {generalSkills.map(skill => {
                    const active = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`badge seeker-tag ${active ? 'active' : ''}`}
                        style={{
                          cursor: 'pointer',
                          padding: '6px 12px',
                          fontSize: '11.5px',
                          borderRadius: '20px'
                        }}
                      >
                        {active && <Check size={10} style={{ marginRight: '4px' }} />}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Custom Skills Box */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSkill();
                  }
                }}
                placeholder="Add a custom skill (e.g. Photoshop, Hindi)..."
                className="seeker-light-input"
                style={{ flex: 1, padding: '10px 14px', fontSize: '13px' }}
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="btn btn-seeker-active"
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {/* Selected Skills Chips Summary */}
            {selectedSkills.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--corporate-blue)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Your Selected Skills ({selectedSkills.length})
                </span>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  maxHeight: '90px',
                  overflowY: 'auto',
                  padding: '8px',
                  background: 'rgba(242, 153, 74, 0.04)',
                  border: '1px dashed var(--tech-orange)',
                  borderRadius: '8px'
                }}>
                  {selectedSkills.map(skill => (
                    <span
                      key={skill}
                      className="badge seeker-tag active"
                      style={{
                        fontSize: '11px',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'inherit',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          marginLeft: '2px'
                        }}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <p style={{ color: '#64748b', fontSize: '11px', marginTop: '12px', textAlign: 'right', fontWeight: 600 }}>
              Selected: {selectedSkills.length} skills
            </p>
          </div>
        )}

        {/* STEP 3: COMPENSATION & EXPERIENCE */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <span className="badge seeker-tag-orange" style={{ marginBottom: '10px' }}>
                <ShieldCheck size={12} style={{ marginRight: '6px' }} />
                Final Step
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--corporate-blue)', fontFamily: 'Outfit' }}>
                Expectations & Level
              </h3>
              <p style={{ color: '#475569', fontSize: '13px', marginTop: '6px' }}>
                Finalize your experience tier and target minimum compensation to filter out low-matching listings.
              </p>
            </div>

            {/* Experience Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--corporate-blue)' }}>Experience Tier</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value as any)}
                className="seeker-light-input"
                style={{ width: '100%', padding: '12px', fontSize: '14px' }}
              >
                <option value="Entry-level">Entry-level</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior-level">Senior-level</option>
              </select>
            </div>

            {/* Salary slider / input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--corporate-blue)' }}>Minimum Target Salary</label>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--tech-orange)' }}>
                  ₹{minSalary.toLocaleString()} / mo
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="100000"
                step="2000"
                value={minSalary}
                onChange={(e) => setMinSalary(Number(e.target.value))}
                style={{
                  accentColor: 'var(--tech-orange)',
                  width: '100%',
                  height: '6px',
                  backgroundColor: '#E2E8F0',
                  borderRadius: '3px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', fontWeight: 600 }}>
                <span>₹10k</span>
                <span>₹50k</span>
                <span>₹100k</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '40px',
          borderTop: '1px solid #E2E8F0',
          paddingTop: '24px'
        }}>
          {step > 1 ? (
            <button 
              onClick={() => setStep(prev => prev - 1)} 
              className="btn btn-outline"
              style={{ padding: '12px 20px', borderColor: '#Cbd5e1', color: 'var(--corporate-blue)' }}
            >
              Back
            </button>
          ) : (
            <div></div>
          )}

          <button 
            onClick={handleNext} 
            className="btn btn-seeker-active"
            style={{
              padding: '12px 28px',
              borderRadius: '12px'
            }}
          >
            {step === 3 ? (
              <>
                Unlock My Feed 🚀
              </>
            ) : (
              <>
                Next <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
