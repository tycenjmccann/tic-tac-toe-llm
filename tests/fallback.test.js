const { getFallbackMove } = require('../src/utils/fallback');

describe('getFallbackMove', () => {
  test('returns a valid empty cell', () => {
    const board = [['X', null, 'O'], [null, 'X', null], [null, null, null]];
    const move = getFallbackMove(board);
    expect(move).toBeDefined();
    expect(move.row).toBeGreaterThanOrEqual(0);
    expect(move.row).toBeLessThanOrEqual(2);
    expect(move.col).toBeGreaterThanOrEqual(0);
    expect(move.col).toBeLessThanOrEqual(2);
    expect(board[move.row][move.col]).toBeNull();
    expect(move.reasoning).toBe('Fallback move selected.');
  });

  test('returns null when board is full', () => {
    const board = [['X', 'O', 'X'], ['O', 'X', 'O'], ['O', 'X', 'O']];
    const move = getFallbackMove(board);
    expect(move).toBeNull();
  });

  test('returns the only available cell when one remains', () => {
    const board = [['X', 'O', 'X'], ['O', 'X', 'O'], ['O', 'X', null]];
    const move = getFallbackMove(board);
    expect(move.row).toBe(2);
    expect(move.col).toBe(2);
  });
});
