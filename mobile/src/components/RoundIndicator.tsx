import React, {memo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing, radii} from '../theme/spacing';

type Props = {
  current: number;
  total: number;
};

function RoundIndicatorComponent({current, total}: Props) {
  return (
    <View
      style={styles.wrap}
      accessibilityRole="text"
      accessibilityLabel={`Round ${current} of ${total}`}>
      <Text style={styles.label}>ROUND</Text>
      <Text style={styles.value}>
        {current} / {total}
      </Text>
    </View>
  );
}

export const RoundIndicator = memo(RoundIndicatorComponent);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  label: {
    ...typography.overline,
    color: colors.textMuted,
  },
  value: {
    ...typography.title,
    color: colors.gold,
  },
});
