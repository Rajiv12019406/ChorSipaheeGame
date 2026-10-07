import React, {memo, useMemo} from 'react';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {colors} from '../theme/colors';

type Props = {
  active?: boolean;
  count?: number;
};

function ConfettiComponent({active = true, count = 18}: Props) {
  const {width, height} = useWindowDimensions();
  const dots = useMemo(() => {
    if (!active) {
      return [];
    }
    return Array.from({length: count}).map((_, i) => ({
      id: i,
      cx: ((i * 97) % width) + (i % 7) * 3,
      cy: ((i * 53) % (height * 0.55)) + 40,
      r: 2 + (i % 3),
      color: [colors.gold, colors.raja, colors.mantri, colors.sipahi, colors.cream][
        i % 5
      ],
      opacity: 0.35 + (i % 4) * 0.1,
    }));
  }, [active, count, width, height]);

  if (!active) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        {dots.map(d => (
          <Circle
            key={d.id}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill={d.color}
            opacity={d.opacity}
          />
        ))}
      </Svg>
    </View>
  );
}

export const Confetti = memo(ConfettiComponent);
