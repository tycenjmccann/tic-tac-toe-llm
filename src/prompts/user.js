function buildUserPrompt(board, moveNumber) {
  const displayBoard = board
    .map((row) =>
      row.map((cell) => (cell === null ? '.' : cell)).join(' | ')
    )
    .join('\n---------\n');

  return `Current board state (. = empty):

${displayBoard}

Move number: ${moveNumber} (it is now O's turn, move ${moveNumber + 1} overall will be placed)

Available empty cells:
${getEmptyCells(board)}

Choose your move as O. Respond with JSON only.`;
}

function getEmptyCells(board) {
  const cells = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === null) {
        cells.push(`  row=${r}, col=${c}`);
      }
    }
  }
  return cells.join('\n');
}

module.exports = { buildUserPrompt };
