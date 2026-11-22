import React from 'react';

interface LogoProps {
  variant?: 'default' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
  showText = true,
}) => {
  const isWhite = variant === 'white';

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl lg:text-[46px]',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Exact BloodBridge Droplet Logo Mark */}
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSizes[size]} flex-shrink-0`}
      >
        {/* Outer droplet contour */}
        <path
          d="M18 3.5 C18 3.5 7.5 15.5 7.5 23 C7.5 28.8 12.2 33.5 18 33.5 C23.8 33.5 28.5 28.8 28.5 23 C28.5 15.5 18 3.5 18 3.5 Z"
          stroke={isWhite ? '#FFFFFF' : '#1255B5'}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner stylized droplet wave */}
        <path
          d="M18 12.5 C18 12.5 13.5 18 13.5 22 C13.5 24.5 15.5 26.5 18 26.5 C20.5 26.5 22.5 24.5 22.5 22 C22.5 18 18 12.5 18 12.5 Z"
          fill={isWhite ? '#FFFFFF' : '#1255B5'}
        />
      </svg>

      {showText && (
        <span
          className={`font-semibold tracking-tight ${textSizes[size]} ${
            isWhite ? 'text-white' : 'text-navy'
          }`}
          style={{ letterSpacing: '-0.025em' }}
        >
          BloodBridge
        </span>
      )}
    </div>
  );
};
