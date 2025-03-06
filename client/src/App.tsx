import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import { GameContextProvider } from './context/GameContext';
import './App.scss';

const App = () => {
  return (
    <GameContextProvider>
      <div className="wrapper">
        <Navbar />
        <Outlet />
      </div>
    </GameContextProvider>
  );
};
export default App;

