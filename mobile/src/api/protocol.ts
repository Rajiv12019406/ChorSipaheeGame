import type {Role} from './types';
import {ROLES} from './types';

/** Exact server → client messages from server.py / client.py */
export type ServerMessage =
  | {type: 'input_request'; prompt: 'name'}
  | {
      type: 'input_request';
      prompt: 'choose_chor';
      title?: string;
      options: string[];
    }
  | {
      type: 'input_request';
      prompt: 'number_input';
      title?: string;
      min: number;
      max: number;
    }
  | {type: 'info'; message: string}
  | {type: 'round_start'; round: number; total: number}
  | {type: 'role_reveal'; role: Role}
  | {type: 'sipahi_turn'; sipahi: string; chor_options?: string[]}
  | {
      type: 'round_end';
      correct: boolean;
      all_roles: Record<string, Role>;
      scores: Record<string, number>;
    }
  | {type: 'scoreboard'; scores: Record<string, number>}
  | {
      type: 'game_over';
      winner: string;
      final_scores: Record<string, number>;
    }
  | {type: 'error'; message: string};

/** Exact client → server messages */
export type ClientMessage =
  | {type: 'response'; value: string | number}
  | {type: 'command'; command: 'start'};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as string[]).includes(value);
}

function parseStringRecord(
  value: unknown,
  valueGuard?: (v: unknown) => boolean,
): Record<string, string> | null {
  if (!isRecord(value)) {
    return null;
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v !== 'string') {
      return null;
    }
    if (valueGuard && !valueGuard(v)) {
      return null;
    }
    out[k] = v;
  }
  return out;
}

function parseNumberRecord(value: unknown): Record<string, number> | null {
  if (!isRecord(value)) {
    return null;
  }
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v !== 'number' || Number.isNaN(v)) {
      return null;
    }
    out[k] = v;
  }
  return out;
}

/**
 * Safely parse a raw WebSocket JSON payload into a typed ServerMessage.
 * Returns null for malformed / unknown messages.
 */
export function parseServerMessage(raw: unknown): ServerMessage | null {
  if (!isRecord(raw) || typeof raw.type !== 'string') {
    return null;
  }

  switch (raw.type) {
    case 'input_request': {
      if (raw.prompt === 'name') {
        return {type: 'input_request', prompt: 'name'};
      }
      if (raw.prompt === 'choose_chor') {
        if (!Array.isArray(raw.options) || !raw.options.every(o => typeof o === 'string')) {
          return null;
        }
        return {
          type: 'input_request',
          prompt: 'choose_chor',
          title: typeof raw.title === 'string' ? raw.title : undefined,
          options: raw.options as string[],
        };
      }
      if (raw.prompt === 'number_input') {
        if (typeof raw.min !== 'number' || typeof raw.max !== 'number') {
          return null;
        }
        return {
          type: 'input_request',
          prompt: 'number_input',
          title: typeof raw.title === 'string' ? raw.title : undefined,
          min: raw.min,
          max: raw.max,
        };
      }
      return null;
    }
    case 'info':
      if (typeof raw.message !== 'string') {
        return null;
      }
      return {type: 'info', message: raw.message};
    case 'round_start':
      if (typeof raw.round !== 'number' || typeof raw.total !== 'number') {
        return null;
      }
      return {type: 'round_start', round: raw.round, total: raw.total};
    case 'role_reveal':
      if (!isRole(raw.role)) {
        return null;
      }
      return {type: 'role_reveal', role: raw.role};
    case 'sipahi_turn':
      if (typeof raw.sipahi !== 'string') {
        return null;
      }
      return {
        type: 'sipahi_turn',
        sipahi: raw.sipahi,
        chor_options: Array.isArray(raw.chor_options)
          ? (raw.chor_options.filter(o => typeof o === 'string') as string[])
          : undefined,
      };
    case 'round_end': {
      if (typeof raw.correct !== 'boolean') {
        return null;
      }
      const allRoles = parseStringRecord(raw.all_roles, isRole) as Record<
        string,
        Role
      > | null;
      const scores = parseNumberRecord(raw.scores);
      if (!allRoles || !scores) {
        return null;
      }
      return {
        type: 'round_end',
        correct: raw.correct,
        all_roles: allRoles,
        scores,
      };
    }
    case 'scoreboard': {
      const scores = parseNumberRecord(raw.scores);
      if (!scores) {
        return null;
      }
      return {type: 'scoreboard', scores};
    }
    case 'game_over': {
      if (typeof raw.winner !== 'string') {
        return null;
      }
      const finalScores = parseNumberRecord(raw.final_scores);
      if (!finalScores) {
        return null;
      }
      return {
        type: 'game_over',
        winner: raw.winner,
        final_scores: finalScores,
      };
    }
    case 'error':
      if (typeof raw.message !== 'string') {
        return null;
      }
      return {type: 'error', message: raw.message};
    default:
      return null;
  }
}

/** Host human-count prompt reuses choose_chor with human options. */
export function isHostHumansPrompt(msg: ServerMessage): boolean {
  return (
    msg.type === 'input_request' &&
    msg.prompt === 'choose_chor' &&
    Boolean(msg.title?.toLowerCase().includes('human'))
  );
}

/** Sipahi guess prompt — title typically "Who is the Chor?" */
export function isSipahiGuessPrompt(msg: ServerMessage): boolean {
  if (msg.type !== 'input_request' || msg.prompt !== 'choose_chor') {
    return false;
  }
  if (isHostHumansPrompt(msg)) {
    return false;
  }
  return true;
}

/** Parse "Rajiv joined! (2/4)" style info messages. */
export function parseJoinInfo(
  message: string,
): {playerName: string; current: number; required: number} | null {
  const match = message.match(/^(.+?) joined! \((\d+)\/(\d+)\)$/i);
  if (!match) {
    return null;
  }
  return {
    playerName: match[1],
    current: Number(match[2]),
    required: Number(match[3]),
  };
}

/** Parse "Waiting for N more player(s)..." */
export function parseWaitingInfo(message: string): number | null {
  const match = message.match(/Waiting for (\d+) more player/i);
  return match ? Number(match[1]) : null;
}

/** Parse "Game Starting! N Bots added." */
export function parseBotsAdded(message: string): number | null {
  const match = message.match(/(\d+)\s+Bots?\s+added/i);
  return match ? Number(match[1]) : null;
}

export function isYouAreHost(message: string): boolean {
  return /you are the host/i.test(message);
}
