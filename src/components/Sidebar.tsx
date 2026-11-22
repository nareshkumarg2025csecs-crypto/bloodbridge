import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { authService } from '../services/authService';

interface NavItem {
  name: string;
  path: string;
  iconPath: string;
}

const navItems: NavItem[] = [
  { name: 'Home', path: '/home', iconPath: '/icons/home.svg' },
  { name: 'Inventory', path: '/inventory', iconPath: '/icons/inventory.svg' },
  { name: 'Requests', path: '/requests', iconPath: '/icons/requests.svg' },
  { name: 'Chat', path: '/chat', iconPath: '/icons/chat.svg' },
  { name: 'Alerts', path: '/alerts', iconPath: '/icons/alerts.svg' },
  { name: 'Profile', path: '/profile', iconPath: '/icons/profile.svg' },
];

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <aside className="w-[240px] h-screen bg-card border-r border-border flex flex-col justify-between py-6 px-4 select-none shrink-0">
      {/* Top Section: Logo & Nav */}
      <div className="flex flex-col gap-8">
        {/* Brand Logo */}
        <div className="px-3 pt-1">
          <Logo size="md" />
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-[15px] transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-soft font-semibold'
                    : 'text-text-muted hover:text-primary hover:bg-primary-50/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <img
                    src={item.iconPath}
                    alt=""
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'brightness-0 invert' : 'opacity-70 group-hover:opacity-100'
                    }`}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Section: Logout */}
      <div className="pt-4 border-t border-border/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[15px] font-medium text-text-muted hover:text-alert hover:bg-alert-bg/60 transition-all duration-200"
        >
          <img
            src="/icons/logout.svg"
            alt=""
            className="w-5 h-5 opacity-70 transition-transform duration-200 group-hover:translate-x-0.5"
          />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
