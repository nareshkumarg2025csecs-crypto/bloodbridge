import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';

interface PartnerResult {
  id: string;
  name: string;
  distance: string;
  units: number;
  bloodType: string;
}

export const Requests: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PartnerResult[] | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);
  const [parsedType, setParsedType] = useState('B+');
  const [requestedId, setRequestedId] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      // Default sample query if empty
      setQuery('B+, 5 units, urgent');
    }

    setLoading(true);
    setResults(null);

    // Simple regex parse of query for blood group, units, and urgency
    // TODO: replace with ML classifier API
    const bloodTypeMatch = query.match(/\b(A|B|AB|O)[+-]\b/i);
    const parsedBlood = bloodTypeMatch ? bloodTypeMatch[0].toUpperCase() : 'B+';
    const urgentMatch = /urgent|emergency|critical/i.test(query);

    setParsedType(parsedBlood);
    setIsUrgent(urgentMatch);

    // 1-second simulated ML classifier & geolocation ranking response
    setTimeout(() => {
      setResults([
        {
          id: 'hosp-city',
          name: 'City General Hospital',
          distance: '2.4 km',
          units: 12,
          bloodType: parsedBlood,
        },
        {
          id: 'hosp-apollo',
          name: 'Apollo Blood Bank',
          distance: '4.1 km',
          units: 8,
          bloodType: parsedBlood,
        },
        {
          id: 'hosp-care',
          name: 'Care Hospital',
          distance: '6.8 km',
          units: 5,
          bloodType: parsedBlood,
        },
      ]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full flex flex-col gap-6 relative">
      {/* Soft droplet watermark in top right */}
      <div className="pointer-events-none absolute top-4 right-10 opacity-[0.045] select-none">
        <svg width="220" height="260" viewBox="0 0 100 120" fill="#1255B5">
          <path d="M50 5 C50 5 15 50 15 80 A35 35 0 0 0 85 80 C85 50 50 5 50 5 Z" />
        </svg>
      </div>

      <TopBar
        title="New Request"
        subtitle="Find compatible blood banks instantly"
      />

      {/* Main Request Search Container */}
      <div className="w-full max-w-2xl bg-card rounded-card p-8 border border-border shadow-soft flex flex-col gap-6 relative z-10">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          {/* Rounded search input with magnifier icon */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6B7A99"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 opacity-70"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. B+, 5 units, urgent"
              className="w-full h-12 pl-12 pr-4 bg-white border border-border rounded-input text-text text-sm sm:text-base placeholder:text-text-muted/65 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-none"
            />
          </div>

          {/* Full-width primary search button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-btn bg-primary hover:bg-primary-dark text-white font-semibold text-base shadow-soft flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-75"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Search</span>
              </>
            )}
          </button>
        </form>

        {/* 1-Second Skeleton Loader */}
        {loading && (
          <div className="space-y-3 pt-4 border-t border-border animate-pulse">
            <div className="h-4 w-40 bg-slate-200 rounded"></div>
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 bg-slate-100 rounded-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                    <div className="h-3 w-20 bg-slate-200 rounded"></div>
                  </div>
                </div>
                <div className="h-9 w-24 bg-slate-200 rounded-btn"></div>
              </div>
            ))}
          </div>
        )}

        {/* Search Results Ranked by Distance */}
        {results && !loading && (
          <div className="border-t border-border pt-6 flex flex-col gap-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-navy uppercase tracking-wider">
                Ranked Results for {parsedType}
              </h3>
              {isUrgent && (
                <span className="px-3 py-1 rounded-full bg-alert-bg text-alert text-xs font-semibold">
                  Urgent Priority
                </span>
              )}
            </div>

            <div className="space-y-3">
              {results.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-card border border-border bg-card shadow-soft flex items-center justify-between flex-wrap gap-4 transition-all hover:border-primary/30"
                >
                  {/* Left: Building icon tile + Details */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#EAF2FD] flex items-center justify-center shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1255B5"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5"
                      >
                        <path d="M2 10h20" />
                        <path d="M12 2 2 7h20z" />
                        <path d="M6 10v8" />
                        <path d="M10 10v8" />
                        <path d="M14 10v8" />
                        <path d="M18 10v8" />
                        <path d="M2 18h20" />
                      </svg>
                    </div>

                    <div>
                      <h4 className="font-semibold text-navy text-base leading-tight">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-primary font-medium bg-[#EBF3FE] px-2.5 py-0.5 rounded-full">
                          {item.distance}
                        </span>
                        <span className="text-xs text-text-muted">
                          • {item.units} units of {item.bloodType} available
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Request Button + Chat Outlined Button */}
                  <div className="flex items-center gap-2.5 ml-auto">
                    <button
                      onClick={() => navigate('/chat')}
                      className="px-4 py-2 rounded-btn border border-border hover:border-primary text-navy font-semibold text-xs transition-colors flex items-center gap-1.5 bg-white cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-primary">
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                      </svg>
                      <span>Chat</span>
                    </button>

                    <button
                      onClick={() => {
                        setRequestedId(item.id);
                        setTimeout(() => setRequestedId(null), 3000);
                      }}
                      className={`px-5 py-2 rounded-btn font-semibold text-xs text-white shadow-soft transition-all cursor-pointer ${
                        requestedId === item.id
                          ? 'bg-emerald-600'
                          : 'bg-primary hover:bg-primary-dark'
                      }`}
                    >
                      {requestedId === item.id ? 'Requested ✓' : 'Request'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
