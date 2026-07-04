import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface TourStep {
  targetId?: string;
  targetClass?: string;
  title: string;
  content: string;
  placement: 'bottom' | 'top' | 'center';
}

interface AppTourProps {
  onComplete: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const AppTour: React.FC<AppTourProps> = ({ onComplete, activeTab, setActiveTab }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const steps: TourStep[] = [
    {
      targetId: 'dashboard-search-input',
      title: '🔍 Search Jobs',
      content: 'Quickly find jobs by typing titles, skills, or locations (e.g. Punjab regions) in this unified search bar.',
      placement: 'bottom'
    },
    {
      targetClass: 'seeker-light-card',
      title: '⚡ Compact Filters',
      content: 'Filter jobs instantly by Category, Work Mode (Remote/Hybrid), Job Type, or Experience levels in one single line.',
      placement: 'bottom'
    },
    {
      title: '🏛️ Govt Jobs',
      content: 'Switch to Govt Jobs to explore secure public sector careers in Punjab and all India.',
      placement: 'center'
    },
    {
      title: '👤 Live CV & Profile Builder',
      content: 'Build a premium interactive resume. Upload your custom DP avatar, fill in Academics, Work History, and Certifications.',
      placement: 'center'
    },
    {
      title: '⚙️ App Settings',
      content: 'Manage your Account Switcher (Job Seeker/Recruiter), Notifications, Visibility, and Language preferences (English/Punjabi).',
      placement: 'center'
    }
  ];

  const step = steps[currentStep];

  useEffect(() => {
    // Automatically change tabs to match tour context!
    if (currentStep === 2 && activeTab !== 'govt') {
      setActiveTab('govt');
    } else if (currentStep === 3 && activeTab !== 'profile') {
      setActiveTab('profile');
    } else if (currentStep === 4 && activeTab !== 'settings') {
      setActiveTab('settings');
    } else if (currentStep < 2 && activeTab !== 'explore') {
      setActiveTab('explore');
    }
  }, [currentStep]);

  useEffect(() => {
    const updateCoords = () => {
      let element: HTMLElement | null = null;
      if (step.targetId) {
        element = document.getElementById(step.targetId);
      } else if (step.targetClass) {
        element = document.querySelector(`.${step.targetClass}`) as HTMLElement;
      }

      if (element) {
        const rect = element.getBoundingClientRect();
        // Fallback for mobile viewport bounds checks
        const topPos = rect.top + window.scrollY;
        const leftPos = rect.left + window.scrollX;
        setCoords({
          top: topPos,
          left: leftPos,
          width: rect.width,
          height: rect.height
        });
      } else {
        setCoords(null);
      }
    };

    // Delay slightly to allow tab changes to render elements
    const timer = setTimeout(updateCoords, 350);
    window.addEventListener('resize', updateCoords);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCoords);
    };
  }, [currentStep, activeTab]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('hyriq_tour_completed', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('hyriq_tour_completed', 'true');
    setActiveTab('explore');
    onComplete();
  };

  // Determine top position for the card
  let cardTop = '50%';
  let cardLeft = '50%';
  let cardTransform = 'translate(-50%, -50%)';
  let cardPosition: 'fixed' | 'absolute' = 'fixed';

  if (coords) {
    cardPosition = 'absolute';
    cardTransform = 'none';
    const isMobile = window.innerWidth <= 768;
    
    // Position below the element, with fallback bounds
    if (isMobile) {
      cardTop = `${coords.top + coords.height + 12}px`;
      cardLeft = '5%';
    } else {
      cardTop = `${coords.top + coords.height + 16}px`;
      cardLeft = `${Math.min(window.innerWidth - 380, Math.max(16, coords.left + (coords.width - 360) / 2))}px`;
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 3, 10, 0.75)',
      zIndex: 3000,
      pointerEvents: 'auto',
      display: 'block',
      overflowY: 'auto'
    }}>
      {/* Target Highlight Spotlight Mask */}
      {coords && (
        <div style={{
          position: 'absolute',
          top: coords.top - 8,
          left: coords.left - 8,
          width: coords.width + 16,
          height: coords.height + 16,
          borderRadius: '12px',
          boxShadow: '0 0 0 9999px rgba(5, 3, 10, 0.75), 0 0 15px var(--tech-orange)',
          border: '2px solid var(--tech-orange)',
          pointerEvents: 'none',
          transition: 'all 0.3s'
        }} />
      )}

      {/* Floating Card */}
      <div 
        className="glass-panel animate-glow" 
        style={{
          width: coords ? (window.innerWidth <= 768 ? '90%' : '360px') : '90%',
          maxWidth: '360px',
          padding: '24px',
          background: '#0B0E14',
          border: '1.5px solid var(--tech-orange)',
          boxShadow: '0 8px 32px rgba(242,153,74,0.15)',
          borderRadius: '20px',
          position: cardPosition,
          top: cardTop,
          left: cardLeft,
          transform: cardTransform,
          zIndex: 3001,
          transition: 'all 0.3s'
        }}
      >
        {/* Progress bar */}
        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '16px', overflow: 'hidden' }}>
          <div style={{ width: `${((currentStep + 1) / steps.length) * 100}%`, height: '100%', background: 'var(--tech-orange)', transition: 'width 0.3s' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <HelpCircle size={18} color="var(--tech-orange)" />
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--tech-orange)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            App Walkthrough ({currentStep + 1}/{steps.length})
          </span>
        </div>

        <h4 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
          {step.title}
        </h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', marginBottom: '20px' }}>
          {step.content}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
          <button 
            onClick={handleSkip} 
            className="btn btn-outline" 
            style={{ padding: '8px 16px', fontSize: '12px', flex: 1, borderColor: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}
          >
            Skip
          </button>
          <button 
            onClick={handleNext} 
            className="btn" 
            style={{ padding: '8px 16px', fontSize: '12px', flex: 1, background: 'var(--tech-orange)', color: '#fff', fontWeight: 700 }}
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};
