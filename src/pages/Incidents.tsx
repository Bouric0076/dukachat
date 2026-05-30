import React, { useState } from 'react';
import { Incident, IncidentCategory, IncidentStatus } from '../types/incident';
import IncidentCard from '../components/IncidentCard';

interface IncidentsProps {
  incidents: Incident[];
  loading: boolean;
  onViewIncident: (inc: Incident) => void;
  newIds?: Set<string>;
}

const STATUSES: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'reported', label: 'Reported' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

const CATEGORIES: { value: string; label: string }[] = [
  { value: '', label: 'All Categories' },
  { value: 'fire', label: '🔥 Fire' },
  { value: 'medical', label: '🚑 Medical' },
  { value: 'accident', label: '🚗 Accident' },
  { value: 'crime', label: '🚨 Crime' },
  { value: 'flood', label: '🌊 Flood' },
  { value: 'power_outage', label: '⚡ Power Outage' },
  { value: 'other', label: '⚠️ Other' },
];

const Incidents: React.FC<IncidentsProps> = ({ incidents, loading, onViewIncident, newIds }) => {
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  const filtered = incidents.filter((inc) => {
    if (statusFilter && inc.status !== statusFilter) return false;
    if (categoryFilter && inc.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!inc.title.toLowerCase().includes(q) && !inc.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const selectStyle: React.CSSProperties = {
    background: 'var(--card-bg)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)',
    fontSize: '0.85rem', cursor: 'pointer', outline: 'none',
  };

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Incident Feed
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {filtered.length} incident{filtered.length !== 1 ? 's' : ''} shown
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text" placeholder="Search incidents…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{
            ...selectStyle, flex: '1 1 200px',
            backgroundImage: 'none',
          }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={selectStyle}>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
          <div>Loading incidents…</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 48,
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 12, color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🔍</div>
          <div>No incidents match your filters</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map((inc) => (
            <IncidentCard
              key={inc.id}
              incident={inc}
              onClick={onViewIncident}
              isNew={newIds?.has(inc.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Incidents;
