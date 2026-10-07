import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AnimatedBackground} from '../components/AnimatedBackground';
import {colors, roleColors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing} from '../theme/spacing';
import {durations} from '../theme/animations';
import type {RootStackParamList} from '../navigation/types';
import {useGameStore} from '../store/gameStore';
import {ROLES} from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({navigation}: Props) {
  const loadPersisted = useGameStore(s => s.loadPersisted);
  const setGamePhase = useGameStore(s => s.setGamePhase);
  const emblem = useSharedValue(0);

  useEffect(() => {
    void loadPersisted();
    emblem.value = withTiming(1, {duration: 700});

    const goHome = () => {
      setGamePhase('home');
      navigation.replace('Home');
    };

    const timer = setTimeout(goHome, durations.splash);
    return () => clearTimeout(timer);
  }, [loadPersisted, setGamePhase, navigation, emblem]);

  const emblemStyle = useAnimatedStyle(() => ({
    opacity: emblem.value,
    transform: [{scale: 0.85 + emblem.value * 0.15}],
  }));

  return (
    <View style={styles.container} accessibilityLabel="Raja Chor Mantri Sipahi splash">
      <AnimatedBackground />
      <Animated.View style={[styles.emblemWrap, emblemStyle]}>
        <Text style={styles.emblem}>⚜</Text>
      </Animated.View>
      <Animated.Text entering={FadeInUp.delay(400).duration(500)} style={styles.brand}>
        RAJA{'\n'}CHOR{'\n'}MANTRI{'\n'}SIPAHI
      </Animated.Text>
      <View style={styles.roles}>
        {ROLES.map((role, i) => (
          <Animated.View
            key={role}
            entering={ZoomIn.delay(700 + i * 120).duration(320)}
            style={[styles.roleChip, {borderColor: roleColors[role]}]}>
            <Text style={[styles.roleText, {color: roleColors[role]}]}>{role}</Text>
          </Animated.View>
        ))}
      </View>
      <Animated.View entering={FadeIn.delay(1400)} style={styles.particles}>
        <Text style={styles.particleHint}>Royal multiplayer</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emblemWrap: {
    marginBottom: spacing.lg,
  },
  emblem: {
    fontSize: 56,
    color: colors.gold,
  },
  brand: {
    ...typography.display,
    color: colors.cream,
    textAlign: 'center',
    lineHeight: 42,
  },
  roles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  roleChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  roleText: {
    ...typography.caption,
  },
  particles: {
    marginTop: spacing.xl,
  },
  particleHint: {
    ...typography.overline,
    color: colors.textMuted,
  },
});
