import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import GameDeck from "./components/GameDeck";
import Login from "./components/Login";
import "./main.scss";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <GameDeck />,
      },
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },
]);

const rootElement = document.getElementById("root");
if (rootElement !== null) {
  ReactDOM.createRoot(rootElement).render(<RouterProvider router={router} />);
} else {
  console.error("Root element not found");
}
