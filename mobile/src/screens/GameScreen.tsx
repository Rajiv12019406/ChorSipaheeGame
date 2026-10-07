import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  BackHandler,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AnimatedBackground} from '../components/AnimatedBackground';
import {RoleCard} from '../components/RoleCard';
import {RoundIndicator} from '../components/RoundIndicator';
import {PlayerCard} from '../components/PlayerCard';
import {ConnectionStatusBadge} from '../components/ConnectionStatus';
import {PrimaryButton} from '../components/GuessButton';
import {Confetti} from '../components/Confetti';
import {colors, roleColors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing, radii} from '../theme/spacing';
import type {RootStackParamList} from '../navigation/types';
import {useGameStore} from '../store/gameStore';
import {haptics} from '../utils/haptics';
import {playSound} from '../utils/sound';
import {formatPoints, medalForRank, sortLeaderboard} from '../utils/gameUtils';
import {ROLE_POINTS} from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export function GameScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const gamePhase = useGameStore(s => s.gamePhase);
  const role = useGameStore(s => s.role);
  const players = useGameStore(s => s.players);
  const currentRound = useGameStore(s => s.currentRound);
  const totalRounds = useGameStore(s => s.totalRounds);
  const sipahiName = useGameStore(s => s.sipahiName);
  const chorOptions = useGameStore(s => s.chorOptions);
  const pendingInput = useGameStore(s => s.pendingInput);
  const selectedPlayer = useGameStore(s => s.selectedPlayer);
  const setSelectedPlayer = useGameStore(s => s.setSelectedPlayer);
  const sendGuess = useGameStore(s => s.sendGuess);
  const lastRoundResult = useGameStore(s => s.lastRoundResult);
  const scores = useGameStore(s => s.scores);
  const winner = useGameStore(s => s.winner);
  const connectionStatus = useGameStore(s => s.connectionStatus);
  const playerName = useGameStore(s => s.playerName);
  const disconnect = useGameStore(s => s.disconnect);
  const suspenseActive = useGameStore(s => s.suspenseActive);
  const [revealed, setRevealed] = useState(false);
  const [confirmGuess, setConfirmGuess] = useState(false);
  const flip = useSharedValue(0);

  useEffect(() => {
    setRevealed(false);
    flip.value = 0;
    setConfirmGuess(false);
    setSelectedPlayer(null);
  }, [currentRound, flip, setSelectedPlayer]);

  useEffect(() => {
    if (gamePhase === 'game_over') {
      navigation.replace('GameOver');
    }
  }, [gamePhase, navigation]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert('Leave game?', 'You may lose your connection to this match.', [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            disconnect();
            navigation.replace('Home');
          },
        },
      ]);
      return true;
    });
    return () => sub.remove();
  }, [disconnect, navigation]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      {perspective: 1000},
      {rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg`},
    ],
    opacity: flip.value < 0.5 ? 1 : 0,
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      {perspective: 1000},
      {rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg`},
    ],
    opacity: flip.value >= 0.5 ? 1 : 0,
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  }));

  const onReveal = () => {
    if (!role || revealed) {
      return;
    }
    haptics.roleReveal();
    playSound('role_reveal');
    playSound('card_flip');
    flip.value = withTiming(1, {duration: 650});
    setRevealed(true);
  };

  const onSelectCandidate = (name: string) => {
    haptics.select();
    setSelectedPlayer(name);
    setConfirmGuess(true);
  };

  const onConfirmGuess = () => {
    if (!selectedPlayer) {
      return;
    }
    sendGuess(selectedPlayer);
    setConfirmGuess(false);
  };

  const leaderboard = sortLeaderboard(scores);
  const showGuess =
    gamePhase === 'guessing' && pendingInput?.kind === 'guess_chor';
  const options = pendingInput?.options ?? chorOptions;

  return (
    <View style={[styles.container, {paddingTop: insets.top + spacing.sm}]}>
      <AnimatedBackground intensity={0.85} />
      {(gamePhase === 'round_result' && lastRoundResult?.correct) ||
      (winner === playerName) ? (
        <Confetti active />
      ) : null}

      <View style={styles.top}>
        <RoundIndicator current={currentRound} total={totalRounds} />
        <ConnectionStatusBadge status={connectionStatus} compact />
      </View>

      {connectionStatus === 'reconnecting' ||
      connectionStatus === 'disconnected' ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Connection lost. Reconnecting…
          </Text>
        </View>
      ) : null}

      {/* Role reveal */}
      {(gamePhase === 'role_reveal' || (role && !revealed && gamePhase === 'playing')) && (
        <View style={styles.section}>
          <View style={styles.flipContainer}>
            <Animated.View style={frontStyle}>
              <RoleCard faceDown onPress={onReveal} />
            </Animated.View>
            <Animated.View style={backStyle}>
              <RoleCard role={role ?? undefined} />
            </Animated.View>
          </View>
          {revealed && sipahiName && (
            <Text style={styles.sipahiNote}>
              {sipahiName} is the Sipahi
            </Text>
          )}
        </View>
      )}

      {/* Table / players */}
      {(gamePhase === 'playing' ||
        gamePhase === 'guessing' ||
        (gamePhase === 'role_reveal' && revealed)) &&
        !showGuess && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Royal Table</Text>
            {players.map(p => (
              <PlayerCard key={p.id} player={p} />
            ))}
            {sipahiName && sipahiName !== playerName && (
              <Text style={styles.waitText}>
                Waiting for {sipahiName} to find the Chor…
              </Text>
            )}
          </View>
        )}

      {/* Guess */}
      {showGuess && (
        <View style={styles.section}>
          <Text style={styles.guessTitle}>WHO IS THE CHOR?</Text>
          {options.map(name => (
            <PlayerCard
              key={name}
              player={{
                id: name,
                name,
                score: scores[name] ?? 0,
                isBot: /^Bot/i.test(name),
                isHost: false,
                isSelf: name === playerName,
              }}
              selected={selectedPlayer === name}
              onPress={() => onSelectCandidate(name)}
              large
            />
          ))}
          {confirmGuess && selectedPlayer && (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmText}>
                {selectedPlayer} selected
              </Text>
              <PrimaryButton label="Confirm Guess" onPress={onConfirmGuess} />
              <PrimaryButton
                label="Cancel"
                variant="ghost"
                onPress={() => {
                  setConfirmGuess(false);
                  setSelectedPlayer(null);
                }}
              />
            </View>
          )}
        </View>
      )}

      {/* Suspense / round result */}
      {(gamePhase === 'round_result' || suspenseActive) && lastRoundResult && (
        <View style={styles.section}>
          <Text style={styles.guessTitle}>
            {lastRoundResult.correct ? 'CAUGHT!' : 'ESCAPED!'}
          </Text>
          <Text
            style={[
              styles.resultBanner,
              {
                color: lastRoundResult.correct
                  ? colors.success
                  : colors.danger,
              },
            ]}>
            {lastRoundResult.correct
              ? 'Sipahi found the Chor'
              : 'The Chor slipped away'}
          </Text>
          {Object.entries(lastRoundResult.allRoles).map(([name, r]) => (
            <View key={name} style={styles.roleRow}>
              <Text style={styles.roleName}>{name}</Text>
              <Text style={{color: roleColors[r], ...typography.bodyBold}}>
                {r}
              </Text>
              <Text style={styles.delta}>
                {formatPoints(lastRoundResult.scoreDeltas[name] ?? 0)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Scoreboard mid-game */}
      {gamePhase === 'scoreboard' && (
        <View style={styles.section}>
          <Text style={styles.guessTitle}>🏆 LEADERBOARD</Text>
          {leaderboard.map(entry => (
            <View
              key={entry.name}
              style={[
                styles.lbRow,
                entry.name === playerName && styles.lbSelf,
              ]}>
              <Text style={styles.lbRank}>{medalForRank(entry.rank)}</Text>
              <Text style={styles.lbName}>{entry.name}</Text>
              <Text style={styles.lbScore}>
                {entry.score.toLocaleString()}
              </Text>
            </View>
          ))}
          <Text style={styles.waitText}>Next round starting…</Text>
        </View>
      )}

      {role && revealed && gamePhase === 'role_reveal' && (
        <Text style={styles.secretHint}>
          Keep it secret · {role} · {ROLE_POINTS[role]} pts
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  banner: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bannerText: {
    ...typography.body,
    color: colors.warning,
    textAlign: 'center',
  },
  section: {
    flex: 1,
  },
  flipContainer: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.overline,
    color: colors.gold,
    marginBottom: spacing.md,
  },
  sipahiNote: {
    ...typography.subtitle,
    color: colors.sipahi,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  waitText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  guessTitle: {
    ...typography.displaySm,
    color: colors.cream,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  confirmBox: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  confirmText: {
    ...typography.subtitle,
    color: colors.gold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  resultBanner: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  roleName: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  delta: {
    ...typography.bodyBold,
    color: colors.gold,
    width: 72,
    textAlign: 'right',
  },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  lbSelf: {
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  lbRank: {
    width: 36,
    ...typography.body,
  },
  lbName: {
    ...typography.bodyBold,
    color: colors.text,
    flex: 1,
  },
  lbScore: {
    ...typography.title,
    color: colors.gold,
  },
  secretHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
