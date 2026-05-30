import { Incident, IncidentReport } from '../types/incident';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

// ── Incidents ──────────────────────────────────────────────────────────────

export const api = {
  /** Fetch all incidents, optionally filtered */
  getIncidents(params?: {
    status?: string;
    category?: string;
    severity?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ incidents: Incident[]; total: number }> {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request(`/incidents${qs}`);
  },

  /** Fetch single incident */
  getIncident(id: string): Promise<Incident> {
    return request(`/incidents/${id}`);
  },

  /** Submit a new incident report (supports file uploads) */
  async createIncident(report: IncidentReport): Promise<Incident> {
    if (report.images && report.images.length > 0) {
      const form = new FormData();
      // Send JSON fields as a blob
      const { images, ...rest } = report;
      form.append('data', JSON.stringify(rest));
      images.forEach((f) => form.append('images', f));

      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BASE_URL}/incidents`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) throw new Error('Failed to submit incident');
      return res.json();
    }
    return request('/incidents', {
      method: 'POST',
      body: JSON.stringify(report),
    });
  },

  /** Update incident status / fields */
  updateIncident(id: string, patch: Partial<Incident>): Promise<Incident> {
    return request(`/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  },

  // ── Auth ─────────────────────────────────────────────────────────────────

  login(credentials: {
    username: string;
    password: string;
  }): Promise<{ token: string; user: { id: string; name: string; role: string } }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout(): Promise<void> {
    return request('/auth/logout', { method: 'POST' });
  },
};

export default api;
