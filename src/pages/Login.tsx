import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { authService } from '../services/authService';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('rajalakshmi@bloodbridge.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide both email address and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.login(email, password);
      navigate('/home');
    } catch {
      setError('Unable to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans overflow-hidden">
      {/* ================= LEFT PANEL (~58% on desktop) ================= */}
      <div className="relative w-full lg:w-[58%] min-h-[560px] lg:min-h-screen bg-gradient-to-br from-[#102B55] via-[#11386d] to-[#1255B5] text-white p-8 sm:p-14 lg:p-20 flex flex-col justify-between overflow-hidden">
        
        {/* Photorealistic IV Blood Bag background graphic in upper right quadrant */}
        <div className="absolute right-6 sm:right-16 top-6 sm:top-14 w-52 sm:w-64 h-80 sm:h-96 pointer-events-none select-none opacity-30 mix-blend-screen">
          <svg
            viewBox="0 0 200 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Top suspension loop */}
            <path
              d="M75 36 V 16 C75 10 82 6 90 6 H110 C118 6 125 10 125 16 V 36"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <ellipse cx="100" cy="18" rx="8" ry="5" fill="#FFFFFF" fillOpacity="0.8" />

            {/* Bag Outer Contour */}
            <rect
              x="26"
              y="34"
              width="148"
              height="230"
              rx="24"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              fill="#102B55"
              fillOpacity="0.45"
            />

            {/* Red Blood Fluid Fill (~70% full) */}
            <path
              d="M30 100 C 65 106, 135 94, 170 102 V 240 C 170 254, 158 260, 144 260 H56 C 42 260, 30 254, 30 240 Z"
              fill="#D92D32"
              fillOpacity="0.75"
            />
            <path
              d="M30 128 C 70 134, 130 122, 170 130 V 240 C 170 254, 158 260, 144 260 H56 C 42 260, 30 254, 30 240 Z"
              fill="#991B1E"
              fillOpacity="0.6"
            />

            {/* Subtle liquid meniscus glare */}
            <ellipse cx="100" cy="102" rx="68" ry="5" fill="#FFFFFF" fillOpacity="0.25" />

            {/* White measurement graduation lines */}
            <line x1="44" y1="120" x2="68" y2="120" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.5" />
            <line x1="44" y1="150" x2="80" y2="150" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.5" />
            <line x1="44" y1="180" x2="68" y2="180" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.5" />
            <line x1="44" y1="210" x2="84" y2="210" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.5" />

            {/* Bottom outlet ports & IV tubing */}
            <rect x="52" y="264" width="22" height="12" rx="3" fill="#FFFFFF" fillOpacity="0.6" />
            <rect x="88" y="264" width="24" height="16" rx="4" fill="#FFFFFF" fillOpacity="0.75" />
            <rect x="126" y="264" width="22" height="12" rx="3" fill="#FFFFFF" fillOpacity="0.6" />

            <path
              d="M100 280 C 100 298, 124 304, 124 324"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
              strokeOpacity="0.6"
            />
          </svg>
        </div>

        {/* Smooth Organic Curved Edge into the white panel (desktop only) */}
        <div className="hidden lg:block absolute -right-0.5 top-0 bottom-0 w-28 xl:w-36 h-full pointer-events-none z-20">
          <svg
            viewBox="0 0 100 800"
            preserveAspectRatio="none"
            className="w-full h-full fill-white"
          >
            <path d="M 0 0 C 60 220, 10 480, 100 800 L 100 0 Z" />
          </svg>
        </div>

        {/* Top/Center Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-xl my-auto">
          {/* Large White Logo */}
          <div className="mb-3">
            <Logo variant="white" size="xl" />
          </div>

          {/* Tagline */}
          <h2 className="text-xl sm:text-[26px] font-medium text-white tracking-tight mt-1 mb-6">
            Connect. Coordinate. Save Lives.
          </h2>

          {/* Faint ECG heartbeat line decoration on the left */}
          <div className="my-4 w-full max-w-sm h-8 flex items-center opacity-45">
            <svg
              viewBox="0 0 280 40"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full"
            >
              <path d="M0 20 H50 L62 10 L72 30 L82 8 L94 28 L104 18 L112 20 H160 L172 6 L184 34 L196 12 L206 24 L214 20 H280" />
            </svg>
          </div>

          {/* Subtitle text */}
          <p className="text-white/85 text-sm sm:text-base font-normal max-w-md leading-relaxed mt-2">
            Real-time blood bank coordination<br className="hidden sm:inline" />
            for a healthier tomorrow.
          </p>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 grid grid-cols-3 gap-6 pt-10 border-t border-white/15 max-w-lg">
          {/* Feature 1: Instant Matching */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2.5">
            <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-sm shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-[13px] font-semibold text-white leading-tight">Instant</p>
              <p className="text-xs sm:text-[13px] font-semibold text-white leading-tight">Matching</p>
            </div>
          </div>

          {/* Feature 2: Secure Communication */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2.5">
            <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-sm shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-[13px] font-semibold text-white leading-tight">Secure</p>
              <p className="text-xs sm:text-[13px] font-semibold text-white leading-tight">Communication</p>
            </div>
          </div>

          {/* Feature 3: Seamless Transfers */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2.5">
            <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-sm shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.6-4.6a2 2 0 0 0 0-2.8l-3.2-3.2a2 2 0 0 0-2.8 0L7 14.4" />
                <path d="m13 7-2-2a1 1 0 0 0-1.4 0L5 9.6a2 2 0 0 0 0 2.8l3.2 3.2a2 2 0 0 0 2.8 0L17 9.6" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-[13px] font-semibold text-white leading-tight">Seamless</p>
              <p className="text-xs sm:text-[13px] font-semibold text-white leading-tight">Transfers</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL (Pure White, Form Area) ================= */}
      <div className="relative flex-1 bg-white flex flex-col justify-center items-center p-8 sm:p-14 lg:p-20">
        {/* Soft Faint Droplet Watermark in top-right */}
        <div className="pointer-events-none absolute top-6 right-8 opacity-[0.06] select-none">
          <svg width="200" height="240" viewBox="0 0 100 120" fill="#1255B5">
            <path d="M50 5 C50 5 15 50 15 80 A35 35 0 0 0 85 80 C85 50 50 5 50 5 Z" />
          </svg>
        </div>

        {/* Clean Centered Form (max-width 420px, no border/box, exactly like mockup) */}
        <div className="w-full max-w-[420px] relative z-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-navy tracking-tight">
              Welcome Back
            </h1>
            <p className="text-text-muted text-sm mt-1.5 font-normal">
              Sign in to coordinate blood resources
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-btn bg-alert-bg text-alert text-xs font-medium border border-alert/20">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <img src="/icons/mail.svg" alt="" className="w-5 h-5 opacity-60" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full h-12 pl-11 pr-4 bg-white border border-border rounded-input text-text text-sm placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-none"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <img src="/icons/lock.svg" alt="" className="w-5 h-5 opacity-60" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-12 pl-11 pr-11 bg-white border border-border rounded-input text-text text-sm placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-navy transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                )}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-btn bg-primary hover:bg-primary-dark text-white font-medium text-sm tracking-normal shadow-soft flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-soft-md disabled:opacity-70 mt-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="text-base font-normal">→</span>
                </>
              )}
            </button>
          </form>

          {/* Secure & Encrypted footnote */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-text-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-text-muted">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Secure & Encrypted</span>
          </div>

          {/* Contact Admin link */}
          <div className="mt-8 pt-6 border-t border-border/60 text-center text-xs text-text-muted">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => alert('Please contact system administrator at admin@bloodbridge.in to register your institution.')}
              className="text-primary font-bold hover:underline cursor-pointer"
            >
              Contact Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
