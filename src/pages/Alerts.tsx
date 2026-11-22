import React, { useState } from 'react';
import { TopBar } from '../components/TopBar';

interface AlertItem {
  id: string;
  units: number;
  bloodType: string;
  days: number;
  status: 'Urgent' | 'Soon';
  tintBg: string;
  borderColor: string;
  accentBorder: string;
  badgeBg: string;
  badgeColor: string;
  dropColor: string;
}

export const Alerts: React.FC = () => {
  const [alertsList] = useState<AlertItem[]>([
    {
      id: 'alt-1',
      units: 2,
      bloodType: 'O+',
      days: 2,
      status: 'Urgent',
      tintBg: '#FDECEC',
      borderColor: '#F9D6D7',
      accentBorder: '#E5484D',
      badgeBg: '#FBD5D6',
      badgeColor: '#E5484D',
      dropColor: '#E5484D',
    },
    {
      id: 'alt-2',
      units: 1,
      bloodType: 'B-',
      days: 4,
      status: 'Soon',
      tintBg: '#FFFBEB',
      borderColor: '#FDE68A',
      accentBorder: '#F59E0B',
      badgeBg: '#FEF3C7',
      badgeColor: '#D97706',
      dropColor: '#F59E0B',
    },
  ]);

  const [selectedRedistribute, setSelectedRedistribute] = useState<AlertItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isNotifying, setIsNotifying] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmRedistribute = () => {
    setIsNotifying(true);
    setTimeout(() => {
      setIsNotifying(false);
      setSelectedRedistribute(null);
      triggerToast('Redistribution broadcast sent to 12 partner blood banks!');
    }, 700);
  };

  return (
    <div className="w-full flex flex-col gap-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-navy text-white px-5 py-3 rounded-btn shadow-soft-lg flex items-center gap-3 text-sm font-medium border border-navy-light animate-in fade-in slide-in-from-top-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Faint droplet watermark in top right corner */}
      <div className="pointer-events-none absolute top-4 right-10 opacity-[0.05] select-none">
        <svg width="220" height="260" viewBox="0 0 100 120" fill="#1255B5">
          <path d="M50 5 C50 5 15 50 15 80 A35 35 0 0 0 85 80 C85 50 50 5 50 5 Z" />
        </svg>
      </div>

      <TopBar
        title="Expiry Alerts"
        subtitle="Don't waste. Redistribute."
      />

      {/* Alerts list */}
      <div className="space-y-4 max-w-4xl relative z-10">
        {alertsList.map((item) => (
          <div
            key={item.id}
            style={{
              backgroundColor: item.tintBg,
              borderColor: item.borderColor,
            }}
            className="w-full rounded-card p-6 border shadow-soft flex items-center justify-between transition-all hover:shadow-soft-md"
          >
            {/* Left side: Droplet icon in white circle + text */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-12 h-12 rounded-full bg-white border border-white flex items-center justify-center shrink-0 shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-6 h-6"
                >
                  <path
                    d="M12 2.5 C12 2.5 5 10.5 5 15.5 C5 19.4 8.1 22.5 12 22.5 C15.9 22.5 19 19.4 19 15.5 C19 10.5 12 2.5 12 2.5 Z"
                    fill={item.dropColor}
                  />
                  <ellipse
                    cx="9.5"
                    cy="15"
                    rx="1.8"
                    ry="3.2"
                    transform="rotate(-25 9.5 15)"
                    fill="#FFFFFF"
                    fillOpacity="0.45"
                  />
                </svg>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-semibold text-navy">
                  {item.units} units of {item.bloodType}
                </h4>
                <p className="text-sm text-text-muted mt-0.5">
                  Expiring in {item.days} days
                </p>
              </div>
            </div>

            {/* Right side: Urgent / Soon pill + Redistribute button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedRedistribute(item)}
                className="hidden sm:inline-flex px-4 py-1.5 rounded-btn border border-current bg-white/70 text-xs font-semibold hover:bg-white transition-all cursor-pointer"
                style={{ color: item.badgeColor }}
              >
                Redistribute
              </button>

              <span
                style={{
                  backgroundColor: item.badgeBg,
                  color: item.badgeColor,
                }}
                className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide"
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Redistribute Confirmation Dialog */}
      {selectedRedistribute && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card p-6 sm:p-7 w-full max-w-sm shadow-soft-lg border border-border animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-navy">Notify nearby banks?</h3>
            <p className="text-sm text-text-muted mt-1.5 leading-relaxed">
              Broadcast an immediate redistribution notice to all 12 partner blood banks for{' '}
              <strong className="text-navy">{selectedRedistribute.units} units of {selectedRedistribute.bloodType}</strong> before expiry.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setSelectedRedistribute(null)}
                className="px-4 py-2 text-sm text-text-muted hover:text-navy cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRedistribute}
                disabled={isNotifying}
                className="px-5 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-btn shadow-soft cursor-pointer flex items-center gap-2"
              >
                {isNotifying ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Confirm</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
