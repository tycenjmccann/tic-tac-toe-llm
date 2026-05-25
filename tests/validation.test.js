const { validateRequest } = require('../src/validation/board');

describe('validateRequest', () => {
  test('returns null for valid request (first move)', () => {
    const body = {
      board: [['X', null, null], [null, null, null], [null, null, null]],
      moveNumber: 1
    };
    expect(validateRequest(body)).toBeNull();
  });

  test('returns null for valid request (mid-game)', () => {
    const body = {
      board: [['X', null, 'O'], [null, 'X', null], [null, null, null]],
      moveNumber: 3
    };
    expect(validateRequest(body)).toBeNull();
  });

  test('returns error if board is not an array', () => {
    const body = { board: 'not an array', moveNumber: 1 };
    expect(validateRequest(body)).toBe('board must be a 3x3 array');
  });

  test('returns error if board has wrong number of rows', () => {
    const body = { board: [[null, null, null], [null, null, null]], moveNumber: 1 };
    expect(validateRequest(body)).toBe('board must be a 3x3 array');
  });

  test('returns error if a row has wrong number of cells', () => {
    const body = {
      board: [['X', null], [null, null, null], [null, null, null]],
      moveNumber: 1
    };
    expect(validateRequest(body)).toMatch(/board row 0 must have exactly 3 cells/);
  });

  test('returns error for invalid cell values', () => {
    const body = {
      board: [['X', 'Z', null], [null, null, null], [null, null, null]],
      moveNumber: 1
    };
    expect(validateRequest(body)).toMatch(/must be "X", "O", or null/);
  });

  test('returns error for non-integer moveNumber', () => {
    const body = {
      board: [['X', null, null], [null, null, null], [null, null, null]],
      moveNumber: 1.5
    };
    expect(validateRequest(body)).toBe('moveNumber must be an integer between 1 and 9');
  });

  test('returns error for moveNumber out of range (0)', () => {
    const body = {
      board: [[null, null, null], [null, null, null], [null, null, null]],
      moveNumber: 0
    };
    expect(validateRequest(body)).toBe('moveNumber must be an integer between 1 and 9');
  });

  test('returns error for moveNumber out of range (10)', () => {
    const body = {
      board: [['X', 'O', 'X'], ['O', 'X', 'O'], ['X', 'O', 'X']],
      moveNumber: 10
    };
    expect(validateRequest(body)).toBe('moveNumber must be an integer between 1 and 9');
  });

  test('returns error when piece count does not match moveNumber', () => {
    const body = {
      board: [['X', 'O', null], [null, null, null], [null, null, null]],
      moveNumber: 3
    };
    expect(validateRequest(body)).toMatch(/piece count .* does not match moveNumber/);
  });

  test('returns error for invalid turn state', () => {
    const body = {
      board: [['O', null, null], [null, null, null], [null, null, null]],
      moveNumber: 1
    };
    expect(validateRequest(body)).toMatch(/invalid turn state/);
  });

  test('returns error when O has more pieces than allowed', () => {
    const body = {
      board: [['O', 'O', null], [null, null, null], [null, null, null]],
      moveNumber: 2
    };
    expect(validateRequest(body)).toMatch(/invalid turn state/);
  });
});
