import { useState, useEffect } from 'react';
import AdminNav from '../components/AdminNav';
import { getStats } from '../api/admin.api';
import type { AdminStats } from '../types/admin.types';

function AdminStatsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(await getStats());
      } catch {
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    void fetchStats();
  }, []);

  if (loading) return (
    <div className="flex flex-col md:flex-row min-h-screen bg-page">
      <AdminNav />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-[14px] text-muted font-medium">Loading…</p>
      </main>
    </div>
  );

  if (error || !stats) return (
    <div className="flex flex-col md:flex-row min-h-screen bg-page">
      <AdminNav />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-[14px] text-danger-text font-medium">{error || 'No data'}</p>
      </main>
    </div>
  );

  const cards = [
    { label: 'Total Users', value: stats.totalUsers },
    { label: 'Total URLs', value: stats.totalUrls },
    { label: 'Total Clicks', value: stats.totalClicks },
    { label: 'Guest URLs', value: stats.guestUrls },
    { label: 'Active URLs', value: stats.activeUrls },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-page">
      <AdminNav />
      <main className="flex-1 min-w-0 px-5 md:px-8 py-6 md:py-8">
        <h1 className="text-[22px] font-bold tracking-tight text-ink mb-7">Overview</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {cards.map(card => (
            <div key={card.label} className="bg-surface rounded-2xl border border-border p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
              <p className="text-[12px] font-semibold text-subtle uppercase tracking-wider mb-3">{card.label}</p>
              <p className="text-[36px] font-bold tracking-tight text-ink leading-none">{card.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default AdminStatsPage;
