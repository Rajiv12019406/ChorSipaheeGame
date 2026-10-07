import React, {memo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing, radii} from '../theme/spacing';
import type {ConnectionStatus} from '../api/types';

const LABELS: Record<ConnectionStatus, string> = {
  idle: 'Idle',
  connecting: 'Connecting',
  connected: 'Connected',
  disconnected: 'Disconnected',
  reconnecting: 'Reconnecting',
};

const DOT: Record<ConnectionStatus, string> = {
  idle: colors.textMuted,
  connecting: colors.warning,
  connected: colors.success,
  disconnected: colors.danger,
  reconnecting: colors.warning,
};

type Props = {
  status: ConnectionStatus;
  compact?: boolean;
};

function ConnectionStatusComponent({status, compact}: Props) {
  return (
    <View
      style={[styles.wrap, compact && styles.compact]}
      accessibilityRole="text"
      accessibilityLabel={`Connection status: ${LABELS[status]}`}>
      <View style={[styles.dot, {backgroundColor: DOT[status]}]} />
      {!compact && <Text style={styles.label}>{LABELS[status]}</Text>}
    </View>
  );
}

export const ConnectionStatusBadge = memo(ConnectionStatusComponent);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
