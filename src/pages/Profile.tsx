import React, { useState } from 'react';
import { TopBar } from '../components/TopBar';

export const Profile: React.FC = () => {
  const [hospitalName, setHospitalName] = useState('Rajalakshmi Hospital');
  const [hospitalEmail, setHospitalEmail] = useState('rajalakshmi@bloodbridge.in');

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [editName, setEditName] = useState(hospitalName);
  const [editEmail, setEditEmail] = useState(hospitalEmail);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setHospitalName(editName);
    setHospitalEmail(editEmail);
    setShowEditModal(false);
    triggerToast('Profile information updated successfully!');
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill out all 3 password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    triggerToast('Password changed successfully!');
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

      {/* Faint droplet watermark in top right */}
      <div className="pointer-events-none absolute top-4 right-10 opacity-[0.045] select-none">
        <svg width="220" height="260" viewBox="0 0 100 120" fill="#1255B5">
          <path d="M50 5 C50 5 15 50 15 80 A35 35 0 0 0 85 80 C85 50 50 5 50 5 Z" />
        </svg>
      </div>

      <TopBar
        title="Profile Settings"
        subtitle="Manage your account details"
      />

      <div className="max-w-4xl space-y-4 relative z-10">
        {/* Card 1: Identity & Edit Profile */}
        <div className="w-full bg-card rounded-card p-7 border border-border shadow-soft flex items-center justify-between flex-wrap gap-4 transition-all hover:shadow-soft-md">
          <div className="flex items-center gap-5">
            {/* Large Blue Circle Avatar with white 'R' */}
            <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center text-white text-2xl font-bold shadow-soft shrink-0">
              {hospitalName.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-navy tracking-tight">{hospitalName}</h3>
              <p className="text-sm text-text-muted mt-0.5">{hospitalEmail}</p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditName(hospitalName);
              setEditEmail(hospitalEmail);
              setShowEditModal(true);
            }}
            className="px-6 py-2.5 rounded-btn border border-border hover:border-primary/40 bg-white text-navy font-medium text-sm transition-all shadow-sm hover:bg-background/50 cursor-pointer"
          >
            Edit Profile
          </button>
        </div>

        {/* Card 2: Security & Change Password */}
        <div className="w-full bg-card rounded-card p-6 border border-border shadow-soft flex items-center justify-between transition-all hover:shadow-soft-md">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-[#EAF2FD] flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1255B5"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-navy text-base">Security</h4>
            </div>
          </div>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      {showEditModal && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card p-6 sm:p-8 w-full max-w-md shadow-soft-lg border border-border animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold text-navy">Edit Profile</h3>
            <p className="text-sm text-text-muted mt-1">Update institutional contact details</p>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                  Hospital Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-input border border-border text-sm text-text focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-input border border-border text-sm text-text focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm text-text-muted hover:text-navy cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-btn shadow-soft cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Dialog with 3 fields */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card p-6 sm:p-8 w-full max-w-md shadow-soft-lg border border-border animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold text-navy">Change Password</h3>
            <p className="text-sm text-text-muted mt-1">Ensure your institutional account remains secure</p>

            <form onSubmit={handleSavePassword} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-input border border-border text-sm text-text focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-input border border-border text-sm text-text focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-input border border-border text-sm text-text focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-sm text-text-muted hover:text-navy cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-btn shadow-soft cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
