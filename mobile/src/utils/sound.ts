/**
 * Sound abstraction.
 *
 * Place audio files under:
 *   src/assets/sounds/button.mp3
 *   src/assets/sounds/card_flip.mp3
 *   src/assets/sounds/role_reveal.mp3
 *   src/assets/sounds/correct.mp3
 *   src/assets/sounds/wrong.mp3
 *   src/assets/sounds/victory.mp3
 *   src/assets/sounds/music_loop.mp3
 *
 * Until assets are added, playSound is a no-op (logs in __DEV__).
 */

export type SoundId =
  | 'button'
  | 'card_flip'
  | 'role_reveal'
  | 'correct'
  | 'wrong'
  | 'victory'
  | 'music';

let soundEnabled = true;
let musicEnabled = true;

export function setSoundEnabled(value: boolean): void {
  soundEnabled = value;
}

export function setMusicEnabled(value: boolean): void {
  musicEnabled = value;
  if (!value) {
    stopMusic();
  }
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function isMusicEnabled(): boolean {
  return musicEnabled;
}

export function playSound(id: SoundId): void {
  if (id === 'music') {
    if (!musicEnabled) {
      return;
    }
  } else if (!soundEnabled) {
    return;
  }

  // Placeholder architecture — wire react-native-sound / expo-av alternative later.
  if (__DEV__) {
    console.log(`[sound] play "${id}" (add asset at src/assets/sounds/${id}.mp3)`);
  }
}

export function stopMusic(): void {
  if (__DEV__) {
    console.log('[sound] stop music');
  }
}
