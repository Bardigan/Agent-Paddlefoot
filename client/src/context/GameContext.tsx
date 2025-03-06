import React, { createContext, useState, ReactNode } from 'react';

interface GameContextType {
  score: number;
  setScore: (value: number) => void;
  gameStatus: boolean | null;
  setGameStatus: (value: boolean | null) => void;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

interface DummyProviderProps {
  children: ReactNode;
}

export const GameContextProvider: React.FC<DummyProviderProps> = ({ children }) => {
  const [score, setScore] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<boolean | null>(null);

  const customValues = {
    score,
    setScore,
    gameStatus,
    setGameStatus
  }

  return (
    <GameContext.Provider value={customValues}>
      {children}
    </GameContext.Provider>
  );
};