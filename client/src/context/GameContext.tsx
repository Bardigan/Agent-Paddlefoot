import React, { createContext, useState, ReactNode, useMemo, useCallback } from 'react';

interface GameContextType {
  colorMode: boolean;
  setColorMode: (value: boolean) => void;
  level: number;
  setLevel: (value: number) => void;
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

  return {
    token: storedToken,
    duration: remainingTime,
  };
};

const retriveColorMode = () => {
  const storedColorMode = localStorage.getItem("colorMode");
  if (storedColorMode === "true") {
    return true;
  }
  return false;
}

export const GameContextProvider: React.FC<DummyProviderProps> = ({ children }) => {
  const tokenData = useMemo(() => retriveStoredToken(), []);
  const colorModeData = useMemo(() => retriveColorMode(), []);

  let initialToken = null;

  if (tokenData) {
    initialToken = tokenData.token;
  }
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [colorMode, setColorMode] = useState<boolean>(colorModeData);
  const [gameStatus, setGameStatus] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(initialToken);

  const logoutHandler = useCallback(() => {
    setToken(null);
    setLevel(1);
    setScore(0);
    setGameStatus(null);
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

  const setColorModeHandler = (value: boolean) => {
    setColorMode(value);
    localStorage.setItem("colorMode", value.toString());
  }

  const customValues = {
    score,
    setScore,
    gameStatus,
    setGameStatus,
    login: loginHandler,
    logout: logoutHandler,
    token,
    setToken,
    level,
    setLevel,
    colorMode,
    setColorMode: setColorModeHandler,
  }

  return (
    <GameContext.Provider value={customValues}>
      {children}
    </GameContext.Provider>
  );
};