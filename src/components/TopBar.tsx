import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface TopBarProps {
  onOpenMobileMenu?: () => void;
  title?: string;
  titleBadge?: React.ReactNode;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenMobileMenu,
  title,
  titleBadge,
  subtitle,
  actionButton,
}) => {
  const navigate = useNavigate();
  const session = authService.getSession();
  const initial = session?.name ? session.name.charAt(0).toUpperCase() : 'H';

  return (
    <header className="w-full flex items-center justify-between pb-4 sm:pb-6">
      {/* Mobile Menu Button + Page Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-text-muted hover:text-primary hover:bg-white border border-border"
            aria-label="Open sidebar"
          >
            <img src="/icons/menu.svg" alt="" className="w-5 h-5" />
          </button>
        )}

        {title && (
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-[26px] font-bold text-navy tracking-tight">{title}</h1>
              {titleBadge}
            </div>
            {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Right side items: Action Button + Bell + Dark Navy 'H' Avatar */}
      <div className="flex items-center gap-3 sm:gap-4 ml-auto">
        {actionButton}

        {/* Notification Bell */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/40 hover:shadow-soft transition-all duration-200 cursor-pointer"
          aria-label="Notifications"
        >
          <img src="/icons/alerts.svg" alt="" className="w-5 h-5 opacity-80" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-alert ring-2 ring-white"></span>
        </button>

        {/* Hospital Avatar - Dark Navy circle with user/institution initial */}
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white font-semibold text-base shadow-soft hover:opacity-95 transition-opacity cursor-pointer"
          aria-label="Hospital Profile"
          title={session?.name || 'User Profile'}
        >
          {initial}
        </button>
      </div>
    </header>
  );
};
