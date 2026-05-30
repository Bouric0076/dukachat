import { WSMessage } from '../types/incident';

type Listener = (msg: WSMessage) => void;

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Set<Listener> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 2000;
  private maxDelay = 30000;
  private intentionalClose = false;
  public connected = false;
  private statusListeners: Set<(connected: boolean) => void> = new Set();

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    this.intentionalClose = false;

    const token = localStorage.getItem('auth_token');
    const url = token ? `${WS_URL}?token=${token}` : WS_URL;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[WS] Connected');
        this.connected = true;
        this.reconnectDelay = 2000;
        this.notifyStatus(true);
        // Heartbeat
        this.ws?.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
      };

      this.ws.onmessage = (e) => {
        try {
          const msg: WSMessage = JSON.parse(e.data);
          this.listeners.forEach((fn) => fn(msg));
        } catch {
          console.warn('[WS] Unparseable message', e.data);
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.notifyStatus(false);
        if (!this.intentionalClose) this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.error('[WS] Error', err);
        this.ws?.close();
      };
    } catch (err) {
      console.error('[WS] Could not create socket', err);
      this.scheduleReconnect();
    }
  }

  disconnect() {
    this.intentionalClose = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  onStatusChange(fn: (connected: boolean) => void) {
    this.statusListeners.add(fn);
    return () => this.statusListeners.delete(fn);
  }

  private notifyStatus(c: boolean) {
    this.statusListeners.forEach((fn) => fn(c));
  }

  private scheduleReconnect() {
    this.reconnectTimer = setTimeout(() => {
      console.log(`[WS] Reconnecting in ${this.reconnectDelay}ms…`);
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxDelay);
      this.connect();
    }, this.reconnectDelay);
  }
}

export const wsService = new WebSocketService();
export default wsService;
