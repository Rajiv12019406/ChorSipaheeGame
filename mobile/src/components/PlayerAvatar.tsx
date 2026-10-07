import React, {memo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing} from '../theme/spacing';

type Props = {
  name: string;
  size?: number;
  highlighted?: boolean;
  isBot?: boolean;
  isHost?: boolean;
  color?: string;
};

function PlayerAvatarComponent({
  name,
  size = 48,
  highlighted,
  isBot,
  isHost,
  color,
}: Props) {
  const initial = (name?.trim()?.[0] ?? '?').toUpperCase();
  const bg = color ?? (isBot ? colors.bgCardSoft : colors.bgCard);
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          borderColor: highlighted ? colors.gold : colors.border,
          borderWidth: highlighted ? 2 : 1,
        },
      ]}
      accessibilityLabel={`${name}${isHost ? ', host' : ''}${isBot ? ', bot' : ''}`}>
      <Text style={[styles.initial, {fontSize: size * 0.4}]}>{initial}</Text>
      {isHost && (
        <View style={styles.hostBadge}>
          <Text style={styles.hostText}>👑</Text>
        </View>
      )}
    </View>
  );
}

export const PlayerAvatar = memo(PlayerAvatarComponent);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    ...typography.bodyBold,
    color: colors.cream,
  },
  hostBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  hostText: {
    fontSize: 12,
  },
});
