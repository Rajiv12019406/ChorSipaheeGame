import type {ClientMessage, ServerMessage} from './protocol';
import {parseServerMessage} from './protocol';
import type {ConnectionStatus} from './types';
import {
  WS_CONNECT_TIMEOUT_MS,
  WS_MAX_RECONNECT_ATTEMPTS,
  WS_RECONNECT_DELAY_MS,
} from '../config';

export type MessageListener = (message: ServerMessage) => void;
export type StatusListener = (status: ConnectionStatus) => void;
export type ErrorListener = (userMessage: string, technical?: string) => void;

type GameSocketOptions = {
  connectTimeoutMs?: number;
  reconnectDelayMs?: number;
  maxReconnectAttempts?: number;
  autoReconnect?: boolean;
};

/**
 * Thin WebSocket client mapped to the Python server protocol.
 * Does not own game rules — only transport + typed parsing.
 */
export class GameSocket {
  private ws: WebSocket | null = null;
  private url = '';
  private status: ConnectionStatus = 'idle';
  private reconnectAttempts = 0;
  private intentionalClose = false;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private recentHashes: string[] = [];
  private readonly messageListeners = new Set<MessageListener>();
  private readonly statusListeners = new Set<StatusListener>();
  private readonly errorListeners = new Set<ErrorListener>();
  private readonly options: Required<GameSocketOptions>;

  constructor(options: GameSocketOptions = {}) {
    this.options = {
      connectTimeoutMs: options.connectTimeoutMs ?? WS_CONNECT_TIMEOUT_MS,
      reconnectDelayMs: options.reconnectDelayMs ?? WS_RECONNECT_DELAY_MS,
      maxReconnectAttempts:
        options.maxReconnectAttempts ?? WS_MAX_RECONNECT_ATTEMPTS,
      autoReconnect: options.autoReconnect ?? true,
    };
  }

  get connectionStatus(): ConnectionStatus {
    return this.status;
  }

  get isConnected(): boolean {
    return this.status === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  subscribe(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  unsubscribe(listener: MessageListener): void {
    this.messageListeners.delete(listener);
  }

  onStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  onError(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  async connect(url: string): Promise<void> {
    this.url = url;
    this.intentionalClose = false;
    this.reconnectAttempts = 0;
    await this.openSocket(url, 'connecting');
  }

  disconnect(): void {
    this.intentionalClose = true;
    this.clearTimers();
    this.reconnectAttempts = 0;
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  reconnect(): void {
    if (!this.url) {
      this.emitError('Unable to reconnect.', 'No URL configured');
      return;
    }
    this.intentionalClose = false;
    void this.openSocket(this.url, 'reconnecting');
  }

  send(message: ClientMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.emitError(
        'Not connected to the game server.',
        'send while socket not open',
      );
      return false;
    }
    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (err) {
      const technical = err instanceof Error ? err.message : String(err);
      this.emitError('Failed to send message.', technical);
      return false;
    }
  }

  private openSocket(
    url: string,
    initialStatus: 'connecting' | 'reconnecting',
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.clearTimers();
      if (this.ws) {
        try {
          this.ws.onopen = null;
          this.ws.onmessage = null;
          this.ws.onerror = null;
          this.ws.onclose = null;
          this.ws.close();
        } catch {
          // ignore
        }
        this.ws = null;
      }

      this.setStatus(initialStatus);
      let settled = false;

      try {
        this.ws = new WebSocket(url);
      } catch (err) {
        const technical = err instanceof Error ? err.message : String(err);
        this.setStatus('disconnected');
        this.emitError('Unable to connect to game server.', technical);
        reject(err);
        return;
      }

      this.connectTimer = setTimeout(() => {
        if (settled) {
          return;
        }
        settled = true;
        try {
          this.ws?.close();
        } catch {
          // ignore
        }
        this.setStatus('disconnected');
        this.emitError(
          'Unable to connect to game server.',
          'connection timeout',
        );
        reject(new Error('connection timeout'));
        this.scheduleReconnect();
      }, this.options.connectTimeoutMs);

      this.ws.onopen = () => {
        if (settled) {
          return;
        }
        settled = true;
        this.clearConnectTimer();
        this.reconnectAttempts = 0;
        this.setStatus('connected');
        resolve();
      };

      this.ws.onmessage = event => {
        this.handleRawMessage(event.data);
      };

      this.ws.onerror = () => {
        // onclose handles reconnect; avoid double UX errors
        if (__DEV__) {
          console.warn('[GameSocket] WebSocket error');
        }
      };

      this.ws.onclose = () => {
        this.clearConnectTimer();
        this.ws = null;
        if (this.intentionalClose) {
          this.setStatus('disconnected');
          return;
        }
        this.setStatus('disconnected');
        this.emitError('Connection lost. Trying to reconnect...', 'socket closed');
        if (!settled) {
          settled = true;
          reject(new Error('socket closed before open'));
        }
        this.scheduleReconnect();
      };
    });
  }

  private handleRawMessage(data: unknown): void {
    let parsed: unknown;
    try {
      const text = typeof data === 'string' ? data : String(data);
      const hash = text.slice(0, 200);
      if (this.recentHashes.includes(hash) && this.recentHashes[0] === hash) {
        // Ignore exact immediate duplicate
      }
      this.recentHashes.unshift(hash);
      this.recentHashes = this.recentHashes.slice(0, 8);
      parsed = JSON.parse(text);
    } catch (err) {
      if (__DEV__) {
        console.warn('[GameSocket] Invalid JSON', err);
      }
      return;
    }

    const message = parseServerMessage(parsed);
    if (!message) {
      if (__DEV__) {
        console.warn('[GameSocket] Unrecognized message', parsed);
      }
      return;
    }

    this.messageListeners.forEach(listener => {
      try {
        listener(message);
      } catch (err) {
        if (__DEV__) {
          console.error('[GameSocket] Listener error', err);
        }
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.intentionalClose || !this.options.autoReconnect) {
      return;
    }
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.emitError(
        'Unable to reconnect to game server.',
        'max reconnect attempts',
      );
      return;
    }
    this.reconnectAttempts += 1;
    const delay =
      this.options.reconnectDelayMs * Math.min(this.reconnectAttempts, 3);
    this.setStatus('reconnecting');
    this.reconnectTimer = setTimeout(() => {
      void this.openSocket(this.url, 'reconnecting').catch(() => {
        // errors already emitted
      });
    }, delay);
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.statusListeners.forEach(listener => listener(status));
  }

  private emitError(userMessage: string, technical?: string): void {
    if (__DEV__ && technical) {
      console.warn('[GameSocket]', userMessage, technical);
    }
    this.errorListeners.forEach(listener => listener(userMessage, technical));
  }

  private clearConnectTimer(): void {
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
  }

  private clearTimers(): void {
    this.clearConnectTimer();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

export const gameSocket = new GameSocket();
