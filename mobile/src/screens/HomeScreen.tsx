import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AnimatedBackground} from '../components/AnimatedBackground';
import {PrimaryButton} from '../components/GuessButton';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing, radii} from '../theme/spacing';
import type {RootStackParamList} from '../navigation/types';
import {useGameStore} from '../store/gameStore';
import {ROLE_POINTS} from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const [howTo, setHowTo] = useState(false);
  const playerName = useGameStore(s => s.playerName);

  return (
    <View style={[styles.container, {paddingTop: insets.top + spacing.md}]}>
      <AnimatedBackground />
      <Animated.View entering={FadeInDown.duration(500)} style={styles.hero}>
        <Text style={styles.crown} accessibilityLabel="Royal crown">
          👑
        </Text>
        <Text style={styles.title}>
          RAJA CHOR{'\n'}MANTRI SIPAHI
        </Text>
        <Text style={styles.subtitle}>
          A royal multiplayer game of bluff & deduction
        </Text>
        {!!playerName && (
          <Text style={styles.welcome}>Welcome back, {playerName}</Text>
        )}
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(250).duration(450)} style={styles.actions}>
        <PrimaryButton
          label="Play Online"
          onPress={() => navigation.navigate('JoinGame')}
          style={styles.cta}
        />
        <PrimaryButton
          label="How to Play"
          variant="secondary"
          onPress={() => setHowTo(true)}
        />
        <PrimaryButton
          label="Settings"
          variant="ghost"
          onPress={() => navigation.navigate('Settings')}
        />
      </Animated.View>

      <Modal visible={howTo} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView>
              <Text style={styles.modalTitle}>How to Play</Text>
              <Text style={styles.modalBody}>
                Four roles are dealt each round. Only you see your role.
                {'\n\n'}
                Raja · {ROLE_POINTS.Raja} pts{'\n'}
                Mantri · {ROLE_POINTS.Mantri} pts{'\n'}
                Sipahi · {ROLE_POINTS.Sipahi} pts{'\n'}
                Chor · {ROLE_POINTS.Chor} pts
                {'\n\n'}
                The Sipahi must identify the Chor. A correct guess awards normal
                points. A wrong guess swaps Sipahi and Chor points.
              </Text>
            </ScrollView>
            <Pressable onPress={() => setHowTo(false)} style={styles.closeBtn}>
              <Text style={styles.closeText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  crown: {
    fontSize: 42,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.display,
    color: colors.cream,
    textAlign: 'center',
    lineHeight: 42,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    maxWidth: 320,
  },
  welcome: {
    ...typography.caption,
    color: colors.goldSoft,
    marginTop: spacing.md,
  },
  actions: {
    gap: spacing.md,
  },
  cta: {
    minHeight: 58,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderGold,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    ...typography.title,
    color: colors.gold,
    marginBottom: spacing.md,
  },
  modalBody: {
    ...typography.body,
    color: colors.text,
  },
  closeBtn: {
    marginTop: spacing.lg,
    alignItems: 'center',
    padding: spacing.md,
  },
  closeText: {
    ...typography.button,
    color: colors.gold,
  },
});
