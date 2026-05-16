# Tic-Tac-Toe vs LLM

## Overview
A web-based Tic-Tac-Toe game where the player competes against an AI opponent powered by Claude (via AWS Bedrock). The game features a clean, modern UI with real-time gameplay.

## Target
- Single-page web app (HTML + CSS + JS)
- Backend API for LLM moves (Node.js Lambda or simple Express server)
- Deployed as a static site + API

## Core Features

### Game Board
- 3x3 grid with clean visual design
- Click/tap to place X (player is always X)
- Visual feedback on hover
- Winning line highlight animation
- Responsive — works on mobile and desktop

### AI Opponent (Claude via Bedrock)
- AI plays as O
- Uses Claude Haiku for fast response times
- AI analyzes the current board state and makes strategic moves
- Simulated "thinking" animation (500ms-1s delay for UX)
- AI should play at medium difficulty — beatable but not trivial

### Game Flow
1. Player always goes first (X)
2. After player moves, send board state to API
3. API calls Claude with the board state, gets AI move
4. Update board with AI move
5. Check for win/draw after each move
6. Show result screen: "You Win!", "AI Wins!", or "Draw!"
7. "Play Again" button to reset

### UI/UX
- Dark theme with neon accents (cyberpunk/retro vibe)
- Smooth animations for piece placement
- Score tracker (wins/losses/draws across session)
- "AI is thinking..." indicator with subtle animation
- Sound effects optional (toggle)

## Tech Stack
- **Frontend**: Vanilla HTML/CSS/JS (no framework needed — keep it simple)
- **Backend**: Node.js with AWS SDK for Bedrock
- **AI Model**: Claude Haiku via `@aws-sdk/client-bedrock-runtime`
- **Deployment**: Can be a single Express server serving static files + API route

## API Design

### POST /api/move
Request:
```json
{
  "board": [["X", null, "O"], [null, "X", null], [null, null, null]],
  "moveNumber": 3
}
```

Response:
```json
{
  "row": 2,
  "col": 2,
  "reasoning": "Playing center to control the board"
}
```

## Non-Goals
- No user accounts or authentication
- No multiplayer
- No game history persistence
- No difficulty settings (medium difficulty only)

## Success Criteria
- Game is playable end-to-end
- AI makes reasonable moves (not random, not perfect)
- UI is responsive and visually polished
- Response time for AI move < 2 seconds
