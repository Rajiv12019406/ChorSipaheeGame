import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing, radii} from '../theme/spacing';
import {medalForRank, sortLeaderboard} from '../utils/gameUtils';

type Props = {
  scores: Record<string, number>;
  playerName: string;
};

export function ScoreboardScreen({scores, playerName}: Props) {
  const leaderboard = sortLeaderboard(scores);
  return (
    <View>
      <Text style={styles.title}>🏆 LEADERBOARD</Text>
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
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.displaySm,
    color: colors.cream,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  self: {borderWidth: 1, borderColor: colors.borderGold},
  rank: {width: 36},
  name: {...typography.bodyBold, color: colors.text, flex: 1},
  score: {...typography.title, color: colors.gold},
});
