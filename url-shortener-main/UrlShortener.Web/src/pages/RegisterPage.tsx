import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth.api';
import { setTokens } from '../utils/auth.utils';
import ThemeToggle from '../components/ThemeToggle';

function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must be at least 8 characters and include a letter and a number.');
      return;
    }
    setLoading(true);
    try {
      const response = await register({ email, password });
      setTokens(response.accessToken, response.refreshToken);
      navigate('/');
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Registration failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full h-12 px-4 rounded-xl border border-border-strong bg-surface text-ink text-[15px] font-medium outline-none transition-shadow';
  const focusStyle = { borderColor: 'var(--accent)', boxShadow: '0 0 0 4px var(--ring)' };
  const blurStyle = { borderColor: '', boxShadow: '' };
  const passwordMismatch = confirmPassword.length > 0 && confirmPassword !== password;

  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/* Nav */}
      <nav
        className="sticky top-0 z-10 border-b border-[var(--glass-brd)] px-8 py-4 flex items-center gap-3"
        style={{ background: 'var(--glass)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="w-8 h-8 rounded-[9px] bg-accent flex items-center justify-center text-accent-fg text-base">
          ↗
        </div>
        <Link to="/" className="text-[17px] font-bold tracking-tight text-ink no-underline">
          hop.li
        </Link>
        <div className="flex-1" />
        <ThemeToggle />
      </nav>

      {/* Content */}
      <div
        className="flex-1 flex items-center justify-center px-4 py-10"
        style={{ background: 'radial-gradient(120% 70% at 50% 0%, var(--accent-soft), transparent 60%)' }}
      >
        <div className="w-full max-w-[380px]">
          <h1 className="text-[26px] font-bold tracking-tight text-ink mb-1">Create an account</h1>
          <p className="text-[14.5px] text-muted font-medium mb-6">90-day links, custom codes &amp; comments.</p>

          {error && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-danger-brd bg-danger-soft mb-5 text-[13.5px] font-semibold text-danger-text">
              <span className="mt-px">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[14px] font-medium text-ink mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={inputClass}
                style={{ fontFamily: 'inherit' }}
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e) => Object.assign(e.target.style, blurStyle)}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-ink mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 chars, with a letter & number"
                required
                className={inputClass}
                style={{ fontFamily: 'inherit' }}
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e) => Object.assign(e.target.style, blurStyle)}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-ink mb-2">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={inputClass}
                style={{
                  fontFamily: 'inherit',
                  borderColor: passwordMismatch ? 'var(--danger)' : '',
                  boxShadow: passwordMismatch ? '0 0 0 4px var(--danger-soft)' : '',
                }}
                onFocus={(e) => { if (!passwordMismatch) Object.assign(e.target.style, focusStyle); }}
                onBlur={(e) => { if (!passwordMismatch) Object.assign(e.target.style, blurStyle); }}
              />
              {passwordMismatch && (
                <p className="flex items-center gap-1 text-[13px] font-semibold text-danger-text mt-2">
                  <span>⚠</span> Passwords do not match.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-accent text-accent-fg text-[15px] font-semibold border-none cursor-pointer mt-2 disabled:opacity-50 transition-colors"
              style={{ boxShadow: 'var(--shadow-card)' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--accent-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
            >
              {loading ? 'Creating account…' : 'Register'}
            </button>
          </form>

          <p className="text-[14px] text-muted font-medium text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-bold no-underline hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
