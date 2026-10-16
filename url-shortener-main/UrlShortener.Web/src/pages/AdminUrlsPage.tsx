import { useState, useEffect } from 'react';
import AdminNav from '../components/AdminNav';
import { getUrls, toggleUrl, deleteUrl } from '../api/admin.api';
import type { AdminUrl } from '../types/admin.types';

function AdminUrlsPage() {
  const [urls, setUrls] = useState<AdminUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        setUrls(await getUrls());
      } catch {
        setError('Failed to load URLs');
      } finally {
        setLoading(false);
      }
    };
    void fetchUrls();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      const updated = await toggleUrl(id);
      setUrls(urls.map(u => u.id === id ? updated : u));
    } catch {
      setError('Failed to toggle URL');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this URL?')) return;
    try {
      await deleteUrl(id);
      setUrls(urls.filter(u => u.id !== id));
    } catch {
      setError('Failed to delete URL');
    }
  };

  if (loading) return (
    <div className="flex flex-col md:flex-row min-h-screen bg-page">
      <AdminNav />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-[14px] text-muted font-medium">Loading…</p>
      </main>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-page">
      <AdminNav />
      <main className="flex-1 min-w-0 px-5 md:px-8 py-6 md:py-8">
        <div className="flex items-center justify-between mb-7">
          <h1 className="text-[22px] font-bold tracking-tight text-ink">URLs</h1>
          <span className="text-[13px] text-muted font-medium">{urls.length} total</span>
        </div>

        {error && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-danger-brd bg-danger-soft mb-5 text-[13.5px] font-semibold text-danger-text">
            <span>⚠</span> {error}
          </div>
        )}

        {/* Mobile: one card per URL */}
        <div className="md:hidden flex flex-col gap-3">
          {urls.map(url => {
            const isExpired = new Date(url.expiresAt) < new Date();
            return (
              <div key={url.id} className="bg-surface rounded-2xl border border-border p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="font-mono font-semibold text-accent text-[15px] truncate">
                    <span className="text-muted">hop.li/</span>{url.shortCode}
                  </span>
                  <button
                    onClick={() => void handleToggle(url.id)}
                    className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer border transition-colors shrink-0 ${
                      url.isActive
                        ? 'bg-success-soft text-success-text border-transparent hover:opacity-80'
                        : 'bg-surface-2 text-muted border-border hover:bg-surface'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${url.isActive ? 'bg-success' : 'bg-subtle'}`} />
                    {url.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <p className="text-[13px] text-muted truncate mb-3">{url.originalUrl}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-subtle font-medium mb-3">
                  <span>👤 {url.userEmail ?? 'Guest'}</span>
                  <span>📊 {url.clicks} clicks</span>
                  {isExpired ? (
                    <span className="font-semibold px-2 py-0.5 rounded-md bg-danger-soft text-danger-text border border-danger-brd">Expired</span>
                  ) : (
                    <span>🗓 {new Date(url.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  )}
                </div>
                <div className="flex justify-end border-t border-border pt-2.5">
                  <button
                    onClick={() => void handleDelete(url.id)}
                    className="text-[13px] font-semibold text-danger-text cursor-pointer hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden md:block bg-surface rounded-2xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className="px-5 py-3 text-left text-[12px] font-semibold text-subtle uppercase tracking-wider">Short</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold text-subtle uppercase tracking-wider">Original</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold text-subtle uppercase tracking-wider">Owner</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold text-subtle uppercase tracking-wider">Clicks</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold text-subtle uppercase tracking-wider">Expires</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold text-subtle uppercase tracking-wider">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {urls.map(url => {
                const isExpired = new Date(url.expiresAt) < new Date();
                return (
                  <tr key={url.id} className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-semibold text-accent text-[13px]">{url.shortCode}</span>
                    </td>
                    <td className="px-5 py-3.5 max-w-[200px] truncate text-muted">{url.originalUrl}</td>
                    <td className="px-5 py-3.5 text-muted">{url.userEmail ?? 'Guest'}</td>
                    <td className="px-5 py-3.5 text-ink font-medium">{url.clicks}</td>
                    <td className="px-5 py-3.5">
                      {isExpired ? (
                        <span className="text-[12px] font-semibold px-2 py-0.5 rounded-md bg-danger-soft text-danger-text border border-danger-brd">
                          Expired
                        </span>
                      ) : (
                        <span className="text-muted">
                          {new Date(url.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => void handleToggle(url.id)}
                        className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer border transition-colors ${
                          url.isActive
                            ? 'bg-success-soft text-success-text border-transparent hover:opacity-80'
                            : 'bg-surface-2 text-muted border-border hover:bg-surface'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${url.isActive ? 'bg-success' : 'bg-subtle'}`} />
                        {url.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => void handleDelete(url.id)}
                        className="text-[13px] font-semibold text-danger-text cursor-pointer hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default AdminUrlsPage;
