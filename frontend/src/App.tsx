import { useCallback, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Shell } from './components/Shell';
import { api, clearAuthSession, getAuthSession, setAuthSession, setBusinessId as persistBusinessId } from './lib/api';
import { Appointments } from './pages/Appointments';
import { Audits } from './pages/Audits';
import { Customers } from './pages/Customers';
import { Dashboard } from './pages/Dashboard';
import { FollowUps } from './pages/FollowUps';
import { Login } from './pages/Login';
import { Payments } from './pages/Payments';
import { Pipeline } from './pages/Pipeline';
import type {
  Appointment,
  AuditLog,
  AuthUser,
  Customer,
  DashboardSummary,
  FollowUpTask,
  Lead,
  Payment,
} from './types';

type AppState = {
  summary?: DashboardSummary;
  customers: Customer[];
  leads: Lead[];
  appointments: Appointment[];
  payments: Payment[];
  followUps: FollowUpTask[];
  audits: AuditLog[];
};

const initialState: AppState = {
  customers: [],
  leads: [],
  appointments: [],
  payments: [],
  followUps: [],
  audits: [],
};

export default function App() {
  const session = getAuthSession();
  const [state, setState] = useState<AppState>(initialState);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [businessId, setBusinessId] = useState(session.businessId);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }, []);

  const refresh = useCallback(async () => {
    try {
      setError('');
      const [summary, customers, leads, appointments, payments, followUps, audits] = await Promise.all([
        api.summary(),
        api.customers(),
        api.leads(),
        api.appointments(),
        api.payments(),
        api.followUps(),
        api.audits(),
      ]);
      setState({ summary, customers, leads, appointments, payments, followUps, audits });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load CRM data');
    }
  }, []);

  const loadUser = useCallback(async () => {
    if (!getAuthSession().token) {
      return;
    }
    try {
      const me = await api.me();
      const selectedBusinessId = getAuthSession().businessId || me.businesses[0]?.id || '';
      if (selectedBusinessId) {
        persistBusinessId(selectedBusinessId);
        setBusinessId(selectedBusinessId);
      }
      setUser(me);
    } catch {
      clearAuthSession();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user && businessId) {
      refresh();
    }
  }, [businessId, refresh, user]);

  async function login(email: string, password: string) {
    try {
      setError('');
      const result = await api.login({ email, password });
      if (!result.user?.businesses?.length) {
        throw new Error('No business account found for this user');
      }
      setAuthSession(result.token, result.businessId);
      setBusinessId(result.businessId);
      setUser(result.user);
      notify('Signed in');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    }
  }

  function logout() {
    clearAuthSession();
    setUser(null);
    setState(initialState);
  }

  if (!user?.businesses?.length) {
    return (
      <>
        {error && <div className="error-banner">{error}</div>}
        <Login onLogin={login} />
      </>
    );
  }

  return (
    <Shell
      user={user}
      businessId={businessId}
      onBusinessChange={(nextBusinessId) => {
        persistBusinessId(nextBusinessId);
        setBusinessId(nextBusinessId);
      }}
      onCreateBusiness={async () => {
        const name = window.prompt('Business name');
        if (!name?.trim()) {
          return;
        }
        const business = await api.createBusiness({ name: name.trim() });
        const me = await api.me();
        persistBusinessId(business.id);
        setBusinessId(business.id);
        setUser(me);
        notify('Business created');
      }}
      onLogout={logout}
    >
      {error && <div className="error-banner">{error}</div>}
      {toast && <div className="toast">{toast}</div>}
      <Routes>
        <Route
          path="/"
          element={<Dashboard summary={state.summary} refresh={refresh} notify={notify} />}
        />
        <Route path="/pipeline" element={<Pipeline leads={state.leads} refresh={refresh} />} />
        <Route path="/customers" element={<Customers customers={state.customers} />} />
        <Route path="/appointments" element={<Appointments appointments={state.appointments} leads={state.leads} refresh={refresh} />} />
        <Route path="/follow-ups" element={<FollowUps followUps={state.followUps} refresh={refresh} />} />
        <Route path="/payments" element={<Payments payments={state.payments} leads={state.leads} refresh={refresh} />} />
        <Route path="/audits" element={<Audits audits={state.audits} />} />
      </Routes>
    </Shell>
  );
}
