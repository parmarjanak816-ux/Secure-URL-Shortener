import { useState, useEffect } from 'react';
import AdminNav from '../components/AdminNav';
import { getUsers, updateUserRole, deleteUser } from '../api/admin.api';
import type { AdminUser } from '../types/admin.types';

function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState<{ user: AdminUser; role: 'USER' | 'ADMIN' } | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsers(await getUsers());
      } catch {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    void fetchUsers();
  }, []);

  const requestRoleChange = (user: AdminUser) => {
    setConfirming({ user, role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' });
  };

  const confirmRoleChange = async () => {
    if (!confirming) return;
    try {
      const updated = await updateUserRole(confirming.user.id, confirming.role);
      setUsers(users.map(u => u.id === confirming.user.id ? updated : u));
      setConfirming(null);
    } catch {
      setError('Failed to update role');
      setConfirming(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this user and all their URLs?')) return;
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch {
      setError('Failed to delete user');
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
          <h1 className="text-[22px] font-bold tracking-tight text-ink">Users</h1>
          <span className="text-[13px] text-muted font-medium">{users.length} total</span>
        </div>

        {error && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-danger-brd bg-danger-soft mb-5 text-[13.5px] font-semibold text-danger-text">
            <span>⚠</span> {error}
          </div>
        )}

        {/* Mobile: one card per user */}
        <div className="md:hidden flex flex-col gap-3">
          {users.map(user => (
            <div key={user.id} className="bg-surface rounded-2xl border border-border p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-[14px] font-bold text-ink truncate">{user.email}</span>
                <button
                  onClick={() => requestRoleChange(user)}
                  className={`text-[12px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer border transition-colors shrink-0 ${
                    user.role === 'ADMIN'
                      ? 'bg-accent-soft text-accent-soft-text border-transparent hover:opacity-80'
                      : 'bg-surface-2 text-muted border-border hover:bg-surface'
                  }`}
                >
                  {user.role}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-subtle font-medium mb-3">
                <span>🔗 {user.urlCount} URLs</span>
                <span>🗓 {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-end border-t border-border pt-2.5">
                <button
                  onClick={() => void handleDelete(user.id)}
                  className="text-[13px] font-semibold text-danger-text cursor-pointer hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block bg-surface rounded-2xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className="px-5 py-3 text-left text-[12px] font-semibold text-subtle uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold text-subtle uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold text-subtle uppercase tracking-wider">URLs</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold text-subtle uppercase tracking-wider">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors">
                  <td className="px-5 py-3.5 text-ink font-medium">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => requestRoleChange(user)}
                      className={`text-[12px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer border transition-colors ${
                        user.role === 'ADMIN'
                          ? 'bg-accent-soft text-accent-soft-text border-transparent hover:opacity-80'
                          : 'bg-surface-2 text-muted border-border hover:bg-surface'
                      }`}
                    >
                      {user.role}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{user.urlCount}</td>
                  <td className="px-5 py-3.5 text-muted">
                    {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => void handleDelete(user.id)}
                      className="text-[13px] font-semibold text-danger-text cursor-pointer hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
          onClick={() => setConfirming(null)}
        >
          <div
            className="bg-surface rounded-2xl border border-border p-7 w-full max-w-[380px] mx-4"
            style={{ boxShadow: 'var(--shadow-modal)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[17px] font-bold text-ink mb-2">Change role</h3>
            <p className="text-[14px] text-muted font-medium mb-6 leading-relaxed">
              {confirming.role === 'ADMIN'
                ? `Make ${confirming.user.email} an admin? They'll be able to manage all users and URLs.`
                : `Remove admin access from ${confirming.user.email}?`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirming(null)}
                className="h-10 px-4 rounded-xl border border-border-strong bg-surface text-[14px] font-semibold text-ink cursor-pointer hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void confirmRoleChange()}
                className="h-10 px-4 rounded-xl bg-accent text-accent-fg text-[14px] font-semibold border-none cursor-pointer transition-colors"
                style={{ boxShadow: 'var(--shadow-card)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;
