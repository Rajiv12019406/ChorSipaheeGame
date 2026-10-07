import type {Role} from '../api/types';
import {ROLE_POINTS} from '../api/types';
import {roleColors} from '../theme/colors';

export function sortLeaderboard(
  scores: Record<string, number>,
): Array<{name: string; score: number; rank: number}> {
  return Object.entries(scores)
    .map(([name, score]) => ({name, score}))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .map((entry, index) => ({...entry, rank: index + 1}));
}

export function getRoleColor(role: Role): string {
  return roleColors[role];
}

export function getRolePoints(role: Role): number {
  return ROLE_POINTS[role];
}

export function formatPoints(points: number): string {
  const sign = points > 0 ? '+' : '';
  return `${sign}${points.toLocaleString()}`;
}

export function isBotName(name: string): boolean {
  return /^Bot[_\s]?\d+$/i.test(name.trim());
}

/** Parse host choice like "2 Humans" → 2 */
export function parseHumansChoice(value: string): number {
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : 4;
}

export function humansChoiceLabel(count: number): string {
  return `${count} Human${count === 1 ? '' : 's'}`;
}

export function medalForRank(rank: number): string {
  if (rank === 1) {
    return '🥇';
  }
  if (rank === 2) {
    return '🥈';
  }
  if (rank === 3) {
    return '🥉';
  }
  return `${rank}.`;
}
