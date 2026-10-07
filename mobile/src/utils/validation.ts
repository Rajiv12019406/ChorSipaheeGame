export function validatePlayerName(name: string): {
  valid: boolean;
  error?: string;
  value: string;
} {
  const value = name.trim().replace(/\s+/g, ' ');
  if (!value) {
    return {valid: false, error: 'Please enter your name.', value};
  }
  if (value.length < 2) {
    return {
      valid: false,
      error: 'Name must be at least 2 characters.',
      value,
    };
  }
  if (value.length > 20) {
    return {
      valid: false,
      error: 'Name must be 20 characters or fewer.',
      value,
    };
  }
  return {valid: true, value};
}

export function validateServerHost(host: string): {
  valid: boolean;
  error?: string;
  value: string;
} {
  const value = host.trim();
  if (!value) {
    return {valid: false, error: 'Enter a server address.', value};
  }
  // Accept IP, hostname, or host:port (without ws://)
  const cleaned = value.replace(/^ws:\/\//i, '');
  if (!/^[\w.\-]+(?::\d{2,5})?$/.test(cleaned)) {
    return {
      valid: false,
      error: 'Use an IP or hostname, e.g. 10.0.2.2 or 192.168.1.10',
      value: cleaned,
    };
  }
  return {valid: true, value: cleaned};
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
