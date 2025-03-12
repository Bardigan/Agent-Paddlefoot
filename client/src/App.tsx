import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import { GameContextProvider } from './context/GameContext';
import { useContext } from "react";
import { GameContext } from './context/GameContext';
import { useEffect } from 'react';
import './App.scss';

const AppWrapper = () => {
  const context = useContext(GameContext);
  
  useEffect(() => {
      const storedToken = localStorage.getItem('token');
      const tokenTimestamp = localStorage.getItem('tokenTimestamp');
      if (storedToken && tokenTimestamp) {
        context?.setToken(storedToken);
      }
    }, []);

  return (
    <>
      {context?.token && <Navbar />}
      <Outlet />
    </>
  );
};

const App = () => {
  return (
    <GameContextProvider>
      <div className="wrapper">
        <AppWrapper />
      </div>
    </GameContextProvider>
  );
};
export default App;

