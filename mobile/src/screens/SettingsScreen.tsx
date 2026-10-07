import React from 'react';
import {View, Text, StyleSheet, Switch} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AnimatedBackground} from '../components/AnimatedBackground';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing, radii} from '../theme/spacing';
import type {RootStackParamList} from '../navigation/types';
import {useGameStore} from '../store/gameStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const settings = useGameStore(s => s.settings);
  const updateSettings = useGameStore(s => s.updateSettings);
  const wsHost = useGameStore(s => s.wsHost);
  const wsPort = useGameStore(s => s.wsPort);

  return (
    <View style={[styles.container, {paddingTop: insets.top + spacing.md}]}>
      <AnimatedBackground />
      <Text style={styles.title}>Settings</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Sound effects</Text>
        <Switch
          value={settings.soundEnabled}
          onValueChange={v => {
            void updateSettings({soundEnabled: v});
          }}
          trackColor={{true: colors.gold, false: colors.bgCardSoft}}
          accessibilityLabel="Toggle sound effects"
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Music</Text>
        <Switch
          value={settings.musicEnabled}
          onValueChange={v => {
            void updateSettings({musicEnabled: v});
          }}
          trackColor={{true: colors.gold, false: colors.bgCardSoft}}
          accessibilityLabel="Toggle music"
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Haptics</Text>
        <Switch
          value={settings.hapticsEnabled}
          onValueChange={v => {
            void updateSettings({hapticsEnabled: v});
          }}
          trackColor={{true: colors.gold, false: colors.bgCardSoft}}
          accessibilityLabel="Toggle haptics"
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>Current server</Text>
        <Text style={styles.infoBody}>
          ws://{wsHost}:{wsPort}
        </Text>
        <Text style={styles.hint}>
          Change the host on the Join Game screen. Emulator uses 10.0.2.2;
          physical devices need your PC LAN IP.
        </Text>
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
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodyBold,
    color: colors.text,
  },
  info: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.bgElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    ...typography.overline,
    color: colors.gold,
  },
  infoBody: {
    ...typography.body,
    color: colors.cream,
    marginTop: spacing.sm,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
