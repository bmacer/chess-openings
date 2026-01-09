import { useState } from 'react';
import { ModeSelector } from './components/ModeSelector';
import { PlayMode } from './components/PlayMode';
import { QuizMode } from './components/QuizMode';
import { OpenPlayMode } from './components/OpenPlayMode';

function App() {
  const [currentMode, setCurrentMode] = useState(null);

  const handleSelectMode = (mode) => {
    setCurrentMode(mode);
  };

  const handleBack = () => {
    setCurrentMode(null);
  };

  if (currentMode === 'play') {
    return <PlayMode onBack={handleBack} />;
  }

  if (currentMode === 'open') {
    return <OpenPlayMode onBack={handleBack} />;
  }

  if (currentMode === 'quiz') {
    return <QuizMode onBack={handleBack} />;
  }

  return <ModeSelector onSelectMode={handleSelectMode} />;
}

export default App;
