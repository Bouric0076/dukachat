import React, { useState, useRef } from 'react';
import api from '../services/api';
import { IncidentReport, IncidentCategory, IncidentSeverity } from '../types/incident';

interface ReportProps { onSuccess?: () => void; }

const CATEGORIES = [
  { value: 'fire' as IncidentCategory, label: 'Fire', icon: '🔥' },
  { value: 'medical' as IncidentCategory, label: 'Medical', icon: '🚑' },
  { value: 'accident' as IncidentCategory, label: 'Accident', icon: '🚗' },
  { value: 'crime' as IncidentCategory, label: 'Crime', icon: '🚨' },
  { value: 'flood' as IncidentCategory, label: 'Flood', icon: '🌊' },
  { value: 'power_outage' as IncidentCategory, label: 'Power Outage', icon: '⚡' },
  { value: 'other' as IncidentCategory, label: 'Other', icon: '⚠️' },
];

const SEVERITIES = [
  { value: 'low' as IncidentSeverity, label: 'Low', color: '#6b7280' },
  { value: 'medium' as IncidentSeverity, label: 'Medium', color: '#f59e0b' },
  { value: 'high' as IncidentSeverity, label: 'High', color: '#ef4444' },
  { value: 'critical' as IncidentSeverity, label: 'Critical', color: '#dc2626' },
];

const Report: React.FC<ReportProps> = ({ onSuccess }) => {
  const [form, setForm] = useState({ title: '', description: '', category: 'other' as IncidentCategory, severity: 'medium' as IncidentSeverity, address: '', lat: '', lng: '', reportedBy: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [locating, setLocating] = useState(false);

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const useMyLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { set('lat', pos.coords.latitude.toFixed(6)); set('lng', pos.coords.longitude.toFixed(6)); setLocating(false); },
      () => { setError('Could not get location.'); setLocating(false); }
    );
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.description.trim()) { setError('Description is required.'); return; }
    if (!form.lat || !form.lng) { setError('Location is required.'); return; }
    setSubmitting(true);
    try {
      await api.createIncident({
        title: form.title, description: form.description,
        category: form.category, severity: form.severity,
        location: { lat: parseFloat(form.lat), lng: parseFloat(form.lng), address: form.address || undefined },
        reportedBy: form.reportedBy || undefined,
      });
      setSuccess(true);
      setTimeout(() => onSuccess?.(), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return (
    <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
      <h2 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontWeight: 800 }}>Incident Reported</h2>
      <p style={{ color: 'var(--text-muted)' }}>Dispatchers have been notified. Redirecting…</p>
    </div>
  );

  const inp: React.CSSProperties = { width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>Report an Incident</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>All reports are reviewed by dispatchers immediately.</p>
      </div>
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>Incident Type</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
            {CATEGORIES.map(({ value, label, icon }) => (
              <button key={value} type="button" onClick={() => set('category', value)}
                style={{ padding: '10px 6px', borderRadius: 8, border: '2px solid', borderColor: form.category === value ? 'var(--accent)' : 'var(--border)', background: form.category === value ? '#3b82f615' : 'transparent', cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem' }}>{icon}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 3 }}>{label}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>Severity</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {SEVERITIES.map(({ value, label, color }) => (
              <button key={value} type="button" onClick={() => set('severity', value)}
                style={{ flex: 1, padding: '8px', borderRadius: 8, border: '2px solid', borderColor: form.severity === value ? color : 'var(--border)', background: form.severity === value ? color + '22' : 'transparent', color: form.severity === value ? color : 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Title *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Brief description…" style={inp} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Description *</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Provide as much detail as possible…" rows={4} style={{ ...inp, resize: 'vertical' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Location *</label>
          <button type="button" onClick={useMyLocation} disabled={locating}
            style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, background: 'var(--accent)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 7, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
            {locating ? '⏳ Getting location…' : '📍 Use My Location'}
          </button>
          <input type="text" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Address (optional)" style={{ ...inp, marginBottom: 8 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input type="number" value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="Latitude" style={inp} />
            <input type="number" value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="Longitude" style={inp} />
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={lbl}>Your Name (optional)</label>
          <input type="text" value={form.reportedBy} onChange={e => set('reportedBy', e.target.value)} placeholder="Anonymous" style={inp} />
        </div>
        {error && <div style={{ background: '#ef444415', border: '1px solid #ef444433', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#ef4444', fontSize: '0.85rem' }}>⚠️ {error}</div>}
        <button type="button" onClick={handleSubmit} disabled={submitting}
          style={{ width: '100%', background: '#ef4444', color: '#fff', border: 'none', padding: '13px', borderRadius: 10, fontWeight: 800, fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, boxShadow: '0 4px 14px #ef444455' }}>
          {submitting ? '⏳ Submitting…' : '🚨 Submit Report'}
        </button>
      </div>
    </div>
  );
};

export default Report;