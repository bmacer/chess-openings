import { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from './ChessBoard';
import { useChessGame } from '../hooks/useChessGame';
import openingsData from '../data/openings.json';

export function PlayMode({ onBack }) {
  const [selectedOpening, setSelectedOpening] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const { 
    fen, 
    turn,
    moveHistory,
    currentMoveIndex,
    expectedNextMove,
    isComplete,
    lastMoveResult,
    progress,
    makeMove,
    reset 
  } = useChessGame(selectedOpening?.moves || []);

  // Make computer moves (black's moves in the opening)
  useEffect(() => {
    if (!selectedOpening || isComplete) return;
    
    // If it's black's turn and we have an expected move, play it automatically
    if (turn === 'b' && expectedNextMove) {
      const timer = setTimeout(() => {
        makeMove(expectedNextMove);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [turn, expectedNextMove, selectedOpening, isComplete, makeMove]);

  // Handle completion
  useEffect(() => {
    if (isComplete && selectedOpening) {
      setCompletedCount(prev => prev + 1);
    }
  }, [isComplete, selectedOpening]);

  const handleMove = useCallback((move) => {
    return makeMove(move);
  }, [makeMove]);

  const handleSelectOpening = (opening) => {
    setSelectedOpening(opening);
    setShowHint(false);
    reset();
  };

  const handleNextOpening = () => {
    const currentIndex = openingsData.openings.findIndex(o => o.id === selectedOpening?.id);
    const nextIndex = (currentIndex + 1) % openingsData.openings.length;
    handleSelectOpening(openingsData.openings[nextIndex]);
  };

  const handleRandomOpening = () => {
    const randomIndex = Math.floor(Math.random() * openingsData.openings.length);
    handleSelectOpening(openingsData.openings[randomIndex]);
  };

  // Get hint square (where the piece should move from)
  const getHintSquare = () => {
    if (!expectedNextMove || turn !== 'w') return null;
    
    try {
      const tempGame = new Chess(fen);
      const moves = tempGame.moves({ verbose: true });
      const matchingMove = moves.find(m => m.san === expectedNextMove);
      return matchingMove?.from || null;
    } catch (e) {
      return null;
    }
  };

  // Opening selection screen
  if (!selectedOpening) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="mb-6 text-[#a0a0a0] hover:text-[#d4a853] transition-colors flex items-center gap-2"
          >
            <span>←</span> Back to Menu
          </button>

          <h1 className="font-serif text-4xl text-[#d4a853] mb-2">Play the Opening</h1>
          <p className="text-[#a0a0a0] mb-8">Select an opening to practice playing the correct moves.</p>

          <div className="flex gap-4 mb-8">
            <button
              onClick={handleRandomOpening}
              className="px-6 py-3 bg-[#d4a853] text-[#0f0f0f] rounded-lg font-medium hover:bg-[#e5b964] transition-colors"
            >
              Random Opening
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openingsData.openings.map((opening, index) => (
              <button
                key={opening.id}
                onClick={() => handleSelectOpening(opening)}
                className="p-4 bg-[#1a1a1a] border border-[#333333] rounded-lg text-left hover:border-[#d4a853] hover:bg-[#252525] transition-all fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-serif text-xl text-[#f5f5f5]">{opening.name}</h3>
                  <span className="text-xs text-[#a0a0a0] bg-[#252525] px-2 py-1 rounded">{opening.eco}</span>
                </div>
                <p className="text-sm text-[#a0a0a0] mb-2">{opening.description}</p>
                <p className="text-xs text-[#666666]">{opening.moves.length} moves</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Practice screen
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedOpening(null)}
          className="mb-6 text-[#a0a0a0] hover:text-[#d4a853] transition-colors flex items-center gap-2"
        >
          <span>←</span> Back to Openings
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Board section */}
          <div className="flex-1">
            <ChessBoard
              fen={fen}
              onMove={handleMove}
              lastMoveResult={lastMoveResult}
              interactive={!isComplete && turn === 'w'}
              showHint={showHint}
              hintSquare={getHintSquare()}
            />
          </div>

          {/* Info panel */}
          <div className="lg:w-80 space-y-6">
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-serif text-2xl text-[#d4a853]">{selectedOpening.name}</h2>
                  <span className="text-sm text-[#a0a0a0]">{selectedOpening.eco}</span>
                </div>
              </div>
              
              <p className="text-sm text-[#a0a0a0] mb-6">{selectedOpening.description}</p>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#a0a0a0]">Progress</span>
                  <span className="text-[#f5f5f5]">{currentMoveIndex} / {selectedOpening.moves.length}</span>
                </div>
                <div className="h-2 bg-[#252525] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#d4a853] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Move history */}
              <div className="mb-6">
                <h3 className="text-sm text-[#a0a0a0] mb-2">Moves</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedOpening.moves.map((move, i) => (
                    <span
                      key={i}
                      className={`
                        px-2 py-1 rounded text-sm
                        ${i < currentMoveIndex 
                          ? 'bg-[#d4a853]/20 text-[#d4a853]' 
                          : 'bg-[#252525] text-[#666666]'
                        }
                      `}
                    >
                      {i % 2 === 0 && <span className="text-[#666666] mr-1">{Math.floor(i/2) + 1}.</span>}
                      {i < currentMoveIndex ? move : '???'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {!isComplete && turn === 'w' && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className={`
                      w-full py-2 px-4 rounded-lg border transition-colors
                      ${showHint 
                        ? 'bg-[#d4a853]/20 border-[#d4a853] text-[#d4a853]' 
                        : 'bg-transparent border-[#333333] text-[#a0a0a0] hover:border-[#d4a853] hover:text-[#d4a853]'
                      }
                    `}
                  >
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </button>
                )}

                <button
                  onClick={reset}
                  className="w-full py-2 px-4 rounded-lg bg-transparent border border-[#333333] text-[#a0a0a0] hover:border-[#d4a853] hover:text-[#d4a853] transition-colors"
                >
                  Reset
                </button>

                {isComplete && (
                  <>
                    <div className="text-center py-4">
                      <div className="text-4xl mb-2">🎉</div>
                      <p className="text-[#4ade80] font-medium">Opening Complete!</p>
                    </div>
                    <button
                      onClick={handleNextOpening}
                      className="w-full py-3 px-4 rounded-lg bg-[#d4a853] text-[#0f0f0f] font-medium hover:bg-[#e5b964] transition-colors"
                    >
                      Next Opening →
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4">
              <div className="text-center">
                <span className="text-2xl text-[#d4a853]">{completedCount}</span>
                <p className="text-sm text-[#a0a0a0]">Openings completed this session</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

