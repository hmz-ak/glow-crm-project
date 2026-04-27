import {
  CalendarDays,
  CreditCard,
  History,
  LayoutDashboard,
  ListChecks,
  UsersRound,
  Workflow,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { AuthUser } from '../types';

const navItems = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/pipeline', label: 'Pipeline', icon: Workflow },
  { to: '/customers', label: 'Clients', icon: UsersRound },
  { to: '/appointments', label: 'Bookings', icon: CalendarDays },
  { to: '/follow-ups', label: 'Follow', icon: ListChecks },
  { to: '/payments', label: 'Pay', icon: CreditCard },
  { to: '/audits', label: 'Audit', icon: History },
];

export function Shell({
  children,
  user,
  businessId,
  onBusinessChange,
  onCreateBusiness,
  onLogout,
}: {
  children: React.ReactNode;
  user: AuthUser;
  businessId: string;
  onBusinessChange: (businessId: string) => void;
  onCreateBusiness: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">FlowCRM</p>
          <h1>Today’s work</h1>
        </div>
        <div className="topbar-actions">
          <select
            className="business-switcher"
            value={businessId}
            onChange={(event) => onBusinessChange(event.target.value)}
            aria-label="Business account"
          >
            {(user.businesses ?? []).map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
          <button className="small-button" type="button" onClick={onCreateBusiness}>
            New
          </button>
          <button className="small-button" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>
      <main className="content">{children}</main>
      <nav className="bottom-nav" aria-label="Primary navigation">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')} end>
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
