import React, { useEffect, useState } from 'react';

interface StatCardProps {
  iconType: 'droplet' | 'landmark' | 'transfer';
  value: number;
  label: string;
}

export const StatCard: React.FC<StatCardProps> = ({ iconType, value, label }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = value / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  const renderIcon = () => {
    switch (iconType) {
      case 'droplet':
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1255B5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <path d="M12 2.5S5 10 5 14.5a7 7 0 0 0 14 0C19 10 12 2.5 12 2.5Z" />
            <path d="M9 15a3 3 0 0 0 3 3" />
          </svg>
        );
      case 'landmark':
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1255B5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <path d="M2 10h20" />
            <path d="M12 2 2 7h20z" />
            <path d="M6 10v8" />
            <path d="M10 10v8" />
            <path d="M14 10v8" />
            <path d="M18 10v8" />
            <path d="M2 18h20" />
            <path d="M4 22h16" />
          </svg>
        );
      case 'transfer':
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1255B5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <path d="M8 7h12m0 0l-4-4m4 4l-4 4" />
            <path d="M16 17H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-card rounded-card p-6 shadow-soft border border-border flex items-center gap-5 transition-all duration-200 hover:shadow-soft-md hover:border-primary/20">
      {/* Light blue circular icon tile */}
      <div className="w-14 h-14 rounded-full bg-[#EAF2FD] flex items-center justify-center shrink-0">
        {renderIcon()}
      </div>

      {/* Numerical count & label */}
      <div className="flex flex-col">
        <span className="text-3xl font-bold text-navy tracking-tight">
          {displayValue}
        </span>
        <span className="text-sm font-medium text-text-muted mt-0.5">
          {label}
        </span>
      </div>
    </div>
  );
};
