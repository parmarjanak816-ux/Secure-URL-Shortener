import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createGuestUrl, createUrl, getAllUrls } from '../api/urls.api';
import { getProfile } from '../api/users.api';
import { logout } from '../api/auth.api';
import { decodeToken, clearTokens } from '../utils/auth.utils';
import ThemeToggle from '../components/ThemeToggle';
import type { UrlResponse } from '../types/url.types';
import type { UserProfile } from '../types/user.types';

const GUEST_URLS_KEY = 'guest_urls';
const MAX_GUEST_URLS = 10;

function loadGuestUrls(): UrlResponse[] {
  try {
    const stored = localStorage.getItem(GUEST_URLS_KEY);
    if (!stored) return [];
    const urls: UrlResponse[] = JSON.parse(stored);
    const now = new Date();
    const valid = urls.filter(url => new Date(url.expiresAt) > now);
    if (valid.length !== urls.length) {
      localStorage.setItem(GUEST_URLS_KEY, JSON.stringify(valid));
    }
    return valid;
  } catch {
    return [];
  }
}

function saveGuestUrl(url: UrlResponse): void {
  const existing = loadGuestUrls();
  const updated = [url, ...existing].slice(0, MAX_GUEST_URLS);
  localStorage.setItem(GUEST_URLS_KEY, JSON.stringify(updated));
}

function HomePage() {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  const payload = token ? decodeToken(token) : null;

  const [originalUrl, setOriginalUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [comment, setComment] = useState('');
  const [result, setResult] = useState<UrlResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [guestUrls, setGuestUrls] = useState<UrlResponse[]>(() => loadGuestUrls());
  const [myUrls, setMyUrls] = useState<UrlResponse[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

  useEffect(() => {
    if (!isLoggedIn) return;
    void getAllUrls().then(urls => setMyUrls(urls.slice(0, 10))).catch(() => {});
    void getProfile().then(setProfile).catch(() => {});
  }, [isLoggedIn]);

  const recentUrls = isLoggedIn ? myUrls : guestUrls;
  const displayName = profile?.firstName || payload?.email?.split('@')[0] || '';
  const avatarInitial = (payload?.email || '?').charAt(0).toUpperCase();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLoggedIn) {
        const data = await createUrl({
          originalUrl,
          shortCode: shortCode || undefined,
          comment: comment || undefined,
        });
        setResult(data);
        setOriginalUrl('');
        setShortCode('');
        setComment('');
        const urls = await getAllUrls();
        setMyUrls(urls.slice(0, 10));
      } else {
        const data = await createGuestUrl(originalUrl);
        setResult(data);
        setOriginalUrl('');
        saveGuestUrl(data);
        setGuestUrls(loadGuestUrls());
      }
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Failed to shorten URL. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(`${baseUrl}/${result.shortCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyItem = async (url: UrlResponse) => {
    await navigator.clipboard.writeText(`${baseUrl}/${url.shortCode}`);
    setCopiedId(url.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setOriginalUrl(text);
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try { await logout(refreshToken); } catch { /* clear anyway */ }
    }
    clearTokens();
    window.location.href = '/';
  };

  const focusRing = { borderColor: 'var(--accent)', boxShadow: '0 0 0 4px var(--ring)' };
  const blurReset = { borderColor: '', boxShadow: '' };

  return (
    <div className="min-h-screen bg-page flex flex-col">

      {/* Nav */}
      <nav
        className="sticky top-0 z-10 border-b border-[var(--glass-brd)] px-4 md:px-8 py-4 flex items-center gap-2 md:gap-3"
        style={{ background: 'var(--glass)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-[9px] bg-accent flex items-center justify-center text-accent-fg text-base shrink-0">↗</div>
          <span className="text-[17px] font-bold tracking-tight text-ink">hop.li</span>
        </Link>
        <div className="flex-1" />
        <ThemeToggle />
        {isLoggedIn ? (
          <>
            <Link
              to="/dashboard"
              className="h-9 px-4 rounded-xl text-[14px] font-semibold text-muted no-underline transition-colors hover:bg-surface-2 hover:text-ink flex items-center"
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              aria-label="Profile"
              className="w-9 h-9 rounded-full bg-accent text-accent-fg text-[13px] font-bold flex items-center justify-center no-underline shrink-0"
            >
              {avatarInitial}
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="h-9 px-4 rounded-xl text-[14px] font-semibold text-muted bg-transparent border-none cursor-pointer transition-colors hover:bg-surface-2 hover:text-danger hidden sm:flex items-center"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="h-9 px-4 rounded-xl text-[14px] font-semibold text-muted no-underline transition-colors hover:bg-surface-2 hover:text-ink flex items-center"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="h-9 px-4 rounded-xl bg-accent text-accent-fg text-[14px] font-semibold no-underline flex items-center transition-colors"
              style={{ boxShadow: 'var(--shadow-card)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
            >
              <span className="sm:hidden">Sign up</span>
              <span className="hidden sm:inline">Get started free</span>
            </Link>
          </>
        )}
      </nav>

      {/* Hero + form */}
      <section
        className="py-14 md:py-20 px-4"
        style={{ background: 'radial-gradient(120% 70% at 50% 0%, var(--accent-soft), transparent 60%)' }}
      >
        <div className="max-w-[680px] mx-auto text-center">
          <h1 className="text-[34px] md:text-[44px] font-bold tracking-tight text-ink leading-[1.1] mb-4">
            {isLoggedIn ? 'Shorten a link' : 'Short links that work.'}
          </h1>
          <p className="text-[16px] md:text-[17px] text-muted font-medium mb-9 max-w-[460px] mx-auto">
            {isLoggedIn
              ? `Welcome back${displayName ? `, ${displayName}` : ''}. Paste a URL to get a fresh short link.`
              : 'Paste a long URL and get a clean short link in seconds. No account, no friction.'}
          </p>

          {/* Result */}
          {result ? (
            <div className="text-left bg-surface rounded-2xl border border-border p-6" style={{ boxShadow: 'var(--shadow-card-md)' }}>
              <p className="text-[12px] font-semibold text-subtle uppercase tracking-wider mb-3">Your short link</p>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border-strong bg-surface-2 mb-4">
                <a href={`${baseUrl}/${result.shortCode}`} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 no-underline">
                  <span className="text-[15px] text-muted font-medium">hop.li/</span>
                  <span className="text-[15px] font-mono font-semibold text-accent">{result.shortCode}</span>
                </a>
                <button
                  onClick={() => void handleCopy()}
                  className="shrink-0 h-8 px-3 rounded-lg border border-border-strong bg-surface text-[13px] font-semibold text-ink cursor-pointer transition-colors hover:bg-surface-2"
                  style={copied ? { background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent)' } : {}}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-[12.5px] text-subtle mb-5">
                Expires {new Date(result.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                {isLoggedIn ? ' · 90-day link' : ' · 30-day guest link'}
              </p>
              <button
                onClick={() => setResult(null)}
                className="w-full h-11 rounded-xl border border-border-strong bg-surface text-[14.5px] font-semibold text-ink cursor-pointer transition-colors hover:bg-surface-2"
              >
                Shorten another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="text-left flex flex-col gap-4">
              {error && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-danger-brd bg-danger-soft text-[13.5px] font-semibold text-danger-text">
                  <span className="mt-px">⚠</span>
                  {error}
                </div>
              )}

              {/* URL + Paste + Shorten inline */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle text-[17px]">🔗</span>
                  <input
                    type="url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    placeholder="Paste your long URL here…"
                    required
                    className="w-full h-13 pl-10 pr-4 rounded-xl border border-border-strong bg-surface text-ink text-[15px] font-medium outline-none transition-shadow"
                    style={{ height: '52px', fontFamily: 'inherit' }}
                    onFocus={(e) => Object.assign(e.target.style, focusRing)}
                    onBlur={(e) => Object.assign(e.target.style, blurReset)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void handlePaste()}
                  className="inline-flex items-center justify-center px-4 rounded-xl border border-border-strong bg-surface text-ink text-[14.5px] font-semibold cursor-pointer shrink-0 transition-colors hover:bg-surface-2"
                  style={{ height: '52px' }}
                >
                  Paste
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-6 rounded-xl bg-accent text-accent-fg text-[15px] font-semibold border-none cursor-pointer shrink-0 disabled:opacity-50 transition-colors"
                  style={{ height: '52px', boxShadow: 'var(--shadow-card)' }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--accent-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
                >
                  {loading ? 'Shortening…' : 'Shorten →'}
                </button>
              </div>

              {/* Custom short code */}
              <div className="flex items-center h-12 rounded-xl border border-border-strong bg-surface overflow-hidden">
                <span className="pl-4 pr-1 text-subtle text-[14.5px] font-medium whitespace-nowrap select-none">hop.li/</span>
                <input
                  type="text"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value)}
                  disabled={!isLoggedIn}
                  placeholder={isLoggedIn ? 'custom-code (optional)' : 'custom-code'}
                  className="flex-1 h-full border-none bg-transparent text-accent font-mono text-[14.5px] font-semibold outline-none p-0 pr-4 disabled:text-subtle disabled:cursor-not-allowed"
                />
                {!isLoggedIn && (
                  <span className="mr-3 text-[11px] bg-amber-soft text-amber-text font-semibold px-1.5 py-0.5 rounded-md shrink-0">Registered only</span>
                )}
              </div>

              {/* Comment */}
              <div className="relative">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={!isLoggedIn}
                  placeholder={isLoggedIn ? 'Add a comment (optional)' : 'Add a comment'}
                  className="w-full h-12 px-4 rounded-xl border border-border-strong bg-surface text-ink text-[14.5px] font-medium outline-none transition-shadow disabled:bg-surface-2 disabled:text-subtle disabled:cursor-not-allowed"
                  style={{ fontFamily: 'inherit' }}
                  onFocus={(e) => { if (isLoggedIn) Object.assign(e.target.style, focusRing); }}
                  onBlur={(e) => Object.assign(e.target.style, blurReset)}
                />
                {!isLoggedIn && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] bg-amber-soft text-amber-text font-semibold px-1.5 py-0.5 rounded-md">Registered only</span>
                )}
              </div>

              {!isLoggedIn && (
                <p className="text-[13px] text-subtle font-medium">
                  <Link to="/register" className="text-accent font-semibold no-underline hover:underline">Create a free account</Link>
                  {' '}to unlock custom codes, comments &amp; 90-day links.
                </p>
              )}
            </form>
          )}

          {/* Recent links — right under the form */}
          {recentUrls.length > 0 && (
            <div className="mt-8 text-left">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-bold text-ink">
                  {isLoggedIn ? 'Your recent links' : 'Your recent guest links'}
                </h2>
                {isLoggedIn && (
                  <Link to="/dashboard" className="text-[13px] font-semibold text-accent no-underline hover:underline">
                    View all in dashboard →
                  </Link>
                )}
              </div>
              <div className="flex flex-col gap-2.5">
                {recentUrls.map(url => (
                  <div key={url.id} className="bg-surface rounded-xl border border-border px-4 py-3 flex items-center gap-3" style={{ boxShadow: 'var(--shadow-card)' }}>
                    <div className="flex-1 min-w-0">
                      <a href={`${baseUrl}/${url.shortCode}`} target="_blank" rel="noopener noreferrer" className="no-underline">
                        <span className="text-[14px] text-muted font-medium">hop.li/</span>
                        <span className="text-[14px] font-mono font-semibold text-accent">{url.shortCode}</span>
                      </a>
                      <p className="text-[12.5px] text-subtle truncate mt-0.5">{url.originalUrl}</p>
                      <p className="text-[11.5px] text-subtle mt-0.5">
                        Expires {new Date(url.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {isLoggedIn ? ` · ${url.clicks.toLocaleString()} clicks` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => void handleCopyItem(url)}
                      className="shrink-0 h-8 px-3 rounded-lg border border-border-strong bg-surface text-[13px] font-semibold text-ink cursor-pointer transition-colors hover:bg-surface-2"
                      style={copiedId === url.id ? { background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent)' } : {}}
                    >
                      {copiedId === url.id ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Marketing — guests only */}
      {!isLoggedIn && (
        <>
          {/* Features */}
          <section className="py-16 px-4">
            <div className="max-w-[860px] mx-auto">
              <h2 className="text-[22px] font-bold tracking-tight text-ink text-center mb-2">More with a free account</h2>
              <p className="text-[14.5px] text-muted text-center font-medium mb-10">Everything guest links do, plus the good stuff.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { icon: '⏱', title: '90-day links', desc: 'Guest links last 30 days. Registered links stay active for 90 days.' },
                  { icon: '✏️', title: 'Custom short codes', desc: 'Choose a readable slug — like hop.li/my-sale — instead of a random one.' },
                  { icon: '💬', title: 'Comments', desc: 'Add a note to any link so you always remember what it was for.' },
                  { icon: '📊', title: 'Click tracking', desc: 'See how many times each link was clicked, right from your dashboard.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="bg-surface rounded-2xl border border-border p-6 flex gap-4" style={{ boxShadow: 'var(--shadow-card)' }}>
                    <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-[20px] shrink-0">
                      {icon}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-ink mb-1">{title}</h3>
                      <p className="text-[13.5px] text-muted font-medium leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Upgrade CTA */}
          <section className="py-16 px-4" style={{ background: 'radial-gradient(120% 80% at 50% 100%, var(--accent-soft), transparent 60%)' }}>
            <div className="max-w-[480px] mx-auto text-center">
              <h2 className="text-[24px] font-bold tracking-tight text-ink mb-2">Ready for 90-day links?</h2>
              <p className="text-[15px] text-muted font-medium mb-7">
                Create a free account and unlock custom codes, comments, and click tracking.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-accent text-accent-fg text-[15px] font-semibold no-underline transition-colors"
                style={{ boxShadow: 'var(--shadow-card)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
              >
                Create free account
              </Link>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 flex items-center justify-between gap-4 mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[6px] bg-accent flex items-center justify-center text-accent-fg text-[11px]">↗</div>
          <span className="text-[14px] font-bold text-ink">hop.li</span>
        </div>
        <p className="text-[13px] text-subtle">© 2026 hop.li · Free URL shortener</p>
      </footer>
    </div>
  );
}

export default HomePage;
