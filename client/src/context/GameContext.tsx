import React, { createContext, useState, ReactNode, useMemo, useCallback } from 'react';

interface GameContextType {
  score: number;
  setScore: (value: number) => void;
  gameStatus: boolean | null;
  setGameStatus: (value: boolean | null) => void;
  token: string | null;
  setToken: (value: string | null) => void;
  login: (token: string, expirationTime: string, changePassword: boolean) => void;
  logout: () => void;
}

let logoutTimer:any;

export const GameContext = createContext<GameContextType | undefined>(undefined);

interface DummyProviderProps {
  children: ReactNode;
}

const calculateRemainingTime = (expirationTime:any) => {
  const formatedCurrentTime = new Date().getTime();
  const formatedExpirationTime = new Date(expirationTime).getTime();
  const remainingDuration = formatedExpirationTime - formatedCurrentTime;
  return remainingDuration;
};

const retriveStoredToken = () => {
  const storedToken = localStorage.getItem("token");
  const storedExpiration = localStorage.getItem("expirationTime");
  const remainingTime = calculateRemainingTime(storedExpiration);

  if (remainingTime <= 60000) {
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");
    return null;
  }
  // if we pass all the checks it means the token is still good enough

  return {
    token: storedToken,
    duration: remainingTime,
  };
};

export const GameContextProvider: React.FC<DummyProviderProps> = ({ children }) => {
  const tokenData = useMemo(() => retriveStoredToken(), []);
  let initialToken = null;

  if (tokenData) {
    initialToken = tokenData.token;
  }
  const [score, setScore] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(initialToken);

  const logoutHandler = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");
    
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  }, []);

  const loginHandler = (token:any, expirationTime:any, changePassword:any) => {
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("expirationTime", expirationTime);
    // formated

    if (changePassword === true) {
      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }
    }

    const remainingTime = calculateRemainingTime(expirationTime);
    logoutTimer = setTimeout(logoutHandler, remainingTime);
  };

  const customValues = {
    score,
    setScore,
    gameStatus,
    setGameStatus,
    login: loginHandler,
    logout: logoutHandler,
    token,
    setToken
  }

  return (
    <GameContext.Provider value={customValues}>
      {children}
    </GameContext.Provider>
  );
};