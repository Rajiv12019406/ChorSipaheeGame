import {useGameStore} from '../store/gameStore';
import {sortLeaderboard} from '../utils/gameUtils';

export function useGame() {
  const playerName = useGameStore(s => s.playerName);
  const players = useGameStore(s => s.players);
  const isHost = useGameStore(s => s.isHost);
  const gamePhase = useGameStore(s => s.gamePhase);
  const role = useGameStore(s => s.role);
  const scores = useGameStore(s => s.scores);
  const currentRound = useGameStore(s => s.currentRound);
  const totalRounds = useGameStore(s => s.totalRounds);
  const requiredHumans = useGameStore(s => s.requiredHumans);
  const pendingInput = useGameStore(s => s.pendingInput);
  const sipahiName = useGameStore(s => s.sipahiName);
  const chorOptions = useGameStore(s => s.chorOptions);
  const lastRoundResult = useGameStore(s => s.lastRoundResult);
  const winner = useGameStore(s => s.winner);
  const selectedPlayer = useGameStore(s => s.selectedPlayer);
  const suspenseActive = useGameStore(s => s.suspenseActive);

  const leaderboard = sortLeaderboard(scores);
  const humanCount = players.filter(p => !p.isBot).length;
  const isSipahi = sipahiName === playerName;
  const isWinner = winner === playerName;

  return {
    playerName,
    players,
    isHost,
    gamePhase,
    role,
    scores,
    currentRound,
    totalRounds,
    requiredHumans,
    pendingInput,
    sipahiName,
    chorOptions,
    lastRoundResult,
    winner,
    selectedPlayer,
    suspenseActive,
    leaderboard,
    humanCount,
    isSipahi,
    isWinner,
  };
}
