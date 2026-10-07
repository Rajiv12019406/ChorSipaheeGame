import React, {memo} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import Animated, {FadeInRight, FadeOutLeft} from 'react-native-reanimated';
import {PlayerAvatar} from './PlayerAvatar';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing, radii} from '../theme/spacing';
import type {Player} from '../api/types';
import {BOT_PERSONALITIES} from '../api/types';

type Props = {
  player: Player;
  onPress?: () => void;
  selected?: boolean;
  showScore?: boolean;
  large?: boolean;
};

function PlayerCardComponent({
  player,
  onPress,
  selected,
  showScore = true,
  large,
}: Props) {
  const personality =
    player.isBot && player.strategy
      ? BOT_PERSONALITIES[player.strategy]
      : player.isBot
        ? BOT_PERSONALITIES.random
        : null;

  const content = (
    <Animated.View
      entering={FadeInRight.duration(320)}
      exiting={FadeOutLeft.duration(220)}
      style={[
        styles.card,
        large && styles.large,
        selected && styles.selected,
        player.isSelf && styles.self,
      ]}>
      <PlayerAvatar
        name={player.name}
        size={large ? 56 : 44}
        highlighted={player.isSelf || selected}
        isBot={player.isBot}
        isHost={player.isHost}
      />
      <View style={styles.meta}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {player.name}
          </Text>
          {player.isHost && <Text style={styles.badge}>HOST</Text>}
          {player.isBot && <Text style={styles.botBadge}>BOT</Text>}
        </View>
        {personality && (
          <Text style={styles.personality} numberOfLines={1}>
            {personality.displayName}
          </Text>
        )}
        {showScore && (
          <Text style={styles.score}>{player.score.toLocaleString()} pts</Text>
        )}
      </View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{selected}}
        accessibilityLabel={`Select ${player.name}`}>
        {content}
      </Pressable>
    );
  }
  return content;
}

export const PlayerCard = memo(PlayerCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  large: {
    padding: spacing.lg,
  },
  selected: {
    borderColor: colors.gold,
    backgroundColor: colors.bgElevated,
  },
  self: {
    borderColor: colors.borderGold,
  },
  meta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    ...typography.bodyBold,
    color: colors.text,
    flexShrink: 1,
  },
  badge: {
    ...typography.overline,
    color: colors.gold,
    fontSize: 9,
  },
  botBadge: {
    ...typography.overline,
    color: colors.sipahi,
    fontSize: 9,
  },
  personality: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  score: {
    ...typography.caption,
    color: colors.goldSoft,
    marginTop: 2,
  },
});
