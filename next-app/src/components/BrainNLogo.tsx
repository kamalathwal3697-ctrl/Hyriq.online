import React from 'react';

interface BrainNLogoProps {
  size?: number;
  className?: string;
  variant?: 'light' | 'dark' | 'orange' | 'gradient';
  style?: React.CSSProperties;
}

export const BrainNLogo: React.FC<BrainNLogoProps> = ({
  size = 32,
  className = '',
  variant = 'gradient',
  style = {}
}) => {
  const getColors = () => {
    switch (variant) {
      case 'light':
        return {
          stroke1: '#ffffff',
          stroke2: '#ffffff',
          bridge: '#ffffff'
        };
      case 'dark':
        return {
          stroke1: '#0F172A',
          stroke2: '#475569',
          bridge: '#0F172A'
        };
      case 'orange':
        return {
          stroke1: '#F2994A',
          stroke2: '#F2994A',
          bridge: '#F2994A'
        };
      case 'gradient':
      default:
        return {
          stroke1: 'url(#blue-cyan-grad)',
          stroke2: 'url(#blue-cyan-grad)',
          bridge: 'url(#blue-cyan-grad)'
        };
    }
  };

  const colors = getColors();

  return (
    <div 
      className={className} 
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style
      }}
    >
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id="blue-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>

        {/* Left vertical block of the isometric H logo */}
        <path 
          d="M 18 70 L 18 35 L 43 20 L 43 55 Z" 
          stroke={colors.stroke1} 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        {/* Inner detail line of the left vertical block */}
        <path 
          d="M 18 52.5 L 43 37.5" 
          stroke={colors.stroke1} 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />

        {/* Horizontal bridge connecting left and right blocks */}
        <path 
          d="M 43 55 L 57 45" 
          stroke={colors.bridge} 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />

        {/* Right vertical block of the isometric H logo */}
        <path 
          d="M 57 80 L 57 45 L 82 30 L 82 65 Z" 
          stroke={colors.stroke2} 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        {/* Inner detail line of the right vertical block */}
        <path 
          d="M 57 62.5 L 82 47.5" 
          stroke={colors.stroke2} 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

