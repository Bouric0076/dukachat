import React from 'react';
import { Incident } from '../types/incident';
import StatusBadge from './StatusBadge';

const CATEGORY_ICONS: Record<string, string> = {
  fire: '🔥',
  medical: '🚑',
  accident: '🚗',
  crime: '🚨',
  flood: '🌊',
  power_outage: '⚡',
  other: '⚠️',
};

interface IncidentCardProps {
  incident: Incident;
  onClick?: (incident: Incident) => void;
  isNew?: boolean;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onClick, isNew }) => {
  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <article
      onClick={() => onClick?.(incident)}
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${incident.severity === 'critical' ? '#dc2626' : incident.severity === 'high' ? '#ef4444' : incident.severity === 'medium' ? '#f59e0b' : '#6b7280'}`,
        borderRadius: '10px',
        padding: '16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        animation: isNew ? 'slide-in 0.4s ease-out' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (onClick) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      {isNew && (
        <span style={{
          position: 'absolute', top: 10, right: 10,
          background: '#3b82f6', color: '#fff',
          fontSize: '0.65rem', fontWeight: 700,
          padding: '1px 7px', borderRadius: '999px', letterSpacing: '0.05em',
        }}>NEW</span>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{CATEGORY_ICONS[incident.category]}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {incident.title}
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {incident.description}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        <StatusBadge type="status" value={incident.status} pulse={incident.status === 'in_progress'} />
        <StatusBadge type="severity" value={incident.severity} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>📍 {incident.location.address || `${incident.location.lat.toFixed(4)}, ${incident.location.lng.toFixed(4)}`}</span>
        <span>{timeAgo(incident.reportedAt)}</span>
      </div>
    </article>
  );
};

export default IncidentCard;
