import React, { useState, useEffect, useRef } from 'react';
import Sidebar, { Page } from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import Report from './pages/Report';
import Map from './pages/Map';
import Login from './pages/Login';
import useIncidents from './hooks/useIncidents';

interface User { id: string; name: string; role: string; }

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [user, setUser] = useState<User | null>(null);
  const { incidents, loading, wsConnected, refetch } = useIncidents();
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const prevIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fresh = new Set<string>();
    incidents.forEach((inc) => { if (!prevIds.current.has(inc.id)) fresh.add(inc.id); });
    if (fresh.size > 0) setNewIds(fresh);
    prevIds.current = new Set(incidents.map((i) => i.id));
  }, [incidents]);

  if (!token) {
    return <Login onLogin={(tok, u) => { setToken(tok); setUser(u); }} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar currentPage={page} onNavigate={setPage} wsConnected={wsConnected}
        incidentCount={incidents.filter(i => i.status !== 'resolved').length} />
      <main style={{ marginLeft: 220, flex: 1, padding: 28, minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20, gap: 10 }}>
          {user && <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', alignSelf: 'center' }}>👤 {user.name} · {user.role}</span>}
          <button onClick={() => { localStorage.removeItem('auth_token'); setToken(null); setUser(null); }}
            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 7, padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
        {page === 'dashboard' && <Dashboard incidents={incidents} loading={loading} wsConnected={wsConnected} onViewIncident={() => setPage('incidents')} onNavigateToReport={() => setPage('report')} />}
        {page === 'incidents' && <Incidents incidents={incidents} loading={loading} onViewIncident={() => {}} newIds={newIds} />}
        {page === 'report' && <Report onSuccess={() => { refetch(); setPage('incidents'); }} />}
        {page === 'map' && <Map incidents={incidents} loading={loading} />}
      </main>
    </div>
  );
}