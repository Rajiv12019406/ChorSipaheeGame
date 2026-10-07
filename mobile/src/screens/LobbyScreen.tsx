import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, ScrollView, BackHandler, Alert} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AnimatedBackground} from '../components/AnimatedBackground';
import {ConnectionStatusBadge} from '../components/ConnectionStatus';
import {PlayerCard} from '../components/PlayerCard';
import {PrimaryButton} from '../components/GuessButton';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing} from '../theme/spacing';
import type {RootStackParamList} from '../navigation/types';
import {useGameStore} from '../store/gameStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Lobby'>;

export function LobbyScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const players = useGameStore(s => s.players);
  const requiredHumans = useGameStore(s => s.requiredHumans);
  const isHost = useGameStore(s => s.isHost);
  const gamePhase = useGameStore(s => s.gamePhase);
  const pendingInput = useGameStore(s => s.pendingInput);
  const connectionStatus = useGameStore(s => s.connectionStatus);
  const playerName = useGameStore(s => s.playerName);
  const sendName = useGameStore(s => s.sendName);
  const infoMessages = useGameStore(s => s.infoMessages);
  const disconnect = useGameStore(s => s.disconnect);
  const nameSent = useRef(false);

  // Respond to name prompt once connected
  useEffect(() => {
    if (pendingInput?.kind === 'name' && playerName && !nameSent.current) {
      nameSent.current = true;
      sendName(playerName);
    }
  }, [pendingInput, playerName, sendName]);

  useEffect(() => {
    if (gamePhase === 'host_setup') {
      navigation.navigate('HostSetup');
    } else if (
      gamePhase === 'role_reveal' ||
      gamePhase === 'playing' ||
      gamePhase === 'guessing'
    ) {
      navigation.replace('Game');
    } else if (gamePhase === 'game_over') {
      navigation.replace('GameOver');
    }
  }, [gamePhase, navigation]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert('Leave lobby?', 'You will disconnect from the server.', [
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

  const humans = players.filter(p => !p.isBot);

  return (
    <View style={[styles.container, {paddingTop: insets.top + spacing.md}]}>
      <AnimatedBackground />
      <View style={styles.header}>
        <Text style={styles.title}>Royal Lobby</Text>
        <ConnectionStatusBadge status={connectionStatus} />
      </View>
      <Text style={styles.count}>
        Players: {humans.length}/{requiredHumans}
      </Text>
      {isHost && (
        <Text style={styles.hostNote}>You are the HOST</Text>
      )}

      <ScrollView style={styles.list} contentContainerStyle={{paddingBottom: spacing.xxl}}>
        {players.map(p => (
          <PlayerCard key={p.id} player={p} showScore={false} />
        ))}
        {players.length === 0 && (
          <Text style={styles.wait}>Gathering nobles…</Text>
        )}
        <View style={styles.log}>
          {infoMessages.slice(-5).map((m, i) => (
            <Text key={`${i}-${m}`} style={styles.logLine}>
              {m}
            </Text>
          ))}
        </View>
      </ScrollView>

      {isHost && pendingInput?.kind === 'host_humans' && (
        <PrimaryButton
          label="Configure Game"
          onPress={() => navigation.navigate('HostSetup')}
        />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.displaySm,
    color: colors.cream,
  },
  count: {
    ...typography.subtitle,
    color: colors.gold,
    marginTop: spacing.md,
  },
  hostNote: {
    ...typography.caption,
    color: colors.goldSoft,
    marginTop: spacing.xs,
  },
  list: {
    flex: 1,
    marginTop: spacing.lg,
  },
  wait: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  log: {
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  logLine: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
