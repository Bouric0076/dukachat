import React from 'react';
import { IncidentSeverity, IncidentStatus } from '../types/incident';

interface StatusBadgeProps {
  type: 'status' | 'severity';
  value: IncidentStatus | IncidentSeverity;
  pulse?: boolean;
}

const STATUS_CONFIG: Record<IncidentStatus, { label: string; color: string }> = {
  reported:    { label: 'Reported',    color: '#f59e0b' },
  dispatched:  { label: 'Dispatched',  color: '#3b82f6' },
  in_progress: { label: 'In Progress', color: '#8b5cf6' },
  resolved:    { label: 'Resolved',    color: '#10b981' },
};

const SEVERITY_CONFIG: Record<IncidentSeverity, { label: string; color: string }> = {
  low:      { label: 'Low',      color: '#6b7280' },
  medium:   { label: 'Medium',   color: '#f59e0b' },
  high:     { label: 'High',     color: '#ef4444' },
  critical: { label: 'Critical', color: '#dc2626' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, pulse }) => {
  const config =
    type === 'status'
      ? STATUS_CONFIG[value as IncidentStatus]
      : SEVERITY_CONFIG[value as IncidentSeverity];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '2px 10px',
        borderRadius: '999px',
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        backgroundColor: config.color + '22',
        color: config.color,
        border: `1px solid ${config.color}55`,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: config.color,
          display: 'inline-block',
          animation: pulse ? 'pulse-dot 1.4s ease-in-out infinite' : 'none',
        }}
      />
      {config.label}
    </span>
  );
};

export default StatusBadge;
