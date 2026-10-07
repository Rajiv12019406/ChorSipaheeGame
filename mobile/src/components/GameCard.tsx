import React, {memo} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing, radii} from '../theme/spacing';

type Props = {
  title?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  accent?: string;
};

function GameCardComponent({title, children, onPress, accent}: Props) {
  const body = (
    <View style={[styles.card, accent ? {borderColor: accent} : null]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
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

export const GameCard = memo(GameCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.gold,
    marginBottom: spacing.md,
  },
});
