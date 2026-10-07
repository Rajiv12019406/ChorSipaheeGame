import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AnimatedBackground} from '../components/AnimatedBackground';
import {Stepper} from '../components/Stepper';
import {PrimaryButton} from '../components/GuessButton';
import {GameCard} from '../components/GameCard';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing} from '../theme/spacing';
import type {RootStackParamList} from '../navigation/types';
import {useGameStore} from '../store/gameStore';
import {BOT_PERSONALITIES} from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'HostSetup'>;

export function HostSetupScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const pendingInput = useGameStore(s => s.pendingInput);
  const sendHostHumans = useGameStore(s => s.sendHostHumans);
  const sendHostRounds = useGameStore(s => s.sendHostRounds);
  const gamePhase = useGameStore(s => s.gamePhase);
  const [humans, setHumans] = useState(2);
  const [rounds, setRounds] = useState(5);
  const [humansSent, setHumansSent] = useState(false);

  useEffect(() => {
    if (gamePhase === 'lobby' || gamePhase === 'waiting') {
      navigation.replace('Lobby');
    } else if (gamePhase === 'role_reveal') {
      navigation.replace('Game');
    }
  }, [gamePhase, navigation]);

  const onContinue = () => {
    if (pendingInput?.kind === 'host_humans') {
      sendHostHumans(humans);
      setHumansSent(true);
      return;
    }
    if (pendingInput?.kind === 'host_rounds') {
      sendHostRounds(rounds);
    }
  };

  const waitingRounds =
    humansSent || pendingInput?.kind === 'host_rounds';
  const canSubmit =
    pendingInput?.kind === 'host_humans' ||
    pendingInput?.kind === 'host_rounds';

  return (
    <View style={[styles.container, {paddingTop: insets.top + spacing.md}]}>
      <AnimatedBackground />
      <Text style={styles.title}>Host Setup</Text>
      <Text style={styles.subtitle}>
        Empty seats will be filled by Smart Bots.
      </Text>

      <GameCard>
        {!waitingRounds || pendingInput?.kind === 'host_humans' ? (
          <Stepper
            label="Human Players"
            value={humans}
            min={1}
            max={4}
            onChange={setHumans}
          />
        ) : (
          <Stepper
            label="Rounds"
            value={rounds}
            min={pendingInput?.min ?? 3}
            max={pendingInput?.max ?? 20}
            onChange={setRounds}
          />
        )}

        <PrimaryButton
          label={
            pendingInput?.kind === 'host_rounds' || waitingRounds
              ? 'Start Game'
              : 'Continue'
          }
          onPress={onContinue}
          disabled={!canSubmit}
        />
      </GameCard>

      <View style={styles.bots}>
        <Text style={styles.botsTitle}>Bot personalities</Text>
        {Object.values(BOT_PERSONALITIES).map(bot => (
          <View key={bot.displayName} style={styles.botRow}>
            <Text style={styles.botName}>{bot.displayName}</Text>
            <Text style={styles.botDesc}>{bot.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.displaySm,
    color: colors.cream,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginVertical: spacing.md,
  },
  bots: {
    marginTop: spacing.xl,
  },
  botsTitle: {
    ...typography.overline,
    color: colors.gold,
    marginBottom: spacing.md,
  },
  botRow: {
    marginBottom: spacing.md,
  },
  botName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  botDesc: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
