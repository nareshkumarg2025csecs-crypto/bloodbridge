import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { Logo } from '../components/Logo';

export const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-text overflow-x-hidden relative font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Slide-over Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 240 }}
            className="fixed inset-y-0 left-0 z-50 lg:hidden"
          >
            <Sidebar onCloseMobile={() => setMobileOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col relative">
        {/* Subtle decorative blood-drop watermark in top-right corner */}
        <div className="pointer-events-none absolute top-4 right-8 opacity-[0.035] select-none z-0">
          <svg width="220" height="260" viewBox="0 0 100 120" fill="#1255B5">
            <path d="M50 5 C50 5 15 50 15 80 A35 35 0 0 0 85 80 C85 50 50 5 50 5 Z" />
          </svg>
        </div>

        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-border sticky top-0 z-20">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg text-text-muted hover:text-primary"
            aria-label="Open menu"
          >
            <img src="/icons/menu.svg" alt="" className="w-6 h-6" />
          </button>
          <Logo size="sm" />
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
            H
          </div>
        </div>

        {/* Page Content Container with 32px padding on desktop */}
        <main className="flex-1 p-6 md:p-8 max-w-[1440px] w-full mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
