# Chess Opening Trainer

A React web app to learn chess openings through interactive practice.

## Features

### Play the Opening Mode
- Select an opening (e.g., "Queen's Gambit Declined")
- Play the correct moves on the board
- Visual feedback: green border for correct moves, red shake for incorrect
- Progress indicator showing moves completed
- Hint button to highlight the correct piece to move
- Computer automatically plays the opponent's responses

### Identify the Opening Mode (Flashcards)
- Watch moves animate on the board
- Identify the opening from 4 multiple choice options
- Track your score, accuracy, and streak
- Replay moves as needed

## Curated Openings (~28)

Includes popular openings like:
- **Open Games**: Italian Game, Ruy Lopez, Scotch Game, King's Gambit
- **Sicilian**: Main line, Najdorf, Dragon
- **Other e4 defenses**: French, Caro-Kann, Pirc, Scandinavian, Alekhine
- **Queen's Pawn**: Queen's Gambit (Accepted & Declined), Slav, London System
- **Indian Systems**: King's Indian, Nimzo-Indian, Grünfeld, Catalan
- **Flank Openings**: English, Réti, Bird's Opening

## Tech Stack

- **React + Vite** - Fast development and build tooling
- **chess.js** - Chess game logic and move validation
- **react-chessboard** - Interactive drag-and-drop chess board
- **Tailwind CSS** - Styling

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. Open the app in your browser (default: http://localhost:5173)
2. Choose a mode:
   - **Play the Opening**: Practice executing moves for named openings
   - **Identify the Opening**: Quiz yourself on recognizing opening positions
3. Track your progress and improve your opening knowledge!

## License

MIT
