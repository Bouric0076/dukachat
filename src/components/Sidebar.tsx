import React from 'react';

export type Page = 'dashboard' | 'incidents' | 'report' | 'map';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  wsConnected: boolean;
  incidentCount?: number;
}

const NAV_ITEMS: { page: Page; icon: string; label: string }[] = [
  { page: 'dashboard', icon: '◈', label: 'Dashboard' },
  { page: 'incidents', icon: '⊞', label: 'Incidents' },
  { page: 'report',    icon: '+',  label: 'Report' },
  { page: 'map',       icon: '⊕',  label: 'Map View' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, wsConnected, incidentCount }) => {
  return (
    <nav style={{
      width: 220,
      minHeight: '100vh',
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', boxShadow: '0 4px 12px #ef444455',
          }}>🚨</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>RESPOND</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Emergency System</div>
          </div>
        </div>
      </div>

      {/* WS status pill */}
      <div style={{ padding: '10px 20px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: wsConnected ? '#10b98115' : '#ef444415',
          border: `1px solid ${wsConnected ? '#10b98133' : '#ef444433'}`,
          borderRadius: 6, padding: '6px 10px',
          fontSize: '0.72rem', fontWeight: 600,
          color: wsConnected ? '#10b981' : '#ef4444',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: wsConnected ? '#10b981' : '#ef4444',
            animation: wsConnected ? 'pulse-dot 1.4s ease-in-out infinite' : 'none',
          }} />
          {wsConnected ? 'Live Updates Active' : 'Connecting…'}
        </div>
      </div>

      {/* Nav links */}
      <ul style={{ listStyle: 'none', margin: 0, padding: '8px 12px', flex: 1 }}>
        {NAV_ITEMS.map(({ page, icon, label }) => {
          const active = currentPage === page;
          return (
            <li key={page} style={{ marginBottom: 3 }}>
              <button
                onClick={() => onNavigate(page)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, border: 'none',
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? '#fff' : 'var(--text-muted)',
                  fontWeight: active ? 700 : 500, fontSize: '0.875rem',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--hover)'; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>{icon}</span>
                {label}
                {page === 'incidents' && incidentCount !== undefined && incidentCount > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: active ? '#ffffff33' : '#ef444422',
                    color: active ? '#fff' : '#ef4444',
                    borderRadius: '999px', padding: '1px 7px',
                    fontSize: '0.7rem', fontWeight: 700,
                  }}>{incidentCount}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        Build54 Emergency Response v1.0
      </div>
    </nav>
  );
};

export default Sidebar;
