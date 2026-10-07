import {Platform, Vibration} from 'react-native';

type HapticKind =
  | 'button'
  | 'cardFlip'
  | 'roleReveal'
  | 'select'
  | 'correct'
  | 'wrong'
  | 'victory';

let enabled = true;

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

export function areHapticsEnabled(): boolean {
  return enabled;
}

function vibratePattern(kind: HapticKind): void {
  if (!enabled || Platform.OS === 'web') {
    return;
  }
  try {
    // Prefer native haptic module when available
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactNativeHapticFeedback = require('react-native-haptic-feedback');
    const options = {enableVibrateFallback: true, ignoreAndroidSystemSettings: false};
    const map: Record<HapticKind, string> = {
      button: 'impactLight',
      cardFlip: 'impactMedium',
      roleReveal: 'impactHeavy',
      select: 'selection',
      correct: 'notificationSuccess',
      wrong: 'notificationError',
      victory: 'notificationSuccess',
    };
    ReactNativeHapticFeedback.trigger(map[kind], options);
  } catch {
    // Fallback to Vibration API
    const durations: Record<HapticKind, number | number[]> = {
      button: 12,
      cardFlip: 20,
      roleReveal: 35,
      select: 10,
      correct: [0, 30, 40, 30],
      wrong: [0, 50, 40, 50],
      victory: [0, 40, 50, 40, 50, 60],
    };
    Vibration.vibrate(durations[kind]);
  }
}

export const haptics = {
  button: () => vibratePattern('button'),
  cardFlip: () => vibratePattern('cardFlip'),
  roleReveal: () => vibratePattern('roleReveal'),
  select: () => vibratePattern('select'),
  correct: () => vibratePattern('correct'),
  wrong: () => vibratePattern('wrong'),
  victory: () => vibratePattern('victory'),
};
