import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ConnectionStatus,
  GamePhase,
  PendingInput,
  Player,
  Role,
  RoundResult,
} from '../api/types';
import type {ServerMessage} from '../api/protocol';
import {
  isHostHumansPrompt,
  isSipahiGuessPrompt,
  isYouAreHost,
  parseBotsAdded,
  parseJoinInfo,
  parseWaitingInfo,
} from '../api/protocol';
import {gameSocket} from '../api/websocket';
import {config, setWsEndpoint, buildWsUrl} from '../config';
import {isBotName, parseHumansChoice, humansChoiceLabel} from '../utils/gameUtils';
import {clamp} from '../utils/validation';
import {
  setHapticsEnabled,
  areHapticsEnabled,
} from '../utils/haptics';
import {
  setSoundEnabled,
  setMusicEnabled,
  isSoundEnabled,
  isMusicEnabled,
} from '../utils/sound';

const STORAGE_KEYS = {
  playerName: '@rcms/playerName',
  wsHost: '@rcms/wsHost',
  wsPort: '@rcms/wsPort',
  sound: '@rcms/sound',
  music: '@rcms/music',
  haptics: '@rcms/haptics',
} as const;

type Settings = {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
};

type GameStore = {
  playerName: string;
  players: Player[];
  isHost: boolean;
  connectionStatus: ConnectionStatus;
  wsHost: string;
  wsPort: number;
  currentRound: number;
  totalRounds: number;
  requiredHumans: number;
  role: Role | null;
  scores: Record<string, number>;
  gamePhase: GamePhase;
  pendingInput: PendingInput | null;
  selectedPlayer: string | null;
  sipahiName: string | null;
  chorOptions: string[];
  lastRoundResult: RoundResult | null;
  winner: string | null;
  infoMessages: string[];
  error: string | null;
  settings: Settings;
  suspenseActive: boolean;
  lastGuess: string | null;
  socketBound: boolean;

  setPlayerName: (name: string) => void;
  setWsHost: (host: string) => void;
  setWsPort: (port: number) => void;
  setGamePhase: (phase: GamePhase) => void;
  setSelectedPlayer: (name: string | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setSuspenseActive: (value: boolean) => void;

  loadPersisted: () => Promise<void>;
  persistPlayerName: (name: string) => Promise<void>;
  persistEndpoint: () => Promise<void>;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;

  bindSocket: () => void;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  sendName: (name: string) => void;
  sendHostHumans: (count: number) => void;
  sendHostRounds: (rounds: number) => void;
  sendGuess: (playerName: string) => void;
  handleServerMessage: (message: ServerMessage) => void;
  resetForNewGame: () => void;
  resetSession: () => void;
};

function upsertPlayer(
  players: Player[],
  name: string,
  patch: Partial<Player>,
): Player[] {
  const idx = players.findIndex(p => p.name === name);
  if (idx === -1) {
    return [
      ...players,
      {
        id: name,
        name,
        score: 0,
        isBot: isBotName(name),
        isHost: false,
        isSelf: false,
        ...patch,
      },
    ];
  }
  const next = [...players];
  next[idx] = {...next[idx], ...patch};
  return next;
}

export const useGameStore = create<GameStore>((set, get) => ({
  playerName: '',
  players: [],
  isHost: false,
  connectionStatus: 'idle',
  wsHost: config.wsHost,
  wsPort: config.wsPort,
  currentRound: 0,
  totalRounds: 5,
  requiredHumans: 4,
  role: null,
  scores: {},
  gamePhase: 'splash',
  pendingInput: null,
  selectedPlayer: null,
  sipahiName: null,
  chorOptions: [],
  lastRoundResult: null,
  winner: null,
  infoMessages: [],
  error: null,
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    hapticsEnabled: true,
  },
  suspenseActive: false,
  lastGuess: null,
  socketBound: false,

  setPlayerName: name => set({playerName: name}),
  setWsHost: host => {
    set({wsHost: host});
    setWsEndpoint(host, get().wsPort);
  },
  setWsPort: port => {
    set({wsPort: port});
    setWsEndpoint(get().wsHost, port);
  },
  setGamePhase: phase => set({gamePhase: phase}),
  setSelectedPlayer: name => set({selectedPlayer: name}),
  setError: error => set({error}),
  clearError: () => set({error: null}),
  setSuspenseActive: value => set({suspenseActive: value}),

  loadPersisted: async () => {
    try {
      const map = await AsyncStorage.getMany([
        STORAGE_KEYS.playerName,
        STORAGE_KEYS.wsHost,
        STORAGE_KEYS.wsPort,
        STORAGE_KEYS.sound,
        STORAGE_KEYS.music,
        STORAGE_KEYS.haptics,
      ]);
      const playerName = map[STORAGE_KEYS.playerName] ?? '';
      const wsHost = map[STORAGE_KEYS.wsHost] ?? config.wsHost;
      const wsPort = Number(map[STORAGE_KEYS.wsPort] ?? config.wsPort);
      const soundEnabled = map[STORAGE_KEYS.sound] !== '0';
      const musicEnabled = map[STORAGE_KEYS.music] !== '0';
      const hapticsEnabled = map[STORAGE_KEYS.haptics] !== '0';

      setSoundEnabled(soundEnabled);
      setMusicEnabled(musicEnabled);
      setHapticsEnabled(hapticsEnabled);
      setWsEndpoint(wsHost, wsPort);

      set({
        playerName,
        wsHost,
        wsPort,
        settings: {soundEnabled, musicEnabled, hapticsEnabled},
      });
    } catch (err) {
      if (__DEV__) {
        console.warn('[store] loadPersisted failed', err);
      }
    }
  },

  persistPlayerName: async name => {
    set({playerName: name});
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.playerName, name);
    } catch {
      // ignore
    }
  },

  persistEndpoint: async () => {
    const {wsHost, wsPort} = get();
    setWsEndpoint(wsHost, wsPort);
    try {
      await AsyncStorage.setMany({
        [STORAGE_KEYS.wsHost]: wsHost,
        [STORAGE_KEYS.wsPort]: String(wsPort),
      });
    } catch {
      // ignore
    }
  },

  updateSettings: async partial => {
    const next = {...get().settings, ...partial};
    set({settings: next});
    if (partial.soundEnabled !== undefined) {
      setSoundEnabled(partial.soundEnabled);
    }
    if (partial.musicEnabled !== undefined) {
      setMusicEnabled(partial.musicEnabled);
    }
    if (partial.hapticsEnabled !== undefined) {
      setHapticsEnabled(partial.hapticsEnabled);
    }
    try {
      await AsyncStorage.setMany({
        [STORAGE_KEYS.sound]: next.soundEnabled ? '1' : '0',
        [STORAGE_KEYS.music]: next.musicEnabled ? '1' : '0',
        [STORAGE_KEYS.haptics]: next.hapticsEnabled ? '1' : '0',
      });
    } catch {
      // ignore
    }
  },

  bindSocket: () => {
    if (get().socketBound) {
      return;
    }
    gameSocket.onStatus(status => set({connectionStatus: status}));
    gameSocket.onError(userMessage => set({error: userMessage}));
    gameSocket.subscribe(message => get().handleServerMessage(message));
    set({socketBound: true});
  },

  connect: async () => {
    const {wsHost, wsPort, bindSocket} = get();
    bindSocket();
    set({error: null});
    try {
      await gameSocket.connect(buildWsUrl(wsHost, wsPort));
      return true;
    } catch {
      set({
        error: 'Unable to connect to game server.',
        connectionStatus: 'disconnected',
      });
      return false;
    }
  },

  disconnect: () => {
    gameSocket.disconnect();
  },

  sendName: name => {
    gameSocket.send({type: 'response', value: name});
    set(state => ({
      playerName: name,
      players: upsertPlayer(state.players, name, {
        isSelf: true,
        isHost: state.isHost,
      }),
      pendingInput: null,
      gamePhase: state.isHost ? 'host_setup' : 'lobby',
    }));
  },

  sendHostHumans: count => {
    const clamped = clamp(count, 1, 4);
    gameSocket.send({type: 'response', value: humansChoiceLabel(clamped)});
    set({
      requiredHumans: clamped,
      pendingInput: null,
    });
  },

  sendHostRounds: rounds => {
    const clamped = clamp(rounds, 3, 20);
    gameSocket.send({type: 'response', value: clamped});
    set({
      totalRounds: clamped,
      pendingInput: null,
      gamePhase: 'lobby',
    });
  },

  sendGuess: playerName => {
    gameSocket.send({type: 'response', value: playerName});
    set({
      lastGuess: playerName,
      selectedPlayer: null,
      pendingInput: null,
      suspenseActive: true,
      gamePhase: 'round_result',
    });
  },

  handleServerMessage: message => {
    switch (message.type) {
      case 'input_request': {
        if (message.prompt === 'name') {
          set({
            pendingInput: {kind: 'name'},
            gamePhase: 'join',
          });
          return;
        }
        if (message.prompt === 'choose_chor') {
          if (isHostHumansPrompt(message)) {
            set({
              isHost: true,
              pendingInput: {
                kind: 'host_humans',
                title: message.title,
                options: message.options,
              },
              gamePhase: 'host_setup',
              players: get().players.map(p =>
                p.isSelf ? {...p, isHost: true} : p,
              ),
            });
            return;
          }
          if (isSipahiGuessPrompt(message)) {
            set({
              pendingInput: {
                kind: 'guess_chor',
                title: message.title ?? 'Who is the Chor?',
                options: message.options,
              },
              chorOptions: message.options,
              gamePhase: 'guessing',
              selectedPlayer: null,
            });
          }
          return;
        }
        if (message.prompt === 'number_input') {
          set({
            isHost: true,
            pendingInput: {
              kind: 'host_rounds',
              title: message.title,
              min: message.min,
              max: message.max,
            },
            gamePhase: 'host_setup',
          });
        }
        return;
      }
      case 'info': {
        const msg = message.message;
        const join = parseJoinInfo(msg);
        const waiting = parseWaitingInfo(msg);
        const bots = parseBotsAdded(msg);
        let players = get().players;
        let requiredHumans = get().requiredHumans;
        let isHost = get().isHost;
        let gamePhase = get().gamePhase;

        if (isYouAreHost(msg)) {
          isHost = true;
        }

        if (join) {
          requiredHumans = join.required;
          players = upsertPlayer(players, join.playerName, {
            isSelf: join.playerName === get().playerName,
            isHost: players.length === 0 && join.playerName === get().playerName,
          });
          // Ensure we reflect count even if we missed some joins
          if (
            gamePhase === 'join' ||
            gamePhase === 'host_setup' ||
            gamePhase === 'lobby' ||
            gamePhase === 'waiting'
          ) {
            gamePhase = get().isHost && get().pendingInput ? 'host_setup' : 'lobby';
          }
        }

        if (waiting !== null) {
          gamePhase = 'lobby';
        }

        if (bots !== null) {
          // Server filled remaining seats; synthesize bot seats for UI
          const humans = players.filter(p => !p.isBot);
          const needed = Math.max(0, 4 - humans.length);
          for (let i = 1; i <= needed; i++) {
            const botName = `Bot_${i}`;
            if (!players.some(p => p.name === botName)) {
              players = upsertPlayer(players, botName, {isBot: true});
            }
          }
          gamePhase = 'waiting';
        }

        // Host confirmed humans count via info
        const humansSet = msg.match(/Set to (\d+) human/i);
        if (humansSet) {
          requiredHumans = Number(humansSet[1]);
        }
        const roundsSet = msg.match(/Game set for (\d+) rounds/i);
        const totalRounds = roundsSet
          ? Number(roundsSet[1])
          : get().totalRounds;

        set(state => ({
          infoMessages: [...state.infoMessages.slice(-40), msg],
          players,
          requiredHumans,
          isHost,
          totalRounds,
          gamePhase,
        }));
        return;
      }
      case 'round_start':
        set({
          currentRound: message.round,
          totalRounds: message.total,
          role: null,
          lastRoundResult: null,
          sipahiName: null,
          chorOptions: [],
          selectedPlayer: null,
          suspenseActive: false,
          lastGuess: null,
          gamePhase: 'role_reveal',
        });
        return;
      case 'role_reveal':
        set({
          role: message.role,
          gamePhase: 'role_reveal',
        });
        return;
      case 'sipahi_turn':
        set({
          sipahiName: message.sipahi,
          chorOptions: message.chor_options ?? [],
          gamePhase:
            message.sipahi === get().playerName ? 'guessing' : 'playing',
        });
        return;
      case 'round_end':
        set(state => {
          const scores = {...state.scores};
          Object.entries(message.scores).forEach(([name, delta]) => {
            scores[name] = (scores[name] ?? 0) + delta;
          });
          const players = Object.keys({
            ...Object.fromEntries(state.players.map(p => [p.name, p])),
            ...message.all_roles,
          }).reduce<Player[]>((acc, name) => {
            const existing = state.players.find(p => p.name === name);
            acc.push({
              id: name,
              name,
              score: scores[name] ?? existing?.score ?? 0,
              isBot: existing?.isBot ?? isBotName(name),
              isHost: existing?.isHost ?? false,
              isSelf: name === state.playerName,
              role: message.all_roles[name],
            });
            return acc;
          }, []);

          // Side-effect feedback (safe; settings gated inside helpers)
          try {
            const {haptics} = require('../utils/haptics');
            const {playSound} = require('../utils/sound');
            if (message.correct) {
              haptics.correct();
              playSound('correct');
            } else {
              haptics.wrong();
              playSound('wrong');
            }
          } catch {
            // ignore
          }

          return {
            lastRoundResult: {
              correct: message.correct,
              allRoles: message.all_roles,
              scoreDeltas: message.scores,
            },
            scores,
            players,
            suspenseActive: false,
            gamePhase: 'round_result',
          };
        });
        return;
      case 'scoreboard':
        set(state => ({
          scores: message.scores,
          players: Object.entries(message.scores).map(([name, score]) => {
            const existing = state.players.find(p => p.name === name);
            return {
              id: name,
              name,
              score,
              isBot: existing?.isBot ?? isBotName(name),
              isHost: existing?.isHost ?? false,
              isSelf: name === state.playerName,
              role: existing?.role ?? state.lastRoundResult?.allRoles[name],
            };
          }),
          gamePhase: 'scoreboard',
        }));
        return;
      case 'game_over':
        set(state => ({
          winner: message.winner,
          scores: message.final_scores,
          players: Object.entries(message.final_scores).map(([name, score]) => {
            const existing = state.players.find(p => p.name === name);
            return {
              id: name,
              name,
              score,
              isBot: existing?.isBot ?? isBotName(name),
              isHost: existing?.isHost ?? false,
              isSelf: name === state.playerName,
              role: existing?.role,
            };
          }),
          gamePhase: 'game_over',
          pendingInput: null,
        }));
        return;
      case 'error':
        set({
          error:
            message.message === 'Game Full'
              ? 'This game is full. Try again later.'
              : message.message,
        });
        return;
      default:
        return;
    }
  },

  resetForNewGame: () => {
    gameSocket.disconnect();
    set({
      players: [],
      isHost: false,
      currentRound: 0,
      totalRounds: 5,
      requiredHumans: 4,
      role: null,
      scores: {},
      pendingInput: null,
      selectedPlayer: null,
      sipahiName: null,
      chorOptions: [],
      lastRoundResult: null,
      winner: null,
      infoMessages: [],
      error: null,
      suspenseActive: false,
      lastGuess: null,
      gamePhase: 'home',
      connectionStatus: 'disconnected',
    });
  },

  resetSession: () => {
    set({
      players: [],
      isHost: false,
      currentRound: 0,
      role: null,
      scores: {},
      pendingInput: null,
      selectedPlayer: null,
      sipahiName: null,
      chorOptions: [],
      lastRoundResult: null,
      winner: null,
      infoMessages: [],
      suspenseActive: false,
      lastGuess: null,
    });
  },
}));

export function getSettingsSnapshot(): Settings {
  return {
    soundEnabled: isSoundEnabled(),
    musicEnabled: isMusicEnabled(),
    hapticsEnabled: areHapticsEnabled(),
  };
}

// Re-export helper used by host setup UI
export {parseHumansChoice, humansChoiceLabel};
