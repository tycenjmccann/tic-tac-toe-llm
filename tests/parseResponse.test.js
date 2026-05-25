// Test parseAIResponse logic
// We'll extract and test the parse function directly

function parseAIResponse(responseText, board) {
  try {
    const jsonMatch = responseText.match(/\{[^}]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    const row = parsed.row;
    const col = parsed.col;
    const reasoning = parsed.reasoning || '';

    if (!Number.isInteger(row) || row < 0 || row > 2) return null;
    if (!Number.isInteger(col) || col < 0 || col > 2) return null;
    if (board[row][col] !== null) return null;
    if (typeof reasoning !== 'string') return null;

    const safeReasoning = String(reasoning).replace(/<[^>]*>/g, '').slice(0, 500);

    return { row, col, reasoning: safeReasoning };
  } catch (e) {
    return null;
  }
}

describe('parseAIResponse', () => {
  const emptyBoard = [[null, null, null], [null, null, null], [null, null, null]];
  const partialBoard = [['X', null, 'O'], [null, 'X', null], [null, null, null]];

  test('parses valid JSON response', () => {
    const response = '{"row": 1, "col": 1, "reasoning": "Taking center"}';
    const result = parseAIResponse(response, emptyBoard);
    expect(result).toEqual({ row: 1, col: 1, reasoning: 'Taking center' });
  });

  test('extracts JSON from text with extra content', () => {
    const response = 'Here is my move: {"row": 0, "col": 0, "reasoning": "Corner play"} Hope you enjoy!';
    const result = parseAIResponse(response, emptyBoard);
    expect(result).toEqual({ row: 0, col: 0, reasoning: 'Corner play' });
  });

  test('returns null for non-JSON response', () => {
    const response = 'I choose row 1, col 1';
    expect(parseAIResponse(response, emptyBoard)).toBeNull();
  });

  test('returns null for out-of-range row', () => {
    const response = '{"row": 3, "col": 1, "reasoning": "test"}';
    expect(parseAIResponse(response, emptyBoard)).toBeNull();
  });

  test('returns null for out-of-range col', () => {
    const response = '{"row": 1, "col": -1, "reasoning": "test"}';
    expect(parseAIResponse(response, emptyBoard)).toBeNull();
  });

  test('returns null when selected cell is occupied', () => {
    const response = '{"row": 0, "col": 0, "reasoning": "Taking corner"}';
    expect(parseAIResponse(response, partialBoard)).toBeNull(); // X is at [0][0]
  });

  test('strips HTML from reasoning', () => {
    const response = '{"row": 1, "col": 0, "reasoning": "<script>alert(1)</script>Safe move"}';
    const result = parseAIResponse(response, emptyBoard);
    expect(result.reasoning).toBe('alert(1)Safe move');
    expect(result.reasoning).not.toContain('<script>');
  });

  test('truncates long reasoning to 500 chars', () => {
    const longReasoning = 'A'.repeat(600);
    const response = `{"row": 0, "col": 0, "reasoning": "${longReasoning}"}`;
    const result = parseAIResponse(response, emptyBoard);
    expect(result.reasoning.length).toBe(500);
  });

  test('handles missing reasoning gracefully', () => {
    const response = '{"row": 1, "col": 1}';
    const result = parseAIResponse(response, emptyBoard);
    expect(result).toEqual({ row: 1, col: 1, reasoning: '' });
  });

  test('returns null for non-integer row', () => {
    const response = '{"row": 1.5, "col": 1, "reasoning": "test"}';
    expect(parseAIResponse(response, emptyBoard)).toBeNull();
  });
});
