import {
  parseServerMessage,
  isHostHumansPrompt,
  isSipahiGuessPrompt,
  parseJoinInfo,
  parseWaitingInfo,
} from '../src/api/protocol';
import {validatePlayerName, clamp} from '../src/utils/validation';
import {
  sortLeaderboard,
  parseHumansChoice,
  isBotName,
} from '../src/utils/gameUtils';

describe('parseServerMessage', () => {
  it('parses role_reveal', () => {
    const msg = parseServerMessage({type: 'role_reveal', role: 'Raja'});
    expect(msg).toEqual({type: 'role_reveal', role: 'Raja'});
  });

  it('rejects invalid role', () => {
    expect(parseServerMessage({type: 'role_reveal', role: 'King'})).toBeNull();
  });

  it('parses round_end', () => {
    const msg = parseServerMessage({
      type: 'round_end',
      correct: true,
      all_roles: {A: 'Raja', B: 'Chor', C: 'Mantri', D: 'Sipahi'},
      scores: {A: 1000, B: 0, C: 800, D: 500},
    });
    expect(msg?.type).toBe('round_end');
  });

  it('returns null for garbage', () => {
    expect(parseServerMessage(null)).toBeNull();
    expect(parseServerMessage({type: 'unknown'})).toBeNull();
    expect(parseServerMessage('nope')).toBeNull();
  });

  it('parses choose_chor input', () => {
    const msg = parseServerMessage({
      type: 'input_request',
      prompt: 'choose_chor',
      title: 'Who is the Chor?',
      options: ['A', 'B', 'C'],
    });
    expect(msg).not.toBeNull();
    if (msg && msg.type === 'input_request' && msg.prompt === 'choose_chor') {
      expect(isSipahiGuessPrompt(msg)).toBe(true);
      expect(isHostHumansPrompt(msg)).toBe(false);
    }
  });

  it('detects host humans prompt', () => {
    const msg = parseServerMessage({
      type: 'input_request',
      prompt: 'choose_chor',
      title: 'How many humans?',
      options: ['1 Human', '2 Humans'],
    });
    expect(msg).not.toBeNull();
    if (msg) {
      expect(isHostHumansPrompt(msg)).toBe(true);
      expect(isSipahiGuessPrompt(msg)).toBe(false);
    }
  });
});

describe('info parsers', () => {
  it('parses join info', () => {
    expect(parseJoinInfo('Rajiv joined! (2/4)')).toEqual({
      playerName: 'Rajiv',
      current: 2,
      required: 4,
    });
  });

  it('parses waiting info', () => {
    expect(parseWaitingInfo('Waiting for 2 more player(s)...')).toBe(2);
  });
});

describe('validation', () => {
  it('validates names', () => {
    expect(validatePlayerName('').valid).toBe(false);
    expect(validatePlayerName('A').valid).toBe(false);
    expect(validatePlayerName('Rajiv').valid).toBe(true);
    expect(validatePlayerName('  Neha  ').value).toBe('Neha');
  });

  it('clamps numbers', () => {
    expect(clamp(50, 3, 20)).toBe(20);
    expect(clamp(1, 3, 20)).toBe(3);
  });
});

describe('gameUtils', () => {
  it('sorts leaderboard', () => {
    const board = sortLeaderboard({A: 100, B: 500, C: 300});
    expect(board[0]).toMatchObject({name: 'B', rank: 1, score: 500});
  });

  it('parses humans choice', () => {
    expect(parseHumansChoice('2 Humans')).toBe(2);
  });

  it('detects bot names', () => {
    expect(isBotName('Bot_1')).toBe(true);
    expect(isBotName('Rajiv')).toBe(false);
  });
});
