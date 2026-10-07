import React, {memo, useEffect} from 'react';
import {Text, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from 'react-native-reanimated';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';

const AnimatedText = Animated.createAnimatedComponent(Text);

type Props = {
  value: number;
  duration?: number;
  prefix?: string;
  style?: object;
  highlighted?: boolean;
};

function ScoreCardComponent({
  value,
  duration = 800,
  prefix = '',
  style,
  highlighted,
}: Props) {
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withTiming(value, {duration});
  }, [value, duration, anim]);

  const animatedProps = useAnimatedProps(() => {
    return {
      text: `${prefix}${Math.round(anim.value).toLocaleString()}`,
    } as {text: string};
  });

  return (
    <AnimatedText
      // @ts-expect-error animated text prop
      animatedProps={animatedProps}
      style={[styles.score, highlighted && styles.highlighted, style]}>
      {`${prefix}${value.toLocaleString()}`}
    </AnimatedText>
  );
}

export const ScoreCard = memo(ScoreCardComponent);

const styles = StyleSheet.create({
  score: {
    ...typography.title,
    color: colors.gold,
  },
  highlighted: {
    color: colors.goldSoft,
  },
});
