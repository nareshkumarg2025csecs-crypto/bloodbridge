import React from 'react';
import { Link } from 'react-router-dom';

interface ExpiryAlertCardProps {
  bloodType: string;
  units: number;
  days: number;
}

export const ExpiryAlertCard: React.FC<ExpiryAlertCardProps> = ({
  bloodType = 'O+',
  units = 2,
  days = 2,
}) => {
  return (
    <div className="w-full bg-card rounded-card p-5 px-6 border border-border shadow-soft flex items-center justify-between transition-all duration-200 hover:shadow-soft-md">
      {/* Left side: Icon + Alert Text */}
      <div className="flex items-center gap-4">
        {/* Pulse / Activity circular tile */}
        <div className="w-12 h-12 rounded-full bg-[#EBF3FE] flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1255B5"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>

        {/* Text info */}
        <div>
          <h4 className="text-base font-semibold text-navy">Expiry Alert</h4>
          <p className="text-sm text-text-muted mt-0.5">
            {units} units of {bloodType} will expire in {days} days
          </p>
        </div>
      </div>

      {/* Right side: View Details link */}
      <Link
        to="/alerts"
        className="text-[15px] font-semibold text-primary hover:text-primary-dark flex items-center gap-1 group transition-colors"
      >
        <span>View Details</span>
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </Link>
    </div>
  );
};
