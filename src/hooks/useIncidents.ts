import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import wsService from '../services/websocket';
import { Incident, WSMessage } from '../types/incident';

interface UseIncidentsOptions {
  status?: string;
  category?: string;
  severity?: string;
  limit?: number;
}

export function useIncidents(options: UseIncidentsOptions = {}) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(wsService.connected);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getIncidents(optionsRef.current);
      setIncidents(data.incidents);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // WebSocket live updates
  useEffect(() => {
    wsService.connect();

    const unsubMsg = wsService.subscribe((msg: WSMessage) => {
      if (!msg.payload) return;
      const inc = msg.payload;

      if (msg.type === 'incident_created') {
        setIncidents((prev) => [inc, ...prev]);
        setTotal((t) => t + 1);
      } else if (msg.type === 'incident_updated' || msg.type === 'incident_resolved') {
        setIncidents((prev) =>
          prev.map((i) => (i.id === inc.id ? inc : i))
        );
      }
    });

    const unsubStatus = wsService.onStatusChange(setWsConnected);

    return () => {
      unsubMsg();
      unsubStatus();
    };
  }, []);

  const removeIncident = useCallback((id: string) => {
    setIncidents((prev) => prev.filter((i) => i.id !== id));
    setTotal((t) => t - 1);
  }, []);

  return { incidents, total, loading, error, wsConnected, refetch: fetchIncidents, removeIncident };
}

export default useIncidents;
