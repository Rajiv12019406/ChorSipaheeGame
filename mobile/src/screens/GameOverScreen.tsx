import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AnimatedBackground} from '../components/AnimatedBackground';
import {Confetti} from '../components/Confetti';
import {PrimaryButton} from '../components/GuessButton';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing, radii} from '../theme/spacing';
import type {RootStackParamList} from '../navigation/types';
import {useGameStore} from '../store/gameStore';
import {medalForRank, sortLeaderboard} from '../utils/gameUtils';
import {haptics} from '../utils/haptics';
import {playSound} from '../utils/sound';

type Props = NativeStackScreenProps<RootStackParamList, 'GameOver'>;

export function GameOverScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const winner = useGameStore(s => s.winner);
  const scores = useGameStore(s => s.scores);
  const playerName = useGameStore(s => s.playerName);
  const resetForNewGame = useGameStore(s => s.resetForNewGame);
  const leaderboard = sortLeaderboard(scores);
  const won = winner === playerName;

  useEffect(() => {
    if (won) {
      haptics.victory();
      playSound('victory');
    }
  }, [won]);

  return (
    <View style={[styles.container, {paddingTop: insets.top + spacing.lg}]}>
      <AnimatedBackground />
      {won && <Confetti active count={28} />}
      <Text style={styles.over}>GAME OVER</Text>
      <Text style={styles.winnerLabel}>WINNER</Text>
      <Text style={styles.winner}>👑 {winner}</Text>
      <Text style={styles.points}>
        {(scores[winner ?? ''] ?? 0).toLocaleString()} POINTS
      </Text>
      {!won && (
        <Text style={styles.positive}>
          A noble effort — the court will remember you.
        </Text>
      )}

      <View style={styles.board}>
        <Text style={styles.boardTitle}>Final Standings</Text>
        {leaderboard.map(entry => (
          <View
            key={entry.name}
            style={[styles.row, entry.name === playerName && styles.self]}>
            <Text style={styles.rank}>{medalForRank(entry.rank)}</Text>
            <Text style={styles.name}>{entry.name}</Text>
            <Text style={styles.score}>{entry.score.toLocaleString()}</Text>
          </View>
        ))}
      </View>

      <PrimaryButton
        label="Play Again"
        onPress={() => {
          resetForNewGame();
          navigation.replace('JoinGame');
        }}
      />
      <PrimaryButton
        label="Back to Home"
        variant="secondary"
        onPress={() => {
          resetForNewGame();
          navigation.replace('Home');
        }}
        style={{marginTop: spacing.md}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  over: {
    ...typography.overline,
    color: colors.textMuted,
    textAlign: 'center',
  },
  winnerLabel: {
    ...typography.overline,
    color: colors.gold,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  winner: {
    ...typography.display,
    color: colors.cream,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  points: {
    ...typography.title,
    color: colors.gold,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  positive: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  board: {
    marginVertical: spacing.xl,
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  boardTitle: {
    ...typography.overline,
    color: colors.gold,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  self: {
    backgroundColor: colors.goldMuted,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
  },
  rank: {
    width: 36,
  },
  name: {
    ...typography.bodyBold,
    color: colors.text,
    flex: 1,
  },
  score: {
    ...typography.bodyBold,
    color: colors.gold,
  },
});
