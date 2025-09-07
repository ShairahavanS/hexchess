import React, { useState, useEffect, useRef } from "react";
import "./Beesweeper.css";
import Grid from "../Grid/Grid.tsx";
import MinesweeperInfoBoard from "../MinesweeperInfoBoard/MinesweeperInfoBoard.tsx";
import axios from "axios";
import { MineCellInfo } from "../Cell/MineCellInfo.tsx";

const BACKEND_URL = "https://hexagonal-games-backend.onrender.com"; // replace with your Render URL

export const api = axios.create({
  baseURL: BACKEND_URL,
});

interface BeesweeperProps {
  darkMode: boolean;
}

const Beesweeper: React.FC<BeesweeperProps> = ({ darkMode }) => {
  const [level, setLevel] = useState("Easy");
  const [sides, setSides] = useState(6);
  const [flags, setFlags] = useState(18);
  const [time, setTime] = useState(0);
  const [board, setBoard] = useState<MineCellInfo[]>([]);
  const [gameID, setGameID] = useState<string>("");
  const [gameState, setGameState] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api
      .post("/beesweeper_api/start/", { level })
      .then((response) => {
        console.log("Start Response:", response.data);
        setBoard(response.data.board);
        setGameID(response.data.game_ID);
        setGameState(response.data.progress);
        if (response.data.flags !== undefined) {
          setFlags(response.data.flags);
        }
      })
      .catch((error) => {
        console.error(
          "Error starting game:",
          error.response ? error.response.data : error.message
        );
      });
  }, [level]);

  useEffect(() => {
    if (gameState === "IP") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    // Stop timer when game ends
    if (gameState === "WIN" || gameState === "LOSS") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    // Reset timer when game not started or level changes
    if (gameState === "NS") {
      setTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    if (gameState === "IP") {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState]);

  useEffect(() => {
    switch (level) {
      case "Easy":
        setSides(6);
        setFlags(18);
        break;
      case "Medium":
        setSides(10);
        setFlags(54);
        break;
      case "Hard":
        setSides(16);
        setFlags(144);
        break;
      case "Extreme":
        setSides(24);
        setFlags(331);
        break;
      case "Impossible":
        setSides(50);
        setFlags(1470);
        break;
      default:
        setSides(6);
        setFlags(18);
    }
  }, [level]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameID && gameState !== "WIN" && gameState !== "LOST") {
        api
          .get(`/beesweeper_api/${gameID}/single/`)
          .then((response) => {
            setGameState(response.data.progress);
          })
          .catch(console.error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameID, gameState]);

  useEffect(() => {
    if (gameState === "NS") {
      switch (level) {
        case "Easy":
          setFlags(18);
          setTime(0);
          break;
        case "Medium":
          setFlags(54);
          setTime(0);
          break;
        case "Hard":
          setFlags(144);
          setTime(0);
          break;
        case "Extreme":
          setFlags(331);
          setTime(0);
          break;
        case "Impossible":
          setFlags(1470);
          setTime(0);
          break;
        default:
          setFlags(18);
          setTime(0);
      }
    }
  }, [gameState, level]);

  const handleReset = () => {
    setTime(0);
    console.log("Game Reset");

    api
      .post(`/beesweeper_api/${gameID}/reset/`)
      .then((response) => {
        console.log("Start Response:", response.data);
        setBoard(response.data.board);
        setGameID(response.data.game_ID);
        setGameState(response.data.progress);
        if (response.data.flags !== undefined) {
          setFlags(response.data.flags);
        }
      })
      .catch((error) => {
        console.error(
          "Error starting game:",
          error.response ? error.response.data : error.message
        );
      });
  };

  let ratio = ((2 * sides - 1) / (3 * sides - 1)) * Math.sqrt(3);
  let height = 90;
  let width = height / ratio;

  return (
    <div className={`board-complete ${darkMode ? "dark" : "light"}`}>
      <div
        className="grid-area"
        style={{
          width: `${width}vmin`,
          height: `100%`,
        }}
      >
        <div className="Beesweeper" onContextMenu={(e) => e.preventDefault()}>
          <Grid
            sideLength={sides}
            level={level}
            game_ID={gameID}
            board={board}
            onUpdateBoard={setBoard}
            onUpdateFlags={setFlags}
          />
        </div>
      </div>
      <div className="infoBoard">
        <MinesweeperInfoBoard
          level={level}
          setLevel={setLevel}
          flagsLeft={flags}
          onReset={handleReset}
          time={time}
        />
      </div>
      <div>
        <h2 style={{ color: "white" }}>{}</h2>
      </div>
    </div>
  );
};

export default Beesweeper;
