(function () {
  'use strict';

  const cells = document.querySelectorAll('.cell');
  const board = document.querySelector('.board');
  const statusText = document.querySelector('.status-text');
  const overlay = document.querySelector('.result-overlay');
  const resultTitle = document.querySelector('.result-title');
  const btnPlayAgain = document.querySelector('.btn-play-again');
  const scoreWins = document.getElementById('score-wins');
  const scoreLosses = document.getElementById('score-losses');
  const scoreDraws = document.getElementById('score-draws');

  let boardState = [
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ];
  let moveNumber = 0;
  let gameActive = true;
  let isPlayerTurn = true;
  let score = { wins: 0, losses: 0, draws: 0 };

  const WINNING_LINES = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]]
  ];

  function setState(state) {
    const container = document.querySelector('.container');
    container.className = 'container ' + state;

    if (state === 'state-ai-thinking' || state === 'state-game-won' ||
        state === 'state-game-lost' || state === 'state-game-draw') {
      board.classList.add('disabled');
    } else {
      board.classList.remove('disabled');
    }
  }

  function checkWin(mark) {
    for (const line of WINNING_LINES) {
      const [[r0, c0], [r1, c1], [r2, c2]] = line;
      if (boardState[r0][c0] === mark &&
          boardState[r1][c1] === mark &&
          boardState[r2][c2] === mark) {
        return line;
      }
    }
    return null;
  }

  function checkDraw() {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (boardState[r][c] === null) return false;
      }
    }
    return true;
  }

  function getCell(row, col) {
    return document.querySelector('.cell[data-row="' + row + '"][data-col="' + col + '"]');
  }

  function placeMark(row, col, mark) {
    boardState[row][col] = mark;
    moveNumber++;
    const cell = getCell(row, col);
    cell.setAttribute('data-mark', mark.toLowerCase());
    cell.textContent = mark;
    const displayRow = row + 1;
    const displayCol = col + 1;
    cell.setAttribute('aria-label', 'Row ' + displayRow + ', Column ' + displayCol + ', ' + mark);
    cell.setAttribute('aria-disabled', 'true');
  }

  function showThinking() {
    statusText.textContent = '';
    const text = document.createTextNode('AI is thinking');
    statusText.appendChild(text);
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.className = 'thinking-dot';
      dot.setAttribute('aria-hidden', 'true');
      statusText.appendChild(dot);
    }
  }

  function updateScore() {
    scoreWins.textContent = score.wins;
    scoreWins.setAttribute('aria-label', 'Wins: ' + score.wins);
    scoreLosses.textContent = score.losses;
    scoreLosses.setAttribute('aria-label', 'Losses: ' + score.losses);
    scoreDraws.textContent = score.draws;
    scoreDraws.setAttribute('aria-label', 'Draws: ' + score.draws);
  }

  function popScore(el) {
    el.classList.remove('pop');
    void el.offsetWidth; // force reflow
    el.classList.add('pop');
  }

  function showOverlay(message, outcome) {
    resultTitle.textContent = message;
    resultTitle.className = 'result-title ' + outcome;
    overlay.removeAttribute('hidden');
    void overlay.offsetWidth; // force reflow
    overlay.classList.add('visible');
    btnPlayAgain.focus();
  }

  function hideOverlay() {
    overlay.classList.remove('visible');
    setTimeout(function () {
      overlay.setAttribute('hidden', '');
    }, 300);
  }

  function handleWin(winningLine, winner) {
    gameActive = false;
    var isPlayer = winner === 'X';
    var winColor = isPlayer ? 'var(--neon-green)' : 'var(--neon-red)';

    for (const [r, c] of winningLine) {
      const cell = getCell(r, c);
      cell.style.setProperty('--win-color', winColor);
      cell.classList.add('winning');
    }

    if (isPlayer) {
      setState('state-game-won');
      score.wins++;
      updateScore();
      popScore(scoreWins);
      statusText.textContent = 'You win!';
      setTimeout(function () { showOverlay('YOU WIN!', 'win'); }, 600);
    } else {
      setState('state-game-lost');
      score.losses++;
      updateScore();
      popScore(scoreLosses);
      statusText.textContent = 'AI wins!';
      setTimeout(function () { showOverlay('AI WINS!', 'lose'); }, 600);
    }
  }

  function handleDraw() {
    gameActive = false;
    setState('state-game-draw');
    score.draws++;
    updateScore();
    popScore(scoreDraws);
    statusText.textContent = "It's a draw!";
    setTimeout(function () { showOverlay('DRAW!', 'draw'); }, 600);
  }

  function resetGame() {
    hideOverlay();
    board.classList.add('clearing');

    setTimeout(function () {
      cells.forEach(function (cell) {
        cell.removeAttribute('data-mark');
        cell.removeAttribute('aria-disabled');
        cell.textContent = '';
        cell.classList.remove('winning');
        cell.style.removeProperty('--win-color');
        var row = parseInt(cell.getAttribute('data-row')) + 1;
        var col = parseInt(cell.getAttribute('data-col')) + 1;
        cell.setAttribute('aria-label', 'Row ' + row + ', Column ' + col + ', empty');
      });

      boardState = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
      ];
      moveNumber = 0;
      gameActive = true;
      isPlayerTurn = true;

      board.classList.remove('clearing');
      board.classList.remove('disabled');
      setState('state-player-turn');
      statusText.textContent = 'Your turn';

      // Reset tabindex
      cells[0].tabIndex = 0;
      for (var i = 1; i < cells.length; i++) {
        cells[i].tabIndex = -1;
      }
      cells[0].focus();
    }, 200);
  }

  async function aiTurn() {
    isPlayerTurn = false;
    setState('state-ai-thinking');
    showThinking();

    try {
      var response = await fetch('/api/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: boardState, moveNumber: moveNumber })
      });

      var data = await response.json();

      // Handle cases where fallback move is provided even on error status
      if (data.row !== undefined && data.col !== undefined) {
        placeMark(data.row, data.col, 'O');

        var winLine = checkWin('O');
        if (winLine) {
          handleWin(winLine, 'O');
          return;
        }

        if (checkDraw()) {
          handleDraw();
          return;
        }

        isPlayerTurn = true;
        setState('state-player-turn');
        statusText.textContent = 'Your turn';
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('AI turn error:', err);
      statusText.textContent = 'Error - try again';
      isPlayerTurn = true;
      setState('state-player-turn');
    }
  }

  function handleCellClick(cell) {
    if (!gameActive || !isPlayerTurn) return;
    if (cell.hasAttribute('data-mark')) return;

    var row = parseInt(cell.getAttribute('data-row'));
    var col = parseInt(cell.getAttribute('data-col'));

    placeMark(row, col, 'X');

    var winLine = checkWin('X');
    if (winLine) {
      handleWin(winLine, 'X');
      return;
    }

    if (checkDraw()) {
      handleDraw();
      return;
    }

    aiTurn();
  }

  // Click handlers
  cells.forEach(function (cell) {
    cell.addEventListener('click', function () {
      handleCellClick(cell);
    });
  });

  // Keyboard navigation (roving tabindex)
  function getCellIndex(cell) {
    return Array.from(cells).indexOf(cell);
  }

  function focusCell(index) {
    if (index < 0 || index >= cells.length) return;
    cells.forEach(function (c) { c.tabIndex = -1; });
    cells[index].tabIndex = 0;
    cells[index].focus();
  }

  board.addEventListener('keydown', function (e) {
    var current = document.activeElement;
    if (!current.classList.contains('cell')) return;

    var idx = getCellIndex(current);
    var row = Math.floor(idx / 3);
    var col = idx % 3;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        if (col < 2) focusCell(idx + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (col > 0) focusCell(idx - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (row < 2) focusCell(idx + 3);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (row > 0) focusCell(idx - 3);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleCellClick(current);
        break;
    }
  });

  // Escape key to dismiss overlay
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hasAttribute('hidden')) {
      resetGame();
    }
  });

  // Play again button
  btnPlayAgain.addEventListener('click', resetGame);

  // Focus trap for result overlay
  overlay.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      btnPlayAgain.focus();
    }
  });

  // Initialize
  setState('state-player-turn');
})();