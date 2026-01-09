import { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';

export function ChessBoard({ 
  fen, 
  onMove, 
  lastMoveResult,
  orientation = 'white',
  interactive = true,
  showHint = false,
  hintSquare = null,
}) {
  const [shake, setShake] = useState(false);
  const [highlightSquares, setHighlightSquares] = useState({});
  const [boardPosition, setBoardPosition] = useState(fen);

  // Update board position when fen changes
  useEffect(() => {
    setBoardPosition(fen);
  }, [fen]);

  // Handle shake animation on incorrect move
  useEffect(() => {
    if (lastMoveResult === 'incorrect') {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [lastMoveResult]);

  // Handle hint highlighting
  useEffect(() => {
    if (showHint && hintSquare) {
      setHighlightSquares({
        [hintSquare]: {
          background: 'radial-gradient(circle, rgba(212, 168, 83, 0.4) 25%, transparent 25%)',
          borderRadius: '50%',
        }
      });
    } else {
      setHighlightSquares({});
    }
  }, [showHint, hintSquare]);

  const handlePieceDrop = (sourceSquare, targetSquare, piece) => {
    if (!interactive || !onMove) return false;

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1]?.toLowerCase() === 'p' ? 'q' : undefined,
    };

    const result = onMove(move);
    return result?.success || false;
  };

  // Custom board colors
  const customDarkSquareStyle = { 
    backgroundColor: '#5c4a2a' 
  };
  
  const customLightSquareStyle = { 
    backgroundColor: '#d4b896' 
  };

  // Border color based on last move result
  const getBorderColor = () => {
    if (lastMoveResult === 'correct') return 'border-green-500';
    if (lastMoveResult === 'incorrect') return 'border-red-500';
    return 'border-[#333333]';
  };

  return (
    <div 
      className={`
        relative rounded-lg overflow-hidden border-4 transition-colors duration-300
        ${getBorderColor()}
        ${shake ? 'shake' : ''}
      `}
      style={{ maxWidth: '480px', width: '100%' }}
    >
      <Chessboard
        position={boardPosition}
        onPieceDrop={handlePieceDrop}
        boardOrientation={orientation}
        customDarkSquareStyle={customDarkSquareStyle}
        customLightSquareStyle={customLightSquareStyle}
        customSquareStyles={highlightSquares}
        arePiecesDraggable={interactive}
        animationDuration={200}
      />
      
      {/* Success overlay */}
      {lastMoveResult === 'correct' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="bg-green-500/20 absolute inset-0" />
        </div>
      )}
    </div>
  );
}
