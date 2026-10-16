import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { getAllUrls, toggleUrlStatus, updateComment } from '../api/urls.api';
import { logout } from '../api/auth.api';
import { decodeToken, clearTokens } from '../utils/auth.utils';
import ThemeToggle from '../components/ThemeToggle';
import type { UrlResponse } from '../types/url.types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function DashboardPage() {
  const navigate = useNavigate();
  const [urls, setUrls] = useState<UrlResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<UrlResponse | null>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);

  const token = localStorage.getItem('token');
  const payload = token ? decodeToken(token) : null;
  const userEmail = payload?.email ?? '';
  const userInitial = userEmail.charAt(0).toUpperCase();
  const userRole = payload?.role ?? 'USER';
  const isAdmin = userRole === 'ADMIN';

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const data = await getAllUrls();
        setUrls(data);
      } catch {
        setError('Failed to load URLs');
      } finally {
        setLoading(false);
      }
    };
    void fetchUrls();
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try { await logout(refreshToken); } catch { /* clear anyway */ }
    }
    clearTokens();
    navigate('/login');
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const updated = await toggleUrlStatus(id, !isActive);
      setUrls(urls.map(u => u.id === id ? updated : u));
    } catch {
      setError('Failed to update URL');
    }
  };

  const handleSaveComment = async (id: string) => {
    try {
      const updated = await updateComment(id, { comment: editingComment });
      setUrls(urls.map(u => u.id === id ? updated : u));
      setEditingId(null);
    } catch {
      setError('Failed to update comment');
    }
  };

  const handleCopy = async (id: string, shortCode: string) => {
    await navigator.clipboard.writeText(`${BASE_URL}/${shortCode}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadQr = () => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${qrUrl?.shortCode}-qr.png`;
    link.click();
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return (
    <div className="min-h-screen bg-page flex items-center justify-center text-muted text-[15px] font-medium">
      Loading…
    </div>
  );

  return (
    <div className="min-h-screen bg-page flex flex-col md:flex-row">

      {/* ── Mobile top bar (phones only) ── */}
      <header className="md:hidden flex items-center gap-3 px-5 py-3 border-b border-border bg-surface-2 sticky top-0 z-20">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-[9px] bg-accent flex items-center justify-center text-accent-fg text-base shrink-0">↗</div>
          <span className="text-[17px] font-bold tracking-tight text-ink">hop.li</span>
        </Link>
        <div className="flex-1" />
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="h-9 px-3 rounded-xl text-[14px] font-semibold text-muted bg-transparent border-none cursor-pointer hover:bg-surface hover:text-ink transition-colors flex items-center gap-1.5"
          >
            🛡 Admin
          </button>
        )}
        <ThemeToggle />
        <button
          onClick={() => void handleLogout()}
          className="h-9 px-3 rounded-xl text-[14px] font-semibold text-muted bg-transparent border-none cursor-pointer hover:bg-surface hover:text-danger transition-colors flex items-center"
        >
          Logout
        </button>
      </header>

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-[244px] shrink-0 border-r border-border bg-surface-2 flex-col min-h-screen sticky top-0">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 px-5 pt-5 pb-6 no-underline">
          <div className="w-8 h-8 rounded-[9px] bg-accent flex items-center justify-center text-accent-fg text-base shrink-0">
            ↗
          </div>
          <span className="text-[17px] font-bold tracking-tight text-ink">hop.li</span>
        </Link>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 h-11 px-3 rounded-xl bg-accent text-accent-fg text-[14.5px] font-semibold text-left w-full border-none cursor-pointer"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <span>🔗</span> Your URLs
          </button>
          <button
            onClick={() => navigate('/dashboard/create')}
            className="flex items-center gap-3 h-11 px-3 rounded-xl text-muted text-[14.5px] font-semibold text-left w-full border-none bg-transparent cursor-pointer hover:bg-surface hover:text-ink transition-colors"
          >
            <span>＋</span> Create URL
          </button>
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-3 h-11 px-3 rounded-xl text-muted text-[14.5px] font-semibold text-left w-full border-none bg-transparent cursor-pointer hover:bg-surface hover:text-ink transition-colors"
            >
              <span>🛡</span> Admin
              <span className="ml-auto h-5 px-2 rounded-full bg-accent-soft text-accent-soft-text text-[10.5px] font-bold flex items-center">
                Admin
              </span>
            </button>
          )}
        </nav>

        {/* Bottom: user card + logout */}
        <div className="mt-auto px-3 pb-4 flex flex-col gap-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
            <div className="w-9 h-9 rounded-full bg-accent text-accent-fg flex items-center justify-center text-[13px] font-bold shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-[13.5px] font-bold text-ink truncate">{userEmail}</p>
              <p className="text-[12px] text-subtle font-semibold">{userRole}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void handleLogout()}
              className="flex items-center gap-3 h-11 px-3 rounded-xl text-muted text-[14px] font-semibold text-left flex-1 border-none bg-transparent cursor-pointer hover:bg-surface hover:text-danger transition-colors"
            >
              ← Logout
            </button>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 px-5 md:px-8 py-6 md:py-7">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[24px] font-bold tracking-tight text-ink mb-1">Your URLs</h1>
            <p className="text-[14px] text-muted font-medium">
              {urls.length} link{urls.length !== 1 ? 's' : ''} · 90-day expiry
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/create')}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-accent text-accent-fg text-[14.5px] font-semibold border-none cursor-pointer shrink-0 transition-colors"
            style={{ boxShadow: 'var(--shadow-card)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
          >
            ＋ Create URL
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-danger-brd bg-danger-soft mb-5 text-[13.5px] font-semibold text-danger-text">
            ⚠ {error}
          </div>
        )}

        {/* URL list */}
        {urls.length === 0 ? (
          <div className="border-2 border-dashed border-border-strong rounded-2xl p-12 text-center bg-surface-2">
            <div
              className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center text-accent text-2xl mx-auto mb-4"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              🔗
            </div>
            <p className="text-[17px] font-bold text-ink mb-2">No URLs yet</p>
            <p className="text-[14px] text-muted font-medium mb-5">Create your first one!</p>
            <button
              onClick={() => navigate('/dashboard/create')}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-accent text-accent-fg text-[14.5px] font-semibold border-none cursor-pointer"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              ＋ Create URL
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {urls.map(url => (
              <div
                key={url.id}
                className="bg-surface border border-border rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start transition-shadow hover:border-border-strong"
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card-md)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
              >
                {/* Left: link info */}
                <div className="flex-1 min-w-0">
                  {/* Short URL + copy */}
                  <div className="flex items-center gap-3 mb-2">
                    <a
                      href={`${BASE_URL}/${url.shortCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-baseline no-underline hover:opacity-75 transition-opacity"
                    >
                      <span className="text-[16px] font-medium text-muted">hop.li/</span>
                      <span className="font-mono text-[15.5px] font-semibold text-accent">{url.shortCode}</span>
                    </a>
                    <button
                      onClick={() => void handleCopy(url.id, url.shortCode)}
                      className="inline-flex items-center gap-1 h-[30px] px-3 rounded-full border border-border bg-surface-2 text-muted text-[12px] font-semibold cursor-pointer hover:text-ink hover:border-border-strong transition-colors"
                    >
                      {copiedId === url.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  {/* Original URL */}
                  <p className="text-[13.5px] text-muted font-medium truncate mb-3">
                    ↗ {url.originalUrl}
                  </p>

                  {/* Meta row */}
                  <div className="flex items-center gap-5 flex-wrap">
                    <span className="text-[13px] text-subtle font-medium">
                      🗓 Expires: {fmtDate(url.expiresAt)}
                    </span>

                    {/* Comment */}
                    {editingId === url.id ? (
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <input
                          type="text"
                          value={editingComment}
                          onChange={(e) => setEditingComment(e.target.value)}
                          autoFocus
                          className="flex-1 h-9 px-3 rounded-xl border border-accent bg-surface text-ink text-[13.5px] font-medium outline-none"
                          style={{ boxShadow: '0 0 0 3px var(--ring)', fontFamily: 'inherit' }}
                          placeholder="Add a comment…"
                        />
                        <button
                          onClick={() => void handleSaveComment(url.id)}
                          className="h-9 px-4 rounded-xl bg-accent text-accent-fg text-[13px] font-semibold border-none cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditingComment(''); }}
                          className="h-9 px-4 rounded-xl border border-border-strong bg-surface text-muted text-[13px] font-semibold cursor-pointer hover:bg-surface-2"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-[13px] text-muted font-medium min-w-0">
                        💬
                        <span className={`truncate max-w-[280px] ${!url.comment ? 'italic text-subtle' : ''}`}>
                          {url.comment ?? 'Add a comment'}
                        </span>
                        <button
                          onClick={() => { setEditingId(url.id); setEditingComment(url.comment ?? ''); }}
                          className="inline-flex items-center gap-1 h-[26px] px-2 rounded-full border-none bg-transparent text-accent text-[12.5px] font-semibold cursor-pointer hover:bg-accent-soft transition-colors"
                        >
                          ✎ Edit
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: clicks + QR + pill */}
                <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                  <span className="text-[14.5px] font-bold text-ink">
                    {url.clicks.toLocaleString()} clicks
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQrUrl(url)}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border-strong bg-surface text-ink text-[13px] font-semibold cursor-pointer hover:bg-surface-2 transition-colors"
                    >
                      QR
                    </button>
                    <button
                      onClick={() => void handleToggle(url.id, url.isActive)}
                      className="inline-flex items-center gap-2 h-[30px] px-4 rounded-full text-[13px] font-semibold border border-transparent cursor-pointer transition-colors"
                      style={{
                        background: url.isActive ? 'var(--green-soft)' : 'var(--danger-soft)',
                        color: url.isActive ? 'var(--green-text)' : 'var(--danger-text)',
                      }}
                    >
                      <span
                        className="w-[7px] h-[7px] rounded-full shrink-0"
                        style={{ background: url.isActive ? 'var(--green-text)' : 'var(--danger-text)' }}
                      />
                      {url.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── QR Modal ── */}
      {qrUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: 'rgba(10,14,16,0.45)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
          onClick={() => setQrUrl(null)}
        >
          <div
            className="w-full max-w-[360px] rounded-2xl border border-[var(--glass-brd)] p-6 text-center"
            style={{
              background: 'var(--glass)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: 'var(--shadow-modal)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <span className="text-[16px] font-bold text-ink">QR code</span>
              <button
                onClick={() => setQrUrl(null)}
                className="w-9 h-9 rounded-xl border border-border bg-surface text-muted flex items-center justify-center cursor-pointer hover:text-ink transition-colors text-[16px]"
              >
                ✕
              </button>
            </div>
            <div
              className="w-[208px] h-[208px] mx-auto mb-5 rounded-2xl bg-white border border-border flex items-center justify-center p-3"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <QRCodeCanvas
                ref={qrRef}
                value={`${BASE_URL}/${qrUrl.shortCode}`}
                size={184}
              />
            </div>
            <p className="text-[14px] font-medium mb-5">
              <span className="text-muted">hop.li/</span>
              <span className="font-mono font-semibold text-accent">{qrUrl.shortCode}</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDownloadQr}
                className="flex-1 h-11 rounded-xl bg-accent text-accent-fg text-[14.5px] font-semibold border-none cursor-pointer hover:opacity-90 transition-opacity"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                ↓ Download PNG
              </button>
              <button
                onClick={() => setQrUrl(null)}
                className="h-11 px-5 rounded-xl border border-border-strong bg-surface text-ink text-[14.5px] font-semibold cursor-pointer hover:bg-surface-2 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
