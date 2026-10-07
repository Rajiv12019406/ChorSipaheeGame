import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AnimatedBackground} from '../components/AnimatedBackground';
import {ConnectionStatusBadge} from '../components/ConnectionStatus';
import {PrimaryButton} from '../components/GuessButton';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing, radii} from '../theme/spacing';
import type {RootStackParamList} from '../navigation/types';
import {useGameStore} from '../store/gameStore';
import {validatePlayerName, validateServerHost} from '../utils/validation';
import {DEFAULT_WS_PORT} from '../config';

type Props = NativeStackScreenProps<RootStackParamList, 'JoinGame'>;

export function JoinGameScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const playerName = useGameStore(s => s.playerName);
  const wsHost = useGameStore(s => s.wsHost);
  const connectionStatus = useGameStore(s => s.connectionStatus);
  const connect = useGameStore(s => s.connect);
  const persistPlayerName = useGameStore(s => s.persistPlayerName);
  const persistEndpoint = useGameStore(s => s.persistEndpoint);
  const setWsHost = useGameStore(s => s.setWsHost);
  const setError = useGameStore(s => s.setError);
  const error = useGameStore(s => s.error);
  const clearError = useGameStore(s => s.clearError);

  const [name, setName] = useState(playerName);
  const [host, setHost] = useState(wsHost);
  const [nameError, setNameError] = useState<string | undefined>();
  const [hostError, setHostError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const onJoin = async () => {
    clearError();
    const nameResult = validatePlayerName(name);
    const hostResult = validateServerHost(host);
    setNameError(nameResult.error);
    setHostError(hostResult.error);
    if (!nameResult.valid || !hostResult.valid) {
      return;
    }

    setLoading(true);
    await persistPlayerName(nameResult.value);
    setWsHost(hostResult.value);
    await persistEndpoint();

    const ok = await connect();
    setLoading(false);
    if (!ok) {
      setError('Unable to connect to game server.');
      return;
    }
    // Server will send input_request name → store moves to join/lobby/host_setup
    // Navigate to Lobby shell; name response happens when prompt arrives
    navigation.replace('Lobby');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, {paddingTop: insets.top + spacing.md}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AnimatedBackground />
      <Text style={styles.title}>Join Game</Text>
      <ConnectionStatusBadge status={connectionStatus} />

      <View style={styles.form}>
        <Text style={styles.label}>Player name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.textMuted}
          maxLength={20}
          autoCapitalize="words"
          style={styles.input}
          accessibilityLabel="Player name"
        />
        {!!nameError && <Text style={styles.error}>{nameError}</Text>}

        <Text style={[styles.label, {marginTop: spacing.lg}]}>
          Server ({`ws://host:${DEFAULT_WS_PORT}`})
        </Text>
        <TextInput
          value={host}
          onChangeText={setHost}
          placeholder="10.0.2.2 or LAN IP"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          accessibilityLabel="Server host"
        />
        {!!hostError && <Text style={styles.error}>{hostError}</Text>}
        <Text style={styles.hint}>
          Emulator: 10.0.2.2 · Phone: your PC LAN IP
        </Text>

        {!!error && <Text style={styles.errorBanner}>{error}</Text>}

        <PrimaryButton
          label="Join Game"
          onPress={() => {
            void onJoin();
          }}
          loading={loading}
          style={{marginTop: spacing.xl}}
        />
        {!!error && (
          <PrimaryButton
            label="Retry"
            variant="secondary"
            onPress={() => {
              void onJoin();
            }}
            style={{marginTop: spacing.md}}
          />
        )}
      </View>
    </KeyboardAvoidingView>
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
    marginBottom: spacing.md,
  },
  form: {
    marginTop: spacing.xl,
  },
  label: {
    ...typography.overline,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  errorBanner: {
    ...typography.body,
    color: colors.danger,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
