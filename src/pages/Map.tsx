import React, { useState } from 'react';
import { Incident } from '../types/incident';
import MapView from '../components/MapView';
import StatusBadge from '../components/StatusBadge';

interface MapProps {
  incidents: Incident[];
  loading: boolean;
}

const Map: React.FC<MapProps> = ({ incidents, loading }) => {
  const [selected, setSelected] = useState<Incident | null>(null);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Live Map
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {incidents.length} incident{incidents.length !== 1 ? 's' : ''} plotted
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 16, minHeight: 0 }}>
        <div style={{ flex: 1, minHeight: 500, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
          {loading ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Loading map…
            </div>
          ) : (
            <MapView incidents={incidents} onIncidentClick={setSelected} />
          )}
        </div>

        {/* Selected incident detail */}
        {selected && (
          <div style={{ width: 280, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, overflowY: 'auto', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Incident Detail</h3>
              <button onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}>×</button>
            </div>
            <h4 style={{ margin: '0 0 8px', fontSize: '1rem', color: 'var(--text-primary)' }}>{selected.title}</h4>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              <StatusBadge type="status" value={selected.status} />
              <StatusBadge type="severity" value={selected.severity} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 12px' }}>{selected.description}</p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div>📍 {selected.location.address || `${selected.location.lat.toFixed(5)}, ${selected.location.lng.toFixed(5)}`}</div>
              <div style={{ marginTop: 4 }}>🕒 {new Date(selected.reportedAt).toLocaleString()}</div>
              {selected.reportedBy && <div style={{ marginTop: 4 }}>👤 {selected.reportedBy}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;
