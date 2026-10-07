import React, {memo} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {colors, roleColors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing, radii} from '../theme/spacing';
import type {Role} from '../api/types';
import {ROLE_POINTS} from '../api/types';

type Props = {
  role?: Role;
  faceDown?: boolean;
  onPress?: () => void;
  compact?: boolean;
};

function RoleCardComponent({role, faceDown, onPress, compact}: Props) {
  const accent = role ? roleColors[role] : colors.gold;

  const body = (
    <View
      style={[
        styles.card,
        compact && styles.compact,
        {borderColor: faceDown ? colors.borderGold : accent},
        !faceDown && role && {shadowColor: accent},
      ]}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={
        faceDown ? 'Hidden role card. Tap to reveal.' : `Your role is ${role}`
      }>
      {faceDown ? (
        <>
          <Text style={styles.emblem}>⚜</Text>
          <Text style={styles.faceDownTitle}>YOUR ROLE</Text>
          <Text style={styles.hint}>Tap to reveal</Text>
        </>
      ) : (
        <>
          <Text style={styles.overline}>YOUR ROLE</Text>
          <Text style={[styles.roleName, {color: accent}]}>{role}</Text>
          <Text style={styles.points}>
            {role ? ROLE_POINTS[role].toLocaleString() : '—'} POINTS
          </Text>
        </>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        {body}
      </Pressable>
    );
  }
  return body;
}

export const RoleCard = memo(RoleCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
  },
  compact: {
    minHeight: 140,
    paddingVertical: spacing.lg,
  },
  emblem: {
    fontSize: 42,
    color: colors.gold,
    marginBottom: spacing.md,
  },
  faceDownTitle: {
    ...typography.title,
    color: colors.cream,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  overline: {
    ...typography.overline,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  roleName: {
    ...typography.display,
    fontSize: 40,
  },
  points: {
    ...typography.subtitle,
    color: colors.goldSoft,
    marginTop: spacing.md,
  },
});
