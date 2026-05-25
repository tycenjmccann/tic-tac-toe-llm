const express = require('express');
const router = express.Router();
const { validateRequest } = require('../validation/board');
const { invokeModel } = require('../services/bedrock');
const { getFallbackMove } = require('../utils/fallback');
const SYSTEM_PROMPT = require('../prompts/system');
const { buildUserPrompt } = require('../prompts/user');

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

    // Sanitize reasoning: strip HTML tags and truncate
    const safeReasoning = String(reasoning).replace(/<[^>]*>/g, '').slice(0, 500);

    return { row, col, reasoning: safeReasoning };
  } catch (e) {
    return null;
  }
}

router.post('/', async (req, res) => {
  const validationError = validateRequest(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { board, moveNumber } = req.body;
  const fallback = getFallbackMove(board);

  try {
    const userPrompt = buildUserPrompt(board, moveNumber);
    const responseText = await invokeModel(SYSTEM_PROMPT, userPrompt);
    const move = parseAIResponse(responseText, board);

    if (move) {
      return res.json(move);
    }

    // AI returned invalid move — use fallback
    return res.json(fallback);

  } catch (err) {
    console.error('Bedrock error:', err.message);

    if (err.name === 'TimeoutError' || err.code === 'ETIMEDOUT') {
      return res.status(503).json({
        error: 'AI service temporarily unavailable',
        ...fallback,
      });
    }

    if (err.name === 'CredentialsProviderError' || (err.message && err.message.includes('credentials'))) {
      return res.status(500).json({
        error: 'AI service configuration error',
      });
    }

    return res.status(500).json({
      error: 'AI service error',
      ...fallback,
    });
  }
});

module.exports = router;
