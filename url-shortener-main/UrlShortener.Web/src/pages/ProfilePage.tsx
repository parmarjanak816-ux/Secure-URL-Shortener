import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfile, updateProfile, changePassword } from '../api/users.api';
import { logout } from '../api/auth.api';
import { clearTokens } from '../utils/auth.utils';
import ThemeToggle from '../components/ThemeToggle';
import type { UserProfile } from '../types/user.types';

const extractMessage = (err: unknown, fallback: string): string => {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const axiosErr = err as { response?: { data?: { message?: string } } };
    return axiosErr.response?.data?.message || fallback;
  }
  return fallback;
};

function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Name form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nameError, setNameError] = useState('');
  const [nameSaved, setNameSaved] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setFirstName(data.firstName ?? '');
        setLastName(data.lastName ?? '');
      } catch (err) {
        setNameError(extractMessage(err, 'Failed to load profile'));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleSaveName = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNameError('');
    setNameSaved(false);
    setNameSaving(true);
    try {
      const updated = await updateProfile({ firstName, lastName });
      setProfile(updated);
      setFirstName(updated.firstName ?? '');
      setLastName(updated.lastName ?? '');
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
    } catch (err) {
      setNameError(extractMessage(err, 'Failed to update profile'));
    } finally {
      setNameSaving(false);
    }
  };

  const handleChangePassword = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwError('');
    setPwSaved(false);
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPwError('Password must be at least 8 characters and include a letter and a number.');
      return;
    }
    setPwSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      setPwError(extractMessage(err, 'Failed to change password'));
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try { await logout(refreshToken); } catch { /* clear anyway */ }
    }
    clearTokens();
    window.location.href = '/';
  };

  const inputClass =
    'w-full h-12 px-4 rounded-xl border border-border-strong bg-surface text-ink text-[15px] font-medium outline-none transition-shadow';
  const focusStyle = { borderColor: 'var(--accent)', boxShadow: '0 0 0 4px var(--ring)' };
  const blurStyle = { borderColor: '', boxShadow: '' };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/* Nav */}
      <nav
        className="sticky top-0 z-10 border-b border-[var(--glass-brd)] px-6 md:px-8 py-4 flex items-center gap-3"
        style={{ background: 'var(--glass)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="w-8 h-8 rounded-[9px] bg-accent flex items-center justify-center text-accent-fg text-base shrink-0">↗</div>
        <Link to="/" className="text-[17px] font-bold tracking-tight text-ink no-underline">hop.li</Link>
        <div className="flex-1" />
        <ThemeToggle />
        <Link
          to="/dashboard"
          className="h-9 px-4 rounded-xl text-[14px] font-semibold text-muted no-underline transition-colors hover:bg-surface-2 hover:text-ink flex items-center"
        >
          Dashboard
        </Link>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="h-9 px-4 rounded-xl text-[14px] font-semibold text-muted bg-transparent border-none cursor-pointer transition-colors hover:bg-surface-2 hover:text-danger flex items-center"
        >
          Logout
        </button>
      </nav>

      {/* Content */}
      <div className="flex-1 bg-surface-2 px-4 py-11">
        <div className="max-w-[560px] mx-auto">
          <h1 className="text-[26px] font-bold tracking-tight text-ink mb-1">Profile</h1>
          <p className="text-[15px] text-muted font-medium mb-7">Manage your account details and password.</p>

          {loading ? (
            <p className="text-muted text-[15px] font-medium">Loading…</p>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Account info */}
              <div className="bg-surface rounded-2xl border border-border p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
                <h2 className="text-[16px] font-bold text-ink mb-4">Account</h2>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[13.5px] text-subtle font-semibold">Email</span>
                    <span className="text-[14px] text-ink font-medium truncate">{profile?.email}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[13.5px] text-subtle font-semibold">Role</span>
                    <span className="h-6 px-2.5 rounded-full bg-accent-soft text-accent-soft-text text-[11.5px] font-bold flex items-center">
                      {profile?.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[13.5px] text-subtle font-semibold">Member since</span>
                    <span className="text-[14px] text-ink font-medium">{profile ? fmtDate(profile.createdAt) : ''}</span>
                  </div>
                </div>
              </div>

              {/* Edit name */}
              <div className="bg-surface rounded-2xl border border-border p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
                <h2 className="text-[16px] font-bold text-ink mb-4">Your name</h2>

                {nameError && (
                  <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-danger-brd bg-danger-soft mb-5 text-[13.5px] font-semibold text-danger-text">
                    <span className="mt-px">⚠</span>
                    {nameError}
                  </div>
                )}
                {nameSaved && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--green-soft)] bg-[var(--green-soft)] mb-5 text-[13.5px] font-semibold text-[var(--green-text)]">
                    ✓ Saved
                  </div>
                )}

                <form onSubmit={handleSaveName} className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-[14px] font-medium text-ink mb-2">First name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Jane"
                        className={inputClass}
                        style={{ fontFamily: 'inherit' }}
                        onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                        onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[14px] font-medium text-ink mb-2">Last name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className={inputClass}
                        style={{ fontFamily: 'inherit' }}
                        onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                        onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={nameSaving}
                    className="self-start h-11 px-6 rounded-xl bg-accent text-accent-fg text-[14.5px] font-semibold border-none cursor-pointer disabled:opacity-50 transition-colors"
                    style={{ boxShadow: 'var(--shadow-card)' }}
                    onMouseEnter={(e) => { if (!nameSaving) e.currentTarget.style.background = 'var(--accent-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
                  >
                    {nameSaving ? 'Saving…' : 'Save name'}
                  </button>
                </form>
              </div>

              {/* Change password */}
              <div className="bg-surface rounded-2xl border border-border p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
                <h2 className="text-[16px] font-bold text-ink mb-4">Change password</h2>

                {pwError && (
                  <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-danger-brd bg-danger-soft mb-5 text-[13.5px] font-semibold text-danger-text">
                    <span className="mt-px">⚠</span>
                    {pwError}
                  </div>
                )}
                {pwSaved && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--green-soft)] bg-[var(--green-soft)] mb-5 text-[13.5px] font-semibold text-[var(--green-text)]">
                    ✓ Password updated
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[14px] font-medium text-ink mb-2">Current password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={inputClass}
                      style={{ fontFamily: 'inherit' }}
                      onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                      onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-ink mb-2">New password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 chars, with a letter & number"
                      required
                      className={inputClass}
                      style={{ fontFamily: 'inherit' }}
                      onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                      onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-ink mb-2">Confirm new password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={inputClass}
                      style={{ fontFamily: 'inherit' }}
                      onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                      onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={pwSaving}
                    className="self-start h-11 px-6 rounded-xl bg-accent text-accent-fg text-[14.5px] font-semibold border-none cursor-pointer disabled:opacity-50 transition-colors"
                    style={{ boxShadow: 'var(--shadow-card)' }}
                    onMouseEnter={(e) => { if (!pwSaving) e.currentTarget.style.background = 'var(--accent-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
                  >
                    {pwSaving ? 'Updating…' : 'Update password'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
