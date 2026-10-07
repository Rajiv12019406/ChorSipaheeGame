import React, {memo} from 'react';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import Svg, {Defs, RadialGradient, Stop, Circle, Rect} from 'react-native-svg';
import {colors} from '../theme/colors';

type Props = {
  intensity?: number;
};

function AnimatedBackgroundComponent({intensity = 1}: Props) {
  const {width, height} = useWindowDimensions();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden>
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="g1" cx="20%" cy="15%" r="55%">
            <Stop offset="0%" stopColor={colors.gold} stopOpacity={0.14 * intensity} />
            <Stop offset="100%" stopColor={colors.bg} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="g2" cx="85%" cy="70%" r="50%">
            <Stop offset="0%" stopColor={colors.mantri} stopOpacity={0.12 * intensity} />
            <Stop offset="100%" stopColor={colors.bg} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="g3" cx="50%" cy="100%" r="45%">
            <Stop offset="0%" stopColor={colors.raja} stopOpacity={0.1 * intensity} />
            <Stop offset="100%" stopColor={colors.bg} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill={colors.bg} />
        <Rect x={0} y={0} width={width} height={height} fill="url(#g1)" />
        <Rect x={0} y={0} width={width} height={height} fill="url(#g2)" />
        <Rect x={0} y={0} width={width} height={height} fill="url(#g3)" />
        <Circle cx={width * 0.15} cy={height * 0.25} r={2} fill={colors.gold} opacity={0.35} />
        <Circle cx={width * 0.8} cy={height * 0.18} r={1.5} fill={colors.cream} opacity={0.25} />
        <Circle cx={width * 0.6} cy={height * 0.4} r={1.5} fill={colors.gold} opacity={0.2} />
        <Circle cx={width * 0.3} cy={height * 0.7} r={2} fill={colors.cream} opacity={0.15} />
      </Svg>
    </View>
  );
}

export const AnimatedBackground = memo(AnimatedBackgroundComponent);
