import React, { createContext, useState, ReactNode, useEffect } from 'react';

interface GameContextType {
  score: number;
  setScore: (value: number) => void;
  gameStatus: boolean | null;
  setGameStatus: (value: boolean | null) => void;
  token: string | null;
  setToken: (value: string | null) => void;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

interface DummyProviderProps {
  children: ReactNode;
}

export const GameContextProvider: React.FC<DummyProviderProps> = ({ children }) => {
  const [score, setScore] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const tokenTimestamp = localStorage.getItem('tokenTimestamp');
    
    if (storedToken && tokenTimestamp) {
      const tokenAge = Date.now() - parseInt(tokenTimestamp, 10);
      const eightHoursInMilliseconds = 8 * 60 * 60 * 1000;

      if (tokenAge < eightHoursInMilliseconds) {
        setToken(storedToken);
      } else {
        //localStorage.removeItem('token');
        //localStorage.removeItem('tokenTimestamp');
      }
    }
  }, []);

  const customValues = {
    score,
    setScore,
    gameStatus,
    setGameStatus,
    token,
    setToken
  }

  return (
    <GameContext.Provider value={customValues}>
      {children}
    </GameContext.Provider>
  );
};