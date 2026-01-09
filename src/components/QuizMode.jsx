import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from './ChessBoard';
import openingsData from '../data/openings.json';

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomOpenings(correctOpening, count = 4) {
  const others = openingsData.openings.filter(o => o.id !== correctOpening.id);
  const shuffled = shuffleArray(others).slice(0, count - 1);
  return shuffleArray([correctOpening, ...shuffled]);
}

// Pre-calculate all FEN positions for an opening
function calculatePositions(moves) {
  const game = new Chess();
  const positions = [game.fen()];
  for (const move of moves) {
    try {
      game.move(move);
      positions.push(game.fen());
    } catch (e) {
      break;
    }
  }
  return positions;
}

export function QuizMode({ onBack }) {
  const [boardOrientation, setBoardOrientation] = useState(null); // 'white' or 'black'
  const [currentOpening, setCurrentOpening] = useState(null);
  const [options, setOptions] = useState([]);
  const [positions, setPositions] = useState([]);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef(null);

  // Current FEN derived from positions array
  const fen = positions[currentPositionIndex] || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  // Generate a new question
  const generateQuestion = useCallback(() => {
    // Clear any existing animation
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    const randomIndex = Math.floor(Math.random() * openingsData.openings.length);
    const opening = openingsData.openings[randomIndex];
    const newOptions = getRandomOpenings(opening, 4);
    const newPositions = calculatePositions(opening.moves);
    
    setCurrentOpening(opening);
    setOptions(newOptions);
    setPositions(newPositions);
    setCurrentPositionIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setIsAnimating(true);
  }, []);

  // Initialize first question when orientation is selected
  useEffect(() => {
    if (!boardOrientation) return;
    generateQuestion();
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [generateQuestion, boardOrientation]);

  // Animate through positions using interval
  useEffect(() => {
    if (!isAnimating || positions.length === 0) return;

    // Start animation after a short delay
    const startDelay = setTimeout(() => {
      animationRef.current = setInterval(() => {
        setCurrentPositionIndex(prev => {
          const next = prev + 1;
          if (next >= positions.length) {
            clearInterval(animationRef.current);
            animationRef.current = null;
            setIsAnimating(false);
            return prev;
          }
          return next;
        });
      }, 600);
    }, 300);

    return () => {
      clearTimeout(startDelay);
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isAnimating, positions.length]);

  // Handle answer selection
  const handleSelectAnswer = (opening) => {
    if (selectedAnswer || isAnimating) return;
    
    setSelectedAnswer(opening);
    setShowAnswer(true);
    
    const isCorrect = opening.id === currentOpening.id;
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));
  };

  // Handle replay
  const handleReplay = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
    setCurrentPositionIndex(0);
    setIsAnimating(true);
  };

  // Move display - show moves up to current position (minus 1 since index 0 is starting position)
  const displayedMoves = currentOpening?.moves.slice(0, currentPositionIndex) || [];

  // Move notation for answer display
  const moveNotation = useMemo(() => {
    if (!currentOpening) return '';
    const moves = currentOpening.moves;
    let notation = '';
    for (let i = 0; i < moves.length; i++) {
      if (i % 2 === 0) {
        notation += `${Math.floor(i/2) + 1}. `;
      }
      notation += `${moves[i]} `;
    }
    return notation.trim();
  }, [currentOpening]);

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  // Board orientation selection screen
  if (!boardOrientation) {
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
            <h1 className="font-serif text-4xl text-[#d4a853] mb-2">Identify the Opening</h1>
            <p className="text-[#a0a0a0]">Watch the moves and identify the opening.</p>
          </div>

          <h2 className="font-serif text-2xl text-[#f5f5f5] text-center mb-8">Choose Board View</h2>

          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
            <button
              onClick={() => setBoardOrientation('white')}
              className="group p-6 bg-[#1a1a1a] border border-[#333333] rounded-lg hover:border-[#d4a853] hover:bg-[#252525] transition-all"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-[#f5f5f5] flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform">
                  ♔
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-xl text-[#f5f5f5] mb-1">White's View</h3>
                  <p className="text-sm text-[#a0a0a0]">White pieces at bottom</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setBoardOrientation('black')}
              className="group p-6 bg-[#1a1a1a] border border-[#333333] rounded-lg hover:border-[#d4a853] hover:bg-[#252525] transition-all"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-[#2a2a2a] flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform border border-[#444]">
                  ♚
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-xl text-[#f5f5f5] mb-1">Black's View</h3>
                  <p className="text-sm text-[#a0a0a0]">Black pieces at bottom</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setBoardOrientation(null)}
          className="mb-6 text-[#a0a0a0] hover:text-[#d4a853] transition-colors flex items-center gap-2"
        >
          <span>←</span> Back
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl text-[#d4a853] mb-2">Identify the Opening</h1>
            <p className="text-[#a0a0a0]">Watch the moves and identify the opening.</p>
          </div>
          
          {/* Stats */}
          <div className="flex gap-6 text-center">
            <div>
              <div className="text-2xl text-[#f5f5f5]">{stats.correct}/{stats.total}</div>
              <div className="text-xs text-[#a0a0a0]">Score</div>
            </div>
            <div>
              <div className="text-2xl text-[#d4a853]">{accuracy}%</div>
              <div className="text-xs text-[#a0a0a0]">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl text-[#4ade80]">{stats.streak}</div>
              <div className="text-xs text-[#a0a0a0]">Streak</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Board section */}
          <div className="flex-1">
            <ChessBoard
              fen={fen}
              orientation={boardOrientation}
              interactive={false}
            />
            
            {/* Move notation */}
            <div className="mt-4 p-4 bg-[#1a1a1a] border border-[#333333] rounded-lg">
              <p className="text-sm text-[#a0a0a0] mb-2">Moves played:</p>
              <p className="text-[#f5f5f5] font-mono min-h-[1.5rem]">
                {displayedMoves.map((move, i) => (
                  <span key={i} className="mr-1">
                    {i % 2 === 0 && <span className="text-[#666666]">{Math.floor(i/2) + 1}.</span>}
                    <span className="text-[#d4a853]">{move}</span>
                  </span>
                ))}
                {isAnimating && <span className="animate-pulse text-[#666666]">|</span>}
              </p>
            </div>
          </div>

          {/* Options panel */}
          <div className="lg:w-80 space-y-4">
            <h3 className="text-lg text-[#a0a0a0] mb-4">Which opening is this?</h3>
            
            {options.map((option, index) => {
              const isCorrectAnswer = showAnswer && option.id === currentOpening?.id;
              const isWrongSelection = showAnswer && selectedAnswer?.id === option.id && option.id !== currentOpening?.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={showAnswer || isAnimating}
                  className={`
                    w-full p-4 rounded-lg border text-left transition-all fade-in
                    ${isCorrectAnswer 
                      ? 'bg-[#4ade80]/20 border-[#4ade80] text-[#4ade80]' 
                      : isWrongSelection
                        ? 'bg-[#ef4444]/20 border-[#ef4444] text-[#ef4444]'
                        : showAnswer
                          ? 'bg-[#1a1a1a] border-[#333333] text-[#666666] opacity-50'
                          : 'bg-[#1a1a1a] border-[#333333] text-[#f5f5f5] hover:border-[#d4a853] hover:bg-[#252525]'
                    }
                    ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg">{option.name}</span>
                    <span className="text-xs bg-[#252525] px-2 py-1 rounded">{option.eco}</span>
                  </div>
                </button>
              );
            })}

            {/* Result and next button */}
            {showAnswer && (
              <div className="space-y-4 fade-in mt-6">
                {selectedAnswer?.id === currentOpening?.id ? (
                  <div className="text-center py-4">
                    <div className="text-3xl mb-2">✓</div>
                    <p className="text-[#4ade80] font-medium">Correct!</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-3xl mb-2">✗</div>
                    <p className="text-[#ef4444] font-medium mb-2">Incorrect</p>
                    <p className="text-sm text-[#a0a0a0]">
                      It was the <span className="text-[#d4a853]">{currentOpening?.name}</span>
                    </p>
                  </div>
                )}

                <div className="p-4 bg-[#1a1a1a] border border-[#333333] rounded-lg">
                  <h4 className="font-serif text-lg text-[#d4a853] mb-2">{currentOpening?.name}</h4>
                  <p className="text-sm text-[#a0a0a0] mb-2">{currentOpening?.description}</p>
                  <p className="text-xs text-[#666666] font-mono">{moveNotation}</p>
                </div>

                <button
                  onClick={generateQuestion}
                  className="w-full py-3 px-4 rounded-lg bg-[#d4a853] text-[#0f0f0f] font-medium hover:bg-[#e5b964] transition-colors"
                >
                  Next Question →
                </button>
              </div>
            )}

            {/* Replay button */}
            {!isAnimating && !showAnswer && (
              <button
                onClick={handleReplay}
                className="w-full py-2 px-4 rounded-lg bg-transparent border border-[#333333] text-[#a0a0a0] hover:border-[#d4a853] hover:text-[#d4a853] transition-colors"
              >
                Replay Moves
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
