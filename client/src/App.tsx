import Navbar from "./components/Navbar";
import { GameContextProvider } from './context/GameContext';
import { useContext, useEffect } from "react";
import { GameContext } from './context/GameContext';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import GameDeck from "./components/GameDeck";
import Login from "./components/Login";
import './App.scss';

function Router() {
  const context = useContext(GameContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!context?.token) {
      navigate("/login");
    }
  }, [context?.token, navigate]);

  return (
    <>
      {context?.token && <Navbar />}
      <Routes>
        <Route path="/" element={!context?.token ? <Login /> : <GameDeck />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

const App = () => {
  return (
    <GameContextProvider>
      <BrowserRouter>
        <div className="wrapper">
          <Router />
        </div>
      </BrowserRouter>
    </GameContextProvider>
  );
};

export default App;

