export function ModeSelector({ onSelectMode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Background pattern */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #d4a853 25%, transparent 25%),
            linear-gradient(-45deg, #d4a853 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #d4a853 75%),
            linear-gradient(-45deg, transparent 75%, #d4a853 75%)
          `,
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px'
        }}
      />

      <div className="relative z-10 text-center max-w-2xl">
        {/* Logo/Title */}
        <div className="mb-12 fade-in">
          <div className="text-6xl mb-4">♔</div>
          <h1 className="font-serif text-5xl md:text-6xl text-[#d4a853] mb-4">
            Opening Trainer
          </h1>
          <p className="text-xl text-[#a0a0a0]">
            Master chess openings through interactive practice
          </p>
        </div>

        {/* Mode cards */}
        <div className="grid md:grid-cols-2 gap-6 fade-in stagger-2">
          {/* Play Mode */}
          <button
            onClick={() => onSelectMode('play')}
            className="group p-8 bg-[#1a1a1a] border-2 border-[#333333] rounded-xl text-left hover:border-[#d4a853] hover:bg-[#1f1f1f] transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-[#d4a853]/10"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">♟</div>
            <h2 className="font-serif text-2xl text-[#f5f5f5] mb-2">Play the Opening</h2>
            <p className="text-[#a0a0a0] text-sm leading-relaxed">
              Given an opening name, play the correct moves on the board. 
              Test your memory of opening sequences.
            </p>
            <div className="mt-4 flex items-center text-[#d4a853] text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Start practicing</span>
              <span className="ml-2">→</span>
            </div>
          </button>

          {/* Quiz Mode */}
          <button
            onClick={() => onSelectMode('quiz')}
            className="group p-8 bg-[#1a1a1a] border-2 border-[#333333] rounded-xl text-left hover:border-[#d4a853] hover:bg-[#1f1f1f] transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-[#d4a853]/10"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">♜</div>
            <h2 className="font-serif text-2xl text-[#f5f5f5] mb-2">Identify the Opening</h2>
            <p className="text-[#a0a0a0] text-sm leading-relaxed">
              Watch the moves play out and identify which opening it is.
              Flashcard-style learning with multiple choice.
            </p>
            <div className="mt-4 flex items-center text-[#d4a853] text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Start quiz</span>
              <span className="ml-2">→</span>
            </div>
          </button>
        </div>

        {/* Stats footer */}
        <div className="mt-12 text-center fade-in stagger-3">
          <p className="text-[#666666] text-sm">
            28 classic openings to master
          </p>
        </div>
      </div>
    </div>
  );
}


