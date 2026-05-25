function validateRequest(body) {
  const { board, moveNumber } = body;

  if (!Array.isArray(board) || board.length !== 3) {
    return 'board must be a 3x3 array';
  }

  for (let r = 0; r < 3; r++) {
    if (!Array.isArray(board[r]) || board[r].length !== 3) {
      return `board row ${r} must have exactly 3 cells`;
    }
    for (let c = 0; c < 3; c++) {
      const cell = board[r][c];
      if (cell !== 'X' && cell !== 'O' && cell !== null) {
        return `board[${r}][${c}] must be "X", "O", or null`;
      }
    }
  }

  if (!Number.isInteger(moveNumber) || moveNumber < 1 || moveNumber > 9) {
    return 'moveNumber must be an integer between 1 and 9';
  }

  let xCount = 0;
  let oCount = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell === 'X') xCount++;
      if (cell === 'O') oCount++;
    }
  }

  if (xCount + oCount !== moveNumber) {
    return `piece count (${xCount + oCount}) does not match moveNumber (${moveNumber})`;
  }

  if (xCount !== oCount + 1) {
    return `invalid turn state: X count (${xCount}) must equal O count (${oCount}) + 1`;
  }

  return null;
}

module.exports = { validateRequest };
