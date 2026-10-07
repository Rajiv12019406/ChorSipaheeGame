/**
 * Centralized WebSocket / app configuration.
 * Emulator → host machine: 10.0.2.2
 * Physical device → use your computer's LAN IP (e.g. 192.168.1.10)
 */
export const DEFAULT_WS_PORT = 8765;
export const DEFAULT_EMULATOR_HOST = '10.0.2.2';

export const WS_CONNECT_TIMEOUT_MS = 10_000;
export const WS_RECONNECT_DELAY_MS = 2_000;
export const WS_MAX_RECONNECT_ATTEMPTS = 5;

export function buildWsUrl(host: string, port: number = DEFAULT_WS_PORT): string {
  const cleanHost = host.trim().replace(/^ws:\/\//i, '').replace(/\/$/, '');
  const [h, p] = cleanHost.includes(':')
    ? [cleanHost.split(':')[0], Number(cleanHost.split(':')[1]) || port]
    : [cleanHost, port];
  return `ws://${h}:${p}`;
}

type ConfigState = {
  wsHost: string;
  wsPort: number;
  readonly wsUrl: string;
};

export const config: ConfigState = {
  wsHost: DEFAULT_EMULATOR_HOST,
  wsPort: DEFAULT_WS_PORT,
  get wsUrl() {
    return buildWsUrl(this.wsHost, this.wsPort);
  },
};

export function setWsEndpoint(host: string, port: number = DEFAULT_WS_PORT): void {
  config.wsHost = host.trim();
  config.wsPort = port;
}
