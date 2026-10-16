import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUrl } from '../api/urls.api';
import ThemeToggle from '../components/ThemeToggle';

function CreateUrlPage() {
  const navigate = useNavigate();
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setOriginalUrl(text);
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createUrl({
        originalUrl,
        shortCode: shortCode || undefined,
        comment: comment || undefined,
      });
      navigate('/dashboard');
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Failed to create URL. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const focusRing = { borderColor: 'var(--accent)', boxShadow: '0 0 0 4px var(--ring)' };
  const blurReset = { borderColor: '', boxShadow: '' };

  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/* Nav */}
      <nav
        className="sticky top-0 z-10 border-b border-[var(--glass-brd)] px-7 py-4 flex items-center"
        style={{ background: 'var(--glass)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 h-10 px-3 rounded-xl text-muted text-[14px] font-semibold no-underline transition-colors hover:bg-surface-2 hover:text-ink"
        >
          ← Back to Dashboard
        </Link>
        <div className="flex-1" />
        <ThemeToggle />
      </nav>

      {/* Content */}
      <div className="flex-1 bg-surface-2 px-4 py-11">
        <div className="max-w-[540px] mx-auto">
          <h1 className="text-[26px] font-bold tracking-tight text-ink mb-1">Create short URL</h1>
          <p className="text-[15px] text-muted font-medium mb-7">
            Your links last 90 days. Custom codes and comments included.
          </p>

          <div
            className="bg-surface rounded-2xl border border-border p-7"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            {error && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-danger-brd bg-danger-soft mb-6 text-[13.5px] font-semibold text-danger-text">
                <span className="mt-px">⚠</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Original URL */}
              <div>
                <label className="flex items-center gap-1 text-[14px] font-medium text-ink mb-2">
                  Original URL <span className="text-danger">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle text-[17px]">🔗</span>
                    <input
                      type="url"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      placeholder="https://example.com/very/long/url"
                      required
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-border-strong bg-surface text-ink text-[14.5px] font-medium outline-none transition-shadow"
                      style={{ fontFamily: 'inherit' }}
                      onFocus={(e) => Object.assign(e.target.style, focusRing)}
                      onBlur={(e) => Object.assign(e.target.style, blurReset)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => void handlePaste()}
                    className="inline-flex items-center gap-2 h-12 px-4 rounded-xl border border-border-strong bg-surface text-ink text-[14.5px] font-semibold cursor-pointer shrink-0 transition-colors hover:bg-surface-2"
                  >
                    Paste
                  </button>
                </div>
              </div>

              {/* Custom short code */}
              <div>
                <label className="block text-[14px] font-medium text-ink mb-2">
                  Custom short code{' '}
                  <span className="text-subtle font-normal">(optional)</span>
                </label>
                {/* Wrapper captures focus-within ring via bubbled events */}
                <div
                  className="flex items-center h-12 rounded-xl border border-border-strong bg-surface overflow-hidden transition-shadow"
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusRing)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, blurReset)}
                >
                  <span className="pl-4 pr-1 text-subtle text-[14.5px] font-medium whitespace-nowrap select-none">
                    hop.li/
                  </span>
                  <input
                    type="text"
                    value={shortCode}
                    onChange={(e) => setShortCode(e.target.value)}
                    placeholder="spring-sale"
                    className="flex-1 h-full border-none bg-transparent text-accent font-mono text-[14.5px] font-semibold outline-none p-0 pr-4"
                  />
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-[14px] font-medium text-ink mb-2">
                  Comment{' '}
                  <span className="text-subtle font-normal">(optional)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What is this link for?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border-strong bg-surface text-ink text-[14.5px] font-medium outline-none resize-y transition-shadow"
                  style={{ fontFamily: 'inherit' }}
                  onFocus={(e) => Object.assign(e.target.style, focusRing)}
                  onBlur={(e) => Object.assign(e.target.style, blurReset)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-accent text-accent-fg text-[15.5px] font-semibold border-none cursor-pointer disabled:opacity-50 transition-colors"
                style={{ boxShadow: 'var(--shadow-card)' }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--accent-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
              >
                {loading ? 'Creating…' : 'Create URL'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateUrlPage;
