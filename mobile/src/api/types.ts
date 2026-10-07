export type Role = 'Raja' | 'Mantri' | 'Sipahi' | 'Chor';

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting';

export type GamePhase =
  | 'splash'
  | 'home'
  | 'join'
  | 'lobby'
  | 'host_setup'
  | 'waiting'
  | 'role_reveal'
  | 'playing'
  | 'guessing'
  | 'round_result'
  | 'scoreboard'
  | 'game_over';

export type BotStrategy = 'tracker' | 'hunter' | 'random';

export interface Player {
  id: string;
  name: string;
  score: number;
  isBot: boolean;
  isHost: boolean;
  isSelf: boolean;
  role?: Role;
  strategy?: BotStrategy;
}

export interface GameConfig {
  requiredHumans: number;
  totalRounds: number;
}

export interface RoundState {
  current: number;
  total: number;
}

export interface PendingInput {
  kind: 'name' | 'host_humans' | 'host_rounds' | 'guess_chor';
  title?: string;
  options?: string[];
  min?: number;
  max?: number;
}

export interface RoundResult {
  correct: boolean;
  allRoles: Record<string, Role>;
  scoreDeltas: Record<string, number>;
}

export const ROLE_POINTS: Record<Role, number> = {
  Raja: 1000,
  Mantri: 800,
  Sipahi: 500,
  Chor: 0,
};

export const BOT_PERSONALITIES: Record<
  BotStrategy,
  {displayName: string; description: string}
> = {
  tracker: {
    displayName: 'Tracker Bot',
    description: 'Studies previous role patterns.',
  },
  hunter: {
    displayName: 'Hunter Bot',
    description: 'Targets the current leader.',
  },
  random: {
    displayName: 'Random Bot',
    description: 'Trusts pure instinct.',
  },
};

export const ROLES: Role[] = ['Raja', 'Mantri', 'Sipahi', 'Chor'];
