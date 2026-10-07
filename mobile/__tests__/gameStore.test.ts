import {useGameStore} from '../src/store/gameStore';

describe('gameStore message handling', () => {
  beforeEach(() => {
    useGameStore.setState({
      playerName: 'Rajiv',
      players: [],
      isHost: false,
      currentRound: 0,
      totalRounds: 5,
      requiredHumans: 4,
      role: null,
      scores: {},
      gamePhase: 'lobby',
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
    });
  });

  it('handles join info', () => {
    useGameStore.getState().handleServerMessage({
      type: 'info',
      message: 'Rajiv joined! (1/2)',
    });
    const state = useGameStore.getState();
    expect(state.requiredHumans).toBe(2);
    expect(state.players.some(p => p.name === 'Rajiv')).toBe(true);
  });

  it('handles role reveal', () => {
    useGameStore.getState().handleServerMessage({
      type: 'role_reveal',
      role: 'Sipahi',
    });
    expect(useGameStore.getState().role).toBe('Sipahi');
    expect(useGameStore.getState().gamePhase).toBe('role_reveal');
  });

  it('handles round end and scoreboard', () => {
    useGameStore.getState().handleServerMessage({
      type: 'round_end',
      correct: false,
      all_roles: {
        Rajiv: 'Sipahi',
        Arjun: 'Chor',
        Bot_1: 'Raja',
        Bot_2: 'Mantri',
      },
      scores: {Rajiv: 0, Arjun: 500, Bot_1: 1000, Bot_2: 800},
    });
    const afterRound = useGameStore.getState();
    expect(afterRound.lastRoundResult?.correct).toBe(false);
    expect(afterRound.gamePhase).toBe('round_result');

    useGameStore.getState().handleServerMessage({
      type: 'scoreboard',
      scores: {Rajiv: 0, Arjun: 500, Bot_1: 1000, Bot_2: 800},
    });
    expect(useGameStore.getState().gamePhase).toBe('scoreboard');
  });

  it('handles game over', () => {
    useGameStore.getState().handleServerMessage({
      type: 'game_over',
      winner: 'Bot_1',
      final_scores: {Rajiv: 1000, Bot_1: 4000},
    });
    expect(useGameStore.getState().winner).toBe('Bot_1');
    expect(useGameStore.getState().gamePhase).toBe('game_over');
  });

  it('maps friendly full-game error', () => {
    useGameStore.getState().handleServerMessage({
      type: 'error',
      message: 'Game Full',
    });
    expect(useGameStore.getState().error).toMatch(/full/i);
  });
});
