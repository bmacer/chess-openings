import { useState, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from './ChessBoard';
import openingsData from '../data/openings.json';

export function OpenPlayMode({ onBack }) {
  const [game, setGame] = useState(() => new Chess());
  const [moveHistory, setMoveHistory] = useState([]);
  const [playerColor, setPlayerColor] = useState(null); // 'w' or 'b'
  const [gameEnded, setGameEnded] = useState(null); // null, 'matched', or 'no-match'
  const [matchedOpening, setMatchedOpening] = useState(null);

  // Find all openings that could still be valid given current moves
  const matchingOpenings = useMemo(() => {
    if (moveHistory.length === 0) return [];

    return openingsData.openings.filter(opening => {
      // Check if current moves are a prefix of this opening
      if (moveHistory.length > opening.moves.length) return false;
      
      for (let i = 0; i < moveHistory.length; i++) {
        if (moveHistory[i] !== opening.moves[i]) return false;
      }
      return true;
    }).sort((a, b) => a.moves.length - b.moves.length);
  }, [moveHistory]);

  // Find exact matches (openings that match exactly with current moves)
  const exactMatches = useMemo(() => {
    return matchingOpenings.filter(o => o.moves.length === moveHistory.length);
  }, [matchingOpenings, moveHistory]);

  // Find openings that could extend further
  const extendableOpenings = useMemo(() => {
    return matchingOpenings.filter(o => o.moves.length > moveHistory.length);
  }, [matchingOpenings, moveHistory]);

  // Check for game end conditions
  const checkGameEnd = useCallback((newMoveHistory) => {
    if (newMoveHistory.length === 0) return;

    const matches = openingsData.openings.filter(opening => {
      if (newMoveHistory.length > opening.moves.length) return false;
      for (let i = 0; i < newMoveHistory.length; i++) {
        if (newMoveHistory[i] !== opening.moves[i]) return false;
      }
      return true;
    });

    // No matches at all - wrong path
    if (matches.length === 0) {
      setGameEnded('no-match');
      return;
    }

    // Check for exact match with no extensions possible
    const exact = matches.filter(o => o.moves.length === newMoveHistory.length);
    const extendable = matches.filter(o => o.moves.length > newMoveHistory.length);

    if (exact.length > 0 && extendable.length === 0) {
      setGameEnded('matched');
      setMatchedOpening(exact[0]); // Take the first exact match
    }
  }, []);

  const handleMove = useCallback((move) => {
    if (gameEnded) return { success: false };

    const gameCopy = new Chess(game.fen());
    
    try {
      const result = gameCopy.move(move);
      if (result) {
        setGame(gameCopy);
        const newHistory = [...moveHistory, result.san];
        setMoveHistory(newHistory);
        checkGameEnd(newHistory);
        return { success: true, san: result.san };
      }
    } catch (e) {
      // Invalid move
    }
    
    return { success: false };
  }, [game, moveHistory, gameEnded, checkGameEnd]);

  const handleReset = () => {
    setGame(new Chess());
    setMoveHistory([]);
    setGameEnded(null);
    setMatchedOpening(null);
  };

  const handleSelectColor = (color) => {
    setPlayerColor(color);
    handleReset();
  };

  // Color selection screen
  if (!playerColor) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="mb-6 text-[#a0a0a0] hover:text-[#d4a853] transition-colors flex items-center gap-2"
          >
            <span>←</span> Back to Menu
          </button>

          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl text-[#d4a853] mb-2">Open Play</h1>
            <p className="text-[#a0a0a0]">Play freely and discover which openings match your moves</p>
          </div>

          <h2 className="font-serif text-2xl text-[#f5f5f5] text-center mb-8">Choose Your Side</h2>

          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
            <button
              onClick={() => handleSelectColor('w')}
              className="group p-6 bg-[#1a1a1a] border border-[#333333] rounded-lg hover:border-[#d4a853] hover:bg-[#252525] transition-all"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-[#f5f5f5] flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform">
                  ♔
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#f5f5f5] mb-1">Play as White</h3>
                  <p className="text-sm text-[#a0a0a0]">You move first</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleSelectColor('b')}
              className="group p-6 bg-[#1a1a1a] border border-[#333333] rounded-lg hover:border-[#d4a853] hover:bg-[#252525] transition-all"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-[#2a2a2a] flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform border border-[#444]">
                  ♚
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#f5f5f5] mb-1">Play as Black</h3>
                  <p className="text-sm text-[#a0a0a0]">Make all moves</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main play screen
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => setPlayerColor(null)}
          className="mb-6 text-[#a0a0a0] hover:text-[#d4a853] transition-colors flex items-center gap-2"
        >
          <span>←</span> Back
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Board section */}
          <div className="flex-1">
            <ChessBoard
              fen={game.fen()}
              onMove={handleMove}
              orientation={playerColor === 'b' ? 'black' : 'white'}
              interactive={!gameEnded}
            />
          </div>

          {/* Info panel */}
          <div className="lg:w-96 space-y-6">
            {/* Header */}
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-2xl text-[#d4a853]">Open Play</h2>
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full ${playerColor === 'w' ? 'bg-[#f5f5f5]' : 'bg-[#2a2a2a] border border-[#444]'}`} />
                  <span className="text-sm text-[#a0a0a0]">
                    {playerColor === 'w' ? 'White' : 'Black'}
                  </span>
                </div>
              </div>

              {/* Move history display */}
              {moveHistory.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm text-[#a0a0a0] mb-2">Your Moves</h3>
                  <div className="flex flex-wrap gap-2">
                    {moveHistory.map((move, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded text-sm bg-[#d4a853]/20 text-[#d4a853]"
                      >
                        {i % 2 === 0 && <span className="text-[#666666] mr-1">{Math.floor(i/2) + 1}.</span>}
                        {move}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full py-2 px-4 rounded-lg bg-transparent border border-[#333333] text-[#a0a0a0] hover:border-[#d4a853] hover:text-[#d4a853] transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Game ended states */}
            {gameEnded === 'matched' && matchedOpening && (
              <div className="bg-[#1a1a1a] border-2 border-[#4ade80] rounded-lg p-6 fade-in">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-[#4ade80] font-medium text-lg">Opening Complete!</p>
                </div>
                <div className="bg-[#252525] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-serif text-xl text-[#f5f5f5]">{matchedOpening.name}</h3>
                    <span className="text-xs text-[#a0a0a0] bg-[#333] px-2 py-1 rounded">{matchedOpening.eco}</span>
                  </div>
                  <p className="text-sm text-[#a0a0a0]">{matchedOpening.description}</p>
                </div>
              </div>
            )}

            {gameEnded === 'no-match' && (
              <div className="bg-[#1a1a1a] border-2 border-[#ef4444] rounded-lg p-6 fade-in">
                <div className="text-center mb-2">
                  <div className="text-4xl mb-2">❌</div>
                  <p className="text-[#ef4444] font-medium text-lg">Off Book!</p>
                  <p className="text-sm text-[#a0a0a0] mt-2">
                    This move sequence doesn't match any known opening in the database.
                  </p>
                </div>
              </div>
            )}

            {/* Matching openings panel - only show after first move and before game ends */}
            {moveHistory.length > 0 && !gameEnded && (
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 fade-in">
                <h3 className="text-sm text-[#a0a0a0] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                  Possible Openings ({matchingOpenings.length})
                </h3>

                {matchingOpenings.length === 0 ? (
                  <p className="text-sm text-[#666666] italic">No matching openings</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {matchingOpenings.map((opening) => {
                      const isExact = opening.moves.length === moveHistory.length;
                      const remaining = opening.moves.length - moveHistory.length;
                      
                      return (
                        <div
                          key={opening.id}
                          className={`
                            p-3 rounded-lg border transition-all
                            ${isExact 
                              ? 'bg-[#4ade80]/10 border-[#4ade80]/50' 
                              : 'bg-[#252525] border-[#333333]'
                            }
                          `}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h4 className={`font-serif text-base ${isExact ? 'text-[#4ade80]' : 'text-[#f5f5f5]'}`}>
                              {opening.name}
                            </h4>
                            <span className="text-xs text-[#666666] bg-[#333] px-1.5 py-0.5 rounded">
                              {opening.eco}
                            </span>
                          </div>
                          <p className="text-xs text-[#666666] mb-2 line-clamp-1">{opening.description}</p>
                          <div className="flex items-center gap-2 text-xs">
                            {isExact ? (
                              <span className="text-[#4ade80] font-medium">✓ Exact match</span>
                            ) : (
                              <>
                                <span className="text-[#a0a0a0]">{remaining} more move{remaining !== 1 ? 's' : ''}</span>
                                <span className="text-[#666666]">→</span>
                                <span className="text-[#d4a853] font-mono">{opening.moves[moveHistory.length]}</span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Initial state - no moves yet */}
            {moveHistory.length === 0 && (
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6">
                <div className="text-center text-[#666666]">
                  <div className="text-3xl mb-3 opacity-50">♟</div>
                  <p className="text-sm">Make your first move to see matching openings</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

