import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Compass, ShieldCheck } from 'lucide-react';
import type { CandidateProfile } from '../context/AppContext';

interface OnboardingModalProps {
  profile: CandidateProfile;
  onSaveProfile: React.Dispatch<React.SetStateAction<CandidateProfile>>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ profile: _profile, onSaveProfile }) => {
  const [step, setStep] = useState(1);

  // Local preferences states
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState(60000);
  const [experience, setExperience] = useState<'Entry-level' | 'Mid-level' | 'Senior-level'>('Entry-level');

  const popularSkills = [
    'React', 'TypeScript', 'Next.js', 'CSS/CSS Grid', 'Node.js', 
    'UI Design', 'Figma', 'Prototyping', 'SEO', 'Copywriting', 
    'Growth Marketing', 'Product Management', 'SQL', 'GraphQL'
  ];

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
      backgroundColor: 'rgba(5, 3, 10, 0.85)',
      backdropFilter: 'blur(16px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-panel animate-glow" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background glow orb */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          left: '-60px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.15)',
          filter: 'blur(35px)',
          pointerEvents: 'none'
        }}></div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3].map(s => (
              <div 
                key={s} 
                style={{
                  width: '32px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: s <= step ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                  boxShadow: s <= step ? '0 0 8px var(--primary)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              ></div>
            ))}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Step {step} of 3</span>
        </div>

        {/* STEP 1: WORK MODES & TYPES */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <span className="badge badge-primary" style={{ marginBottom: '10px' }}>
                <Sparkles size={12} style={{ marginRight: '6px' }} />
                Career Matcher
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>
                Setup Your Workspace Vibe
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
                Tell us where and how you work best. We'll prioritize these in your search results.
              </p>
            </div>

            {/* Mode selector */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px' }}>
                Preferred Work Modes (select all that apply)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {['Remote', 'Hybrid', 'On-site'].map(mode => {
                  const active = selectedModes.includes(mode);
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => toggleMode(mode)}
                      className="glass-panel"
                      style={{
                        padding: '16px 8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: active ? '1px solid var(--border-color-active)' : '1px solid var(--border-color)',
                        background: active ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        color: active ? '#fff' : 'var(--text-secondary)',
                        textAlign: 'center',
                        transition: 'all 0.2s',
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
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px' }}>
                Job Type Preference (select all that apply)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {['Full-time', 'Part-time', 'Internship', 'Contract'].map(type => {
                  const active = selectedTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleType(type)}
                      className="glass-panel"
                      style={{
                        padding: '14px 8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: active ? '1px solid var(--border-color-active)' : '1px solid var(--border-color)',
                        background: active ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        color: active ? '#fff' : 'var(--text-secondary)',
                        textAlign: 'center',
                        transition: 'all 0.2s',
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
            <div style={{ marginBottom: '24px' }}>
              <span className="badge badge-secondary" style={{ marginBottom: '10px' }}>
                <Compass size={12} style={{ marginRight: '6px' }} />
                Skills Portfolio
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>
                What are your superpowers?
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
                Select the core skills you excel at. We'll match jobs that mention these technologies or concepts.
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '8px 4px',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              background: 'rgba(0, 0, 0, 0.15)'
            }}>
              {popularSkills.map(skill => {
                const active = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className="badge"
                    style={{
                      cursor: 'pointer',
                      border: active ? '1px solid var(--secondary)' : '1px solid var(--border-color)',
                      background: active ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      color: active ? '#fff' : 'var(--text-secondary)',
                      padding: '8px 14px',
                      fontSize: '12px',
                      borderRadius: '20px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {active && <Check size={10} style={{ marginRight: '4px' }} />}
                    {skill}
                  </button>
                );
              })}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '12px', textAlign: 'right' }}>
              Selected: {selectedSkills.length} skills
            </p>
          </div>
        )}

        {/* STEP 3: COMPENSATION & EXPERIENCE */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <span className="badge badge-success" style={{ marginBottom: '10px' }}>
                <ShieldCheck size={12} style={{ marginRight: '6px' }} />
                Final Step
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>
                Expectations & Level
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
                Finalize your experience tier and target minimum compensation to filter out low-matching listings.
              </p>
            </div>

            {/* Experience Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Experience Tier</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value as any)}
                className="glass-input"
                style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '10px' }}
              >
                <option value="Entry-level">Entry-level</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior-level">Senior-level</option>
              </select>
            </div>

            {/* Salary slider / input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Minimum Target Salary</label>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--success)' }}>
                  ${minSalary.toLocaleString()} / yr
                </span>
              </div>
              <input
                type="range"
                min="30000"
                max="180000"
                step="5000"
                value={minSalary}
                onChange={(e) => setMinSalary(Number(e.target.value))}
                style={{
                  accentColor: 'var(--success)',
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderRadius: '3px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                <span>$30k</span>
                <span>$100k</span>
                <span>$180k</span>
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
          borderTop: '1px solid var(--border-color)',
          paddingTop: '24px'
        }}>
          {step > 1 ? (
            <button 
              onClick={() => setStep(prev => prev - 1)} 
              className="btn btn-outline"
              style={{ padding: '12px 20px' }}
            >
              Back
            </button>
          ) : (
            <div></div>
          )}

          <button 
            onClick={handleNext} 
            className="btn btn-primary"
            style={{
              padding: '12px 28px',
              background: step === 3 ? 'var(--secondary-gradient)' : 'var(--primary-gradient)',
              boxShadow: step === 3 ? '0 4px 15px -3px rgba(6, 182, 212, 0.4)' : '0 4px 15px -3px rgba(99, 102, 241, 0.4)'
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
