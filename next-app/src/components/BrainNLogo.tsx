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
          bg: 'transparent',
          arrow: '#ffffff',
          synapse: '#ffffff'
        };
      case 'dark':
        return {
          bg: 'transparent',
          arrow: '#1A3E62',
          synapse: '#1A3E62'
        };
      case 'orange':
        return {
          bg: 'transparent',
          arrow: '#F2994A',
          synapse: '#F2994A'
        };
      case 'gradient':
      default:
        return {
          bg: 'linear-gradient(135deg, #1A3E62 0%, #2D68C4 100%)',
          arrow: '#F2994A',
          synapse: '#ffffff'
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
        background: colors.bg,
        borderRadius: size > 40 ? '12px' : '8px',
        padding: `${size * 0.15}px`,
        boxShadow: variant === 'gradient' ? '0 4px 12px rgba(26, 62, 98, 0.2)' : 'none',
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
        {/* Brain Synapse Nodes & Connections */}
        <path 
          d="M 50 30 C 45 25, 35 25, 30 35 C 25 45, 30 55, 40 60 C 42 62, 45 65, 45 70 C 45 75, 48 80, 53 80 C 58 80, 60 75, 60 70 C 60 65, 65 60, 70 55 C 75 45, 70 30, 60 25 C 55 22, 52 25, 50 30 Z" 
          stroke={colors.synapse} 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          opacity="0.85"
        />
        {/* Brain internal networks / synapses */}
        <circle cx="38" cy="40" r="4" fill={colors.synapse} />
        <circle cx="50" cy="48" r="4.5" fill={colors.synapse} />
        <circle cx="62" cy="38" r="4" fill={colors.synapse} />
        <circle cx="53" cy="65" r="4" fill={colors.synapse} />
        <path d="M 38 40 L 50 48 M 62 38 L 50 48 M 53 65 L 50 48" stroke={colors.synapse} strokeWidth="3" opacity="0.6" />

        {/* Upward Trend Line Arrow Overlay */}
        <path 
          d="M 20 75 L 42 53 L 58 68 L 85 30" 
          stroke={colors.arrow} 
          strokeWidth="9" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        {/* Arrow Head */}
        <path 
          d="M 68 30 H 85 V 47" 
          stroke={colors.arrow} 
          strokeWidth="9" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
