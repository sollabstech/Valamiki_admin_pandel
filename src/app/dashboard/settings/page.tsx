'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Lock, User, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getActiveUsername, changeCredentials, DEFAULT_ADMIN } from '@/lib/adminAuth';

export default function SettingsPage() {
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [loadingUser, setLoadingUser] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    getActiveUsername()
      .then(setUsername)
      .catch(() => setUsername(DEFAULT_ADMIN.username))
      .finally(() => setLoadingUser(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDone(false);

    if (!currentPassword) { setError('Enter your current password to confirm the change.'); return; }
    if (newPassword.length < 4) { setError('New password must be at least 4 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('New password and confirmation do not match.'); return; }

    setSaving(true);
    const err = await changeCredentials(currentPassword, username, newPassword);
    setSaving(false);

    if (err) { setError(err); return; }
    setDone(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div>
      <Header title="Settings" />
      <div className="p-6 max-w-xl space-y-5">
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
          <ShieldCheck size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            Update the login for this admin panel. The new username and password take effect
            immediately and are used the next time anyone signs in.
          </p>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900">Admin Login</h2>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-sm text-red-600">
              <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {done && (
            <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 text-sm text-emerald-700">
              <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0" />
              <span>Saved. Use the new details next time you sign in.</span>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Username</label>
            <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400">
              <User size={15} className="text-gray-400 flex-shrink-0" />
              <input value={username} onChange={e => setUsername(e.target.value)}
                disabled={loadingUser}
                placeholder={loadingUser ? 'Loading…' : 'admin@sollabstech'}
                className="w-full py-2.5 text-sm outline-none bg-transparent disabled:text-gray-400" />
            </div>
          </div>

          {/* Current password */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Current Password</label>
            <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400">
              <Lock size={15} className="text-gray-400 flex-shrink-0" />
              <input value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                type={showPw ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••"
                className="w-full py-2.5 text-sm outline-none bg-transparent" />
              <button type="button" onClick={() => setShowPw(p => !p)} className="text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">New Password</label>
            <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400">
              <Lock size={15} className="text-gray-400 flex-shrink-0" />
              <input value={newPassword} onChange={e => setNewPassword(e.target.value)}
                type={showPw ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 4 characters"
                className="w-full py-2.5 text-sm outline-none bg-transparent" />
            </div>
          </div>

          {/* Confirm new password */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Confirm New Password</label>
            <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400">
              <Lock size={15} className="text-gray-400 flex-shrink-0" />
              <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                type={showPw ? 'text' : 'password'} autoComplete="new-password" placeholder="Re-enter new password"
                className="w-full py-2.5 text-sm outline-none bg-transparent" />
            </div>
          </div>

          <button type="submit" disabled={saving || loadingUser}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-md disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
