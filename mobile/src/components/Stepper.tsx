import React, {memo} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing, radii} from '../theme/spacing';
import {haptics} from '../utils/haptics';

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

function StepperComponent({label, value, min, max, onChange}: Props) {
  const dec = () => {
    if (value <= min) {
      return;
    }
    haptics.select();
    onChange(value - 1);
  };
  const inc = () => {
    if (value >= max) {
      return;
    }
    haptics.select();
    onChange(value + 1);
  };

  return (
    <View style={styles.wrap} accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable
          onPress={dec}
          style={[styles.btn, value <= min && styles.disabled]}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}>
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Text style={styles.value}>{value}</Text>
        <Pressable
          onPress={inc}
          style={[styles.btn, value >= max && styles.disabled]}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}>
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const Stepper = memo(StepperComponent);

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.overline,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  btn: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.35,
  },
  btnText: {
    ...typography.title,
    color: colors.gold,
  },
  value: {
    ...typography.displaySm,
    color: colors.cream,
    minWidth: 48,
    textAlign: 'center',
  },
});
