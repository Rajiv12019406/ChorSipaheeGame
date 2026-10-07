import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, roleColors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing} from '../theme/spacing';
import type {RoundResult} from '../api/types';
import {formatPoints} from '../utils/gameUtils';

type Props = {
  result: RoundResult;
};

export function RoundResultScreen({result}: Props) {
  return (
    <View>
      <Text style={styles.title}>
        {result.correct ? 'CAUGHT!' : 'ESCAPED!'}
      </Text>
      <Text
        style={[
          styles.banner,
          {color: result.correct ? colors.success : colors.danger},
        ]}>
        {result.correct
          ? 'Sipahi found the Chor'
          : 'The Chor slipped away'}
      </Text>
      {Object.entries(result.allRoles).map(([name, role]) => (
        <View key={name} style={styles.row}>
          <Text style={styles.name}>{name}</Text>
          <Text style={{color: roleColors[role], fontWeight: '700'}}>{role}</Text>
          <Text style={styles.delta}>
            {formatPoints(result.scoreDeltas[name] ?? 0)}
          </Text>
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
  },
  banner: {
    ...typography.title,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  name: {...typography.body, color: colors.text, flex: 1},
  delta: {
    ...typography.bodyBold,
    color: colors.gold,
    width: 72,
    textAlign: 'right',
  },
});
