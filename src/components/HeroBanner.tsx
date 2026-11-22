import React from 'react';

interface HeroBannerProps {
  hospitalName?: string;
  subtitle?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  hospitalName = 'Rajalakshmi Hospital',
  subtitle = 'Together for a healthier community.',
}) => {
  return (
    <div className="relative w-full min-h-[140px] rounded-cardLg bg-gradient-to-r from-[#DCE8FB] via-[#E4EFFD] to-[#EAF1FD] border border-border/70 shadow-soft px-8 py-7 flex items-center justify-between">
      {/* Flowing soft white wave ribbons background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-cardLg">
        <svg
          className="absolute right-0 top-0 h-full w-full opacity-60 mix-blend-soft-light"
          viewBox="0 0 800 200"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M200 130 C 350 170, 520 40, 680 110 C 740 135, 780 100, 800 90 L 800 200 L 200 200 Z"
            fill="#FFFFFF"
            fillOpacity="0.85"
          />
          <path
            d="M300 20 C 450 80, 620 10, 720 50 C 760 70, 790 60, 800 50 L 800 0 L 300 0 Z"
            fill="#FFFFFF"
            fillOpacity="0.5"
          />
        </svg>

        {/* Ambient soft red glow right behind drop */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 bg-red-400/25 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Left Text Content */}
      <div className="relative z-10 max-w-xl">
        <h2 className="text-2xl sm:text-[28px] font-bold text-navy tracking-tight leading-snug">
          Welcome, {hospitalName}
        </h2>
        <p className="text-text-muted text-sm sm:text-[15px] font-normal mt-1">
          {subtitle}
        </p>
      </div>

      {/* Right 3D Glossy Red Blood Drop overflowing slightly */}
      <div className="relative z-20 shrink-0 mr-4 sm:mr-8 -my-6">
        <div className="relative w-20 h-28 sm:w-24 sm:h-32 flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(229,72,77,0.38)]">
          <svg
            viewBox="0 0 100 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full transform hover:scale-105 transition-transform duration-300"
          >
            <defs>
              <radialGradient
                id="dropGrad3D"
                cx="38%"
                cy="38%"
                r="65%"
                fx="32%"
                fy="32%"
              >
                <stop offset="0%" stopColor="#FF7B7B" />
                <stop offset="28%" stopColor="#F0484D" />
                <stop offset="68%" stopColor="#C92A2A" />
                <stop offset="100%" stopColor="#7E1115" />
              </radialGradient>

              <linearGradient id="glossHighlight" x1="0%" y1="0%" x2="60%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="bottomRim" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#FFB3B3" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FFB3B3" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path
              d="M50 6 C50 6 15 52 15 78 A35 35 0 0 0 85 78 C85 52 50 6 50 6 Z"
              fill="url(#dropGrad3D)"
            />

            <path
              d="M22 80 C22 95 36 106 50 106 C64 106 78 95 78 80 C78 66 64 48 50 28 C36 48 22 66 22 80 Z"
              fill="url(#bottomRim)"
              opacity="0.35"
            />

            <ellipse
              cx="36"
              cy="58"
              rx="11"
              ry="21"
              transform="rotate(-26 36 58)"
              fill="url(#glossHighlight)"
              opacity="0.85"
            />

            <circle cx="62" cy="74" r="3.2" fill="#FFFFFF" opacity="0.45" />
          </svg>
        </div>
      </div>
    </div>
  );
};
