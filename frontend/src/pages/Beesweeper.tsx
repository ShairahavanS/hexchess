import React, { useState, useEffect, useRef } from "react";
import "./Beesweeper.css";
import Grid from "../Grid/Grid.tsx";
import MinesweeperInfoBoard from "../MinesweeperInfoBoard/MinesweeperInfoBoard.tsx";
import axios from "axios";
import { MineCellInfo } from "../Cell/MineCellInfo.tsx";
import { BACKEND_URL } from "../constants.ts";

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

  const [startTime, setStartTime] = useState<number | null>(null);

  // Replace entire board (start/reset)
  const replaceBoard = (newBoard: MineCellInfo[]) => {
    setBoard(newBoard);
  };

  // Merge only changed cells (click/flag)
  const mergeBoardChanges = (changedCells: MineCellInfo[]) => {
    setBoard((prev) => {
      const map = new Map(prev.map((c) => [c.key, c]));

      changedCells.forEach((cell) => {
        map.set(cell.key, cell); // overwrite changed cell
      });

      return Array.from(map.values());
    });
  };

  useEffect(() => {
    api.post("/beesweeper_api/start/", { level }).then((response) => {
      replaceBoard(response.data.board); // 🔴 replace, not merge
      setGameID(response.data.game_ID);
      setGameState(response.data.progress);
  
      if (response.data.flags !== undefined) {
        setFlags(response.data.flags);
      }
  
      setStartTime(response.data.progress === "IP" ? Date.now() : null);
    });
  }, [level]);

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
    setTime(0);
    setStartTime(null);
  }, [level]);

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

      setTime(0);
      setStartTime(null);
    }
  }, [gameState, level]);

  // TIMER EFFECT
  useEffect(() => {
    // Only run timer if game is in progress
    if (gameState !== "IP") {
      setStartTime(null); // stop timer if not in progress
      return;
    }

    // Record startTime if not already set
    if (!startTime) setStartTime(Date.now());

    // Tick every second
    const interval = setInterval(() => {
      if (startTime) {
        setTime(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);

    // Cleanup interval when effect re-runs or component unmounts
    return () => clearInterval(interval);
  }, [gameState, startTime]);

  const handleReset = () => {
    setTime(0);
  
    api.post(`/beesweeper_api/${gameID}/reset/`).then((response) => {
      replaceBoard(response.data.board); // 🔴 FULL RESET
      setGameID(response.data.game_ID);
      setGameState(response.data.progress);
      setFlags(response.data.flags ?? flags);
      setStartTime(response.data.progress === "IP" ? Date.now() : null);
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
            onUpdateBoard={mergeBoardChanges}
            onUpdateFlags={setFlags}
            onUpdateGameState={setGameState}
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
