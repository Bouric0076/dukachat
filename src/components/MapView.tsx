import React, { useEffect, useRef } from 'react';
import { Incident } from '../types/incident';

interface MapViewProps {
  incidents: Incident[];
  onIncidentClick?: (incident: Incident) => void;
  center?: [number, number];
  zoom?: number;
}

const SEVERITY_COLORS: Record<string, string> = {
  low: '#6b7280',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626',
};

const CATEGORY_ICONS: Record<string, string> = {
  fire: '🔥', medical: '🚑', accident: '🚗',
  crime: '🚨', flood: '🌊', power_outage: '⚡', other: '⚠️',
};

// Leaflet is loaded via CDN in index.html — accessed via window.L
declare const L: any;

export const MapView: React.FC<MapViewProps> = ({
  incidents,
  onIncidentClick,
  center = [-1.286389, 36.817223], // Nairobi default
  zoom = 12,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    if (typeof L === 'undefined') return;

    mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapInstanceRef.current);

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when incidents change
  useEffect(() => {
    if (!mapInstanceRef.current || typeof L === 'undefined') return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    incidents.forEach((inc) => {
      const color = SEVERITY_COLORS[inc.severity] || '#6b7280';
      const emoji = CATEGORY_ICONS[inc.category] || '⚠️';

      const icon = L.divIcon({
        html: `<div style="
          width:36px;height:36px;border-radius:50%;
          background:${color}22;border:2.5px solid ${color};
          display:flex;align-items:center;justify-content:center;
          font-size:18px;cursor:pointer;
          box-shadow:0 2px 8px ${color}55;
          transition:transform 0.15s;
        ">${emoji}</div>`,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([inc.location.lat, inc.location.lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="min-width:180px;font-family:system-ui">
            <b style="font-size:0.9rem">${inc.title}</b><br/>
            <span style="font-size:0.78rem;color:#6b7280">${inc.category} · ${inc.severity}</span><br/>
            <span style="font-size:0.78rem">${inc.description.slice(0, 80)}${inc.description.length > 80 ? '…' : ''}</span>
          </div>
        `);

      if (onIncidentClick) {
        marker.on('click', () => onIncidentClick(inc));
      }
      markersRef.current.push(marker);
    });
  }, [incidents, onIncidentClick]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 20, right: 20, zIndex: 500,
        background: 'var(--card-bg)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '10px 14px', fontSize: '0.75rem',
      }}>
        {Object.entries(SEVERITY_COLORS).map(([sev, color]) => (
          <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
            <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{sev}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapView;
