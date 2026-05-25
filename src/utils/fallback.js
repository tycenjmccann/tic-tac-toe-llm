function getFallbackMove(board) {
  const emptyCells = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === null) {
        emptyCells.push({ row: r, col: c });
      }
    }
  }
  if (emptyCells.length === 0) return null;

  // Pick a random empty cell for fallback
  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  return { ...emptyCells[randomIndex], reasoning: 'Fallback move selected.' };
}

module.exports = { getFallbackMove };
