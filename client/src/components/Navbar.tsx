import { useContext, useEffect, useState } from "react";
import { GameContext } from "../context/GameContext";
import {
  useSubmitScore,
  useGetBestScore,
  useGetAllBestScores,
} from "../api/Api";
import Button from "../lib/Button";
import Popup from "../lib/Popup";
import "./Navbar.scss";

export default function Navbar() {
  const context = useContext(GameContext);
  const [showPopup, setShowPopup] = useState(false);
  const [timer, setTimer] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [finalTimerResult, setFinalTimerResult] = useState<number | null>(null);

  const token = localStorage.getItem("token") || null;

  const {
    data,
    loading: loadingBestScore,
    error: errorBestScore,
    getBestScore,
  } = useGetBestScore(token);
  const { data: bestScoreData, getAllBestScores } = useGetAllBestScores(token);
  const { mutate: submitScoreMutate } = useSubmitScore(token);

  useEffect(() => {
    getBestScore();
  }, []);

  useEffect(() => {
    if (timer < 30000) {
      setTimer(0);
    }
  }, [context?.level]);

  useEffect(() => {
    if (timer > 30000) {
      context?.setGameStatus(false);
      setTimer(30000);
    }
  }, [timer]);

  // Update the best score when the game ends or the score changes
  useEffect(() => {
    if (data && !errorBestScore && !loadingBestScore) {
      const serverBestScore = data.bestScore || 0;

      if (context?.score && context.score > serverBestScore) {
        // Update the best score on the server
        setBestScore(context.score);
      } else {
        setBestScore(serverBestScore);
      }
    }
  }, [data, context?.score]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (context?.gameStatus === true) {
      // Game started
      setFinalTimerResult(null);
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 10);
      }, 10);
    } else if (context?.gameStatus === false) {
      // Game over
      setFinalTimerResult(timer);
      setTimer(0);
      // Submit the final score to the server and fetch the best score afterward
      if (context?.gameStatus === false && context?.score) {
        submitScoreMutate(context.score, {
          onSuccess: () => {
            getBestScore(); // Fetch the updated best score
          },
          onError: (error) => {
            console.error("Failed to submit score:", error);
          },
        });
      }
    } else if (context?.gameStatus === null) {
      // Game reset
      setFinalTimerResult(null);
      context?.setLevel(1);
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [context?.gameStatus, context?.score]);

  // Format the timer for display
  const formatTime = (time: number) => {
    const seconds = Math.floor(time / 1000);
    const milliseconds = time % 1000;
    return `${seconds}.${milliseconds.toString().padStart(3, "0")}s`;
  };

  return (
    <div className="navbar">
      <Popup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        title="The best scores"
      >
        <>
          <h2>Best scores</h2>
          <table className="popup__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>The best score</th>
              </tr>
            </thead>
            <tbody>
              {bestScoreData
                ?.sort((a: any, b: any) => b.bestScore - a.bestScore) // Sort scores in descending order
                .map((score: any, index: number) => (
                  <tr key={index}>
                    <td>{score.username}</td>
                    <td>{score.bestScore}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      </Popup>
      <nav className="navbar__container">
        <div className="navbar__timer">
          <span className="navbar__timer--text">Time: </span>
          <span
            className={`navbar__vt ${
              timer > 25000
                ? "navbar__vt--red"
                : timer > 15000
                ? "navbar__vt--yellow"
                : ""
            }`}
          >
            {finalTimerResult !== null
              ? formatTime(finalTimerResult)
              : formatTime(timer)}
          </span>
        </div>

        <Button
          className="outlinedBtn"
          children={<>Best score: {loadingBestScore ? "...loading" : " " + bestScore}</>}
          onClick={() => {
            setShowPopup(true);
            getAllBestScores();
          }}
        />

        <span className="navbar__score">
          Score: <span className="navbar__vt">{context?.score}</span>
        </span>
        <span>
          <Button
            className="outlinedBtn"
            text={"Color mode"}
            onClick={() => context?.setColorMode(!context.colorMode)}
          />
          <Button
            className="outlinedBtn"
            text={"Exit"}
            onClick={() => context?.logout()}
          />
        </span>
      </nav>
    </div>
  );
}
