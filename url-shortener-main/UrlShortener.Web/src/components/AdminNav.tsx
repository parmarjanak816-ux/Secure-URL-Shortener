import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

function AdminNav() {
  const { pathname } = useLocation();

  const navItem = (to: string, label: string) => {
    const isActive = pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center h-9 px-3 rounded-xl text-[14px] font-semibold no-underline whitespace-nowrap shrink-0 transition-colors ${
          isActive ? 'bg-accent-soft text-accent-soft-text' : 'text-muted hover:bg-surface-2 hover:text-ink'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      {/* ── Mobile top bar + tabs (phones only) ── */}
      <div className="md:hidden sticky top-0 z-20 border-b border-border bg-surface-2">
        <header className="flex items-center gap-2.5 px-5 py-3">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-7 h-7 rounded-[8px] bg-accent flex items-center justify-center text-accent-fg text-sm shrink-0">↗</div>
            <span className="text-[15px] font-bold tracking-tight text-ink">hop.li</span>
          </Link>
          <span className="text-[10px] font-bold bg-amber-soft text-amber-text px-1.5 py-0.5 rounded-md uppercase tracking-wide shrink-0">Admin</span>
          <div className="flex-1" />
          <ThemeToggle />
          <Link
            to="/dashboard"
            className="flex items-center h-9 px-3 rounded-xl text-[14px] font-semibold text-muted no-underline transition-colors hover:bg-surface hover:text-ink"
          >
            ← Back
          </Link>
        </header>
        <nav className="flex items-center gap-1 px-4 pb-2 overflow-x-auto">
          {navItem('/admin', 'Stats')}
          {navItem('/admin/users', 'Users')}
          {navItem('/admin/urls', 'URLs')}
        </nav>
      </div>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-[220px] shrink-0 border-r border-border bg-surface-2 flex-col sticky top-0 h-screen">
        <div className="px-5 pt-5 pb-4 border-b border-border flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-7 h-7 rounded-[8px] bg-accent flex items-center justify-center text-accent-fg text-sm shrink-0">↗</div>
            <span className="text-[15px] font-bold tracking-tight text-ink">hop.li</span>
          </Link>
          <span className="ml-auto text-[10px] font-bold bg-amber-soft text-amber-text px-1.5 py-0.5 rounded-md uppercase tracking-wide shrink-0">Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItem('/admin', 'Stats')}
          {navItem('/admin/users', 'Users')}
          {navItem('/admin/urls', 'URLs')}
        </nav>
        <div className="px-3 py-4 border-t border-border flex items-center gap-2">
          <Link
            to="/dashboard"
            className="flex items-center h-9 px-3 rounded-xl text-[14px] font-semibold text-muted no-underline transition-colors hover:bg-surface-2 hover:text-ink flex-1"
          >
            ← Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}

export default AdminNav;
