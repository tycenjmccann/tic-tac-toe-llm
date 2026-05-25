const { buildUserPrompt } = require('../src/prompts/user');

describe('buildUserPrompt', () => {
  test('renders board state correctly', () => {
    const board = [['X', null, 'O'], [null, 'X', null], [null, null, null]];
    const prompt = buildUserPrompt(board, 3);

    expect(prompt).toContain('X | . | O');
    expect(prompt).toContain('. | X | .');
    expect(prompt).toContain('. | . | .');
    expect(prompt).toContain('Move number: 3');
    expect(prompt).toContain('row=0, col=1');
    expect(prompt).toContain('row=1, col=0');
    expect(prompt).not.toContain('row=0, col=0'); // X is there
    expect(prompt).not.toContain('row=0, col=2'); // O is there
  });

  test('shows all cells as available for empty board', () => {
    const board = [[null, null, null], [null, null, null], [null, null, null]];
    const prompt = buildUserPrompt(board, 0);

    // Should list all 9 cells
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        expect(prompt).toContain(`row=${r}, col=${c}`);
      }
    }
  });

  test('includes move number information', () => {
    const board = [['X', null, null], [null, null, null], [null, null, null]];
    const prompt = buildUserPrompt(board, 1);
    expect(prompt).toContain('Move number: 1');
    expect(prompt).toContain('move 2 overall');
  });
});
