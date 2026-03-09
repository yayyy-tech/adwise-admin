import { useState } from 'react';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { supabase } from '../lib/supabase';

export function SettingsPage() {
  const { admin } = useAdminAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { error: err } = await supabase.auth.updateUser({ password: newPassword });
      if (err) throw err;
      setMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[600px]">
      <div>
        <h1 className="font-body text-2xl font-semibold text-white">Settings</h1>
        <p className="mt-1 font-body text-sm text-dark-muted">Admin account settings</p>
      </div>

      <div className="rounded-[12px] border border-dark-border bg-dark-surface p-6 space-y-4">
        <h3 className="font-body text-sm font-medium text-white">Account Info</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-dark-muted">Email</span>
            <span className="font-mono text-sm text-white">{admin?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-dark-muted">Role</span>
            <span className="inline-flex rounded-full bg-teal/10 px-2 py-0.5 font-body text-[11px] text-teal">admin</span>
          </div>
        </div>
      </div>

      <div className="rounded-[12px] border border-dark-border bg-dark-surface p-6 space-y-4">
        <h3 className="font-body text-sm font-medium text-white">Change Password</h3>
        <div className="space-y-3">
          <div>
            <label className="block font-body text-xs text-dark-muted mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-11 w-full rounded-[8px] border border-dark-border bg-dark-surface-2 px-3 font-body text-sm text-white placeholder:text-dark-muted-2 focus:border-teal focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-body text-xs text-dark-muted mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-11 w-full rounded-[8px] border border-dark-border bg-dark-surface-2 px-3 font-body text-sm text-white placeholder:text-dark-muted-2 focus:border-teal focus:outline-none"
            />
          </div>
          {error && <p className="font-body text-xs text-red-400">{error}</p>}
          {message && <p className="font-body text-xs text-teal">{message}</p>}
          <button
            onClick={handleChangePassword}
            disabled={loading || !newPassword}
            className="h-11 rounded-[8px] bg-teal px-6 font-body text-sm font-semibold text-dark-base hover:bg-teal-dim disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      <div className="rounded-[12px] border border-dark-border bg-dark-surface p-6 space-y-4">
        <h3 className="font-body text-sm font-medium text-white">Platform Configuration</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-dark-muted">DigiLocker KYC</span>
            <span className="inline-flex rounded-full bg-amber-500/10 px-2 py-0.5 font-body text-[11px] text-amber-400">Pending Approval</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-dark-muted">Daily.co Video</span>
            <span className="inline-flex rounded-full bg-teal/10 px-2 py-0.5 font-body text-[11px] text-teal">Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-dark-muted">Resend Email</span>
            <span className="inline-flex rounded-full bg-teal/10 px-2 py-0.5 font-body text-[11px] text-teal">Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-dark-muted">Google Calendar</span>
            <span className="inline-flex rounded-full bg-teal/10 px-2 py-0.5 font-body text-[11px] text-teal">Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}
