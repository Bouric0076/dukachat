import React, { useMemo } from 'react';
import { Incident } from '../types/incident';
import IncidentCard from '../components/IncidentCard';
import StatusBadge from '../components/StatusBadge';

interface DashboardProps {
  incidents: Incident[];
  loading: boolean;
  wsConnected: boolean;
  onViewIncident: (inc: Incident) => void;
  onNavigateToReport: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  incidents, loading, wsConnected, onViewIncident, onNavigateToReport,
}) => {
  const stats = useMemo(() => {
    const active = incidents.filter((i) => i.status !== 'resolved').length;
    const critical = incidents.filter((i) => i.severity === 'critical').length;
    const resolved = incidents.filter((i) => i.status === 'resolved').length;
    const inProgress = incidents.filter((i) => i.status === 'in_progress').length;
    return { active, critical, resolved, inProgress, total: incidents.length };
  }, [incidents]);

  const recent = incidents.slice(0, 5);

  const STAT_CARDS = [
    { label: 'Total Incidents', value: stats.total, icon: '📋', color: '#3b82f6' },
    { label: 'Active', value: stats.active, icon: '🔴', color: '#ef4444' },
    { label: 'Critical', value: stats.critical, icon: '🚨', color: '#dc2626' },
    { label: 'In Progress', value: stats.inProgress, icon: '⚙️', color: '#8b5cf6' },
    { label: 'Resolved', value: stats.resolved, icon: '✅', color: '#10b981' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Dispatch Dashboard
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Real-time emergency incident overview
          </p>
        </div>
        <button
          onClick={onNavigateToReport}
          style={{
            background: '#ef4444', color: '#fff', border: 'none',
            padding: '10px 20px', borderRadius: 8, fontWeight: 700,
            fontSize: '0.875rem', cursor: 'pointer',
            boxShadow: '0 4px 14px #ef444455',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#dc2626'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#ef4444'; }}
        >
          + Report Incident
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        {STAT_CARDS.map(({ label, value, icon, color }) => (
          <div key={label} style={{
            background: 'var(--card-bg)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1 }}>
              {loading ? '—' : value}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Incidents */}
      <div>
        <h2 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Recent Incidents
        </h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading…</div>
        ) : recent.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 48, background: 'var(--card-bg)',
            border: '1px solid var(--border)', borderRadius: 12,
            color: 'var(--text-muted)', fontSize: '0.875rem',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>✅</div>
            No incidents reported
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {recent.map((inc) => (
              <IncidentCard key={inc.id} incident={inc} onClick={onViewIncident} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
