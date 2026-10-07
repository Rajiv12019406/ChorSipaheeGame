import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {PlayerCard} from '../components/PlayerCard';
import {PrimaryButton} from '../components/GuessButton';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing} from '../theme/spacing';

type Props = {
  options: string[];
  scores: Record<string, number>;
  playerName: string;
  selectedPlayer: string | null;
  onSelect: (name: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  confirming: boolean;
};

/** Focused guessing UI — composed into GameScreen. */
export function GuessScreen({
  options,
  scores,
  playerName,
  selectedPlayer,
  onSelect,
  onConfirm,
  onCancel,
  confirming,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>WHO IS THE CHOR?</Text>
      {options.map(name => (
        <PlayerCard
          key={name}
          player={{
            id: name,
            name,
            score: scores[name] ?? 0,
            isBot: /^Bot/i.test(name),
            isHost: false,
            isSelf: name === playerName,
          }}
          selected={selectedPlayer === name}
          onPress={() => onSelect(name)}
          large
        />
      ))}
      {confirming && selectedPlayer ? (
        <View style={styles.confirm}>
          <Text style={styles.selected}>{selectedPlayer} selected</Text>
          <PrimaryButton label="Confirm Guess" onPress={onConfirm} />
          <PrimaryButton label="Cancel" variant="ghost" onPress={onCancel} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1},
  title: {
    ...typography.displaySm,
    color: colors.cream,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  confirm: {marginTop: spacing.md, gap: spacing.sm},
  selected: {
    ...typography.subtitle,
    color: colors.gold,
    textAlign: 'center',
  },
});
