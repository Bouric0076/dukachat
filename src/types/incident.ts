export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'reported' | 'dispatched' | 'in_progress' | 'resolved';
export type IncidentCategory =
  | 'fire'
  | 'medical'
  | 'accident'
  | 'crime'
  | 'flood'
  | 'power_outage'
  | 'other';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: Location;
  reportedBy?: string;
  reportedAt: string; // ISO string
  updatedAt: string;
  dispatchedUnits?: string[];
  images?: string[];
}

export interface IncidentReport {
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  location: Location;
  reportedBy?: string;
  images?: File[];
}

export interface WSMessage {
  type: 'incident_created' | 'incident_updated' | 'incident_resolved' | 'ping';
  payload?: Incident;
  timestamp: string;
}
