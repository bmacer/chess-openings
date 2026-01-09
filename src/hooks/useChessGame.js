import { useState, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';

export function useChessGame(expectedMoves = []) {
  const [game, setGame] = useState(() => new Chess());
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastMoveResult, setLastMoveResult] = useState(null); // 'correct', 'incorrect', or null

  // Current move index we're expecting
  const currentMoveIndex = moveHistory.length;
  
  // Check if all moves have been completed
  const isComplete = expectedMoves.length > 0 && currentMoveIndex >= expectedMoves.length;
  
  // Get the expected next move (if we have a sequence to follow)
  const expectedNextMove = expectedMoves[currentMoveIndex] || null;

  // Get whose turn it is
  const turn = game.turn(); // 'w' or 'b'

  // Reset the game to initial position
  const reset = useCallback(() => {
    setGame(new Chess());
    setMoveHistory([]);
    setLastMoveResult(null);
  }, []);

  // Make a move on the board
  const makeMove = useCallback((move) => {
    const gameCopy = new Chess(game.fen());
    
    try {
      const result = gameCopy.move(move);
      if (result) {
        setGame(gameCopy);
        setMoveHistory(prev => [...prev, result.san]);
        
        // Check if move matches expected (if we're in practice mode)
        if (expectedNextMove) {
          const isCorrect = result.san === expectedNextMove;
          setLastMoveResult(isCorrect ? 'correct' : 'incorrect');
          
          if (!isCorrect) {
            // Undo the wrong move after a short delay
            setTimeout(() => {
              setGame(new Chess(game.fen()));
              setMoveHistory(prev => prev.slice(0, -1));
              setLastMoveResult(null);
            }, 500);
          }
          
          return { success: true, isCorrect, san: result.san };
        }
        
        return { success: true, san: result.san };
      }
    } catch (e) {
      // Invalid move
    }
    
    return { success: false };
  }, [game, expectedNextMove]);

  // Play a sequence of moves (for demo/quiz mode)
  const playMoves = useCallback((moves, startIndex = 0) => {
    const newGame = new Chess();
    const history = [];
    
    for (let i = 0; i <= startIndex && i < moves.length; i++) {
      try {
        const result = newGame.move(moves[i]);
        if (result) {
          history.push(result.san);
        }
      } catch (e) {
        break;
      }
    }
    
    setGame(newGame);
    setMoveHistory(history);
    setLastMoveResult(null);
  }, []);

  // Set position from FEN
  const setPosition = useCallback((fen) => {
    try {
      const newGame = new Chess(fen);
      setGame(newGame);
      setMoveHistory([]);
      setLastMoveResult(null);
    } catch (e) {
      console.error('Invalid FEN:', fen);
    }
  }, []);

  // Get all legal moves
  const legalMoves = useMemo(() => {
    return game.moves({ verbose: true });
  }, [game]);

  // Get FEN position
  const fen = game.fen();

  // Progress percentage
  const progress = expectedMoves.length > 0 
    ? Math.min(100, (currentMoveIndex / expectedMoves.length) * 100)
    : 0;

  return {
    game,
    fen,
    turn,
    moveHistory,
    currentMoveIndex,
    expectedNextMove,
    isComplete,
    lastMoveResult,
    progress,
    legalMoves,
    makeMove,
    reset,
    playMoves,
    setPosition,
  };
}

